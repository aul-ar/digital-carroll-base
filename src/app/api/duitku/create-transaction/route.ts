import { randomUUID } from "node:crypto";
import {
  buildDuitkuCreateInvoiceSignature,
  createMerchantOrderId,
  DuitkuTransactionPayload,
  EWalletProvider,
  getDuitkuConfig,
  isEWalletProvider,
  mapPaymentMethodToDuitkuCode,
  normalizePhoneNumber,
  validateDuitkuRequestPayload,
} from "@/lib/duitku";
import { sendAdminOrderCreatedEmail } from "@/lib/admin-email";
import { pricingPlans } from "@/data/pricing";
import { createInvoiceExpiresAt, parsePackagePrice } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import {
  PaymentMethod,
  Prisma,
  type Invoice,
  type Order,
  type Payment,
} from "@prisma/client";
import { after } from "next/server";

type DuitkuErrorCode =
  | "MISSING_DUITKU_ENV"
  | "INVALID_PAYMENT_METHOD"
  | "DUITKU_REQUEST_FAILED"
  | "PAYMENT_ALREADY_COMPLETED"
  | "PAYMENT_PREPARING"
  | "UNKNOWN_ERROR"
  | "VALIDATION_ERROR";

interface DuitkuCreateInvoiceResponse {
  merchantCode?: string;
  reference?: string;
  paymentUrl?: string;
  vaNumber?: string;
  qrString?: string;
  amount?: string | number;
  statusCode?: string;
  statusMessage?: string;
  Message?: string;
}

type DuitkuTransactionPayloadWithMeta = DuitkuTransactionPayload & {
  planId?: string;
  businessName?: string;
  notes?: string;
};

type ExistingPaymentRecord = Payment & {
  order: Order & {
    invoice: Invoice | null;
  };
};

const paymentPreparationProviderPrefix = "duitku:preparing:";
const paymentPreparationLockMs = 2 * 60 * 1000;
const paymentPreparationWaitMs = 8 * 1000;
const paymentPreparationPollMs = 400;

function getSelectedPricingPlan(planId: unknown) {
  if (typeof planId !== "string" || !planId.trim()) {
    return null;
  }

  return pricingPlans.find((plan) => plan.id === planId) ?? null;
}

function normalizeEWalletProvider(
  paymentMethod: DuitkuTransactionPayload["paymentMethod"] | undefined,
  ewalletProvider: unknown
):
  | { valid: true; provider?: EWalletProvider }
  | { valid: false; message: string } {
  if (paymentMethod !== "ewallet") {
    return { valid: true };
  }

  if (
    ewalletProvider === undefined ||
    ewalletProvider === null ||
    ewalletProvider === ""
  ) {
    return { valid: true, provider: "ovo" };
  }

  if (isEWalletProvider(ewalletProvider)) {
    return { valid: true, provider: ewalletProvider };
  }

  return {
    valid: false,
    message:
      "Provider e-wallet harus salah satu dari ovo, shopeepay, atau linkaja.",
  };
}

function mapPaymentMethodToPrisma(
  method: DuitkuTransactionPayload["paymentMethod"]
): PaymentMethod {
  switch (method) {
    case "virtual_account":
      return "VIRTUAL_ACCOUNT";
    case "qris":
      return "QRIS";
    case "ewallet":
      return "EWALLET";
    case "bank_transfer_manual":
      return "BANK_TRANSFER_MANUAL";
    case "ewallet_manual":
      return "EWALLET_MANUAL";
    default:
      throw new Error(`Unsupported payment method: ${method}`);
  }
}

async function readDuitkuResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {} as DuitkuCreateInvoiceResponse;
  }

  try {
    return JSON.parse(text) as DuitkuCreateInvoiceResponse;
  } catch {
    return { statusMessage: text };
  }
}

function getSafeStatusMessage(response: DuitkuCreateInvoiceResponse) {
  return (
    response.statusMessage ??
    response.Message ??
    "Duitku tidak mengembalikan pesan detail."
  );
}

function logDuitkuError(input: {
  code: DuitkuErrorCode;
  httpStatus?: number;
  statusMessage?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  duitkuPaymentMethodCode?: string | null;
}) {
  console.error("Duitku transaction error", input);
}

function isUniqueConstraintError(reason: unknown) {
  return (
    reason instanceof Prisma.PrismaClientKnownRequestError &&
    reason.code === "P2002"
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toExistingPaymentRecord(
  order: Order & {
    invoice: Invoice | null;
    payment: Payment | null;
  }
): ExistingPaymentRecord | null {
  if (!order.payment) {
    return null;
  }

  const { invoice, payment, ...orderFields } = order;

  return {
    ...payment,
    order: {
      ...orderFields,
      invoice,
    },
  };
}

async function findExistingPaymentRecord(input: {
  orderId: string;
  invoiceId: string;
  merchantOrderId: string;
}) {
  const paymentByMerchantOrderId = await prisma.payment.findFirst({
    where: {
      merchantOrderId: input.merchantOrderId,
    },
    include: {
      order: {
        include: {
          invoice: true,
        },
      },
    },
  });

  if (paymentByMerchantOrderId) {
    return paymentByMerchantOrderId;
  }

  const order = await prisma.order.findUnique({
    where: {
      orderId: input.orderId,
    },
    include: {
      invoice: true,
      payment: true,
    },
  });

  const paymentByOrderId = order ? toExistingPaymentRecord(order) : null;

  if (paymentByOrderId) {
    return paymentByOrderId;
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      invoiceId: input.invoiceId,
    },
    include: {
      order: {
        include: {
          invoice: true,
          payment: true,
        },
      },
    },
  });

  return invoice ? toExistingPaymentRecord(invoice.order) : null;
}

function isInvoicePendingAndNotExpired(
  invoice: Invoice | null,
  now = new Date()
) {
  return (
    invoice?.status === "PENDING" &&
    (!invoice.expiresAt || invoice.expiresAt > now)
  );
}

function isExistingPaymentPaid(payment: ExistingPaymentRecord) {
  return (
    payment.status === "PAID" ||
    payment.order.status === "PAID" ||
    payment.order.invoice?.status === "PAID"
  );
}

function getExistingProviderPaymentUrl(payment: ExistingPaymentRecord) {
  const paymentUrl = payment.providerPaymentUrl?.trim();
  return paymentUrl || null;
}

function hasUsableExistingPaymentResponse(
  payment: ExistingPaymentRecord,
  now = new Date()
) {
  if (
    payment.status !== "PENDING" ||
    !isInvoicePendingAndNotExpired(payment.order.invoice, now)
  ) {
    return false;
  }

  return Boolean(
    getExistingProviderPaymentUrl(payment) ||
      payment.providerReference?.trim() ||
      payment.vaNumber?.trim() ||
      payment.qrString?.trim()
  );
}

function isPaymentPreparationProvider(provider: string | null) {
  return Boolean(provider?.startsWith(paymentPreparationProviderPrefix));
}

function isActivePaymentPreparation(
  payment: ExistingPaymentRecord,
  now = new Date()
) {
  return (
    isPaymentPreparationProvider(payment.provider) &&
    now.getTime() - payment.updatedAt.getTime() < paymentPreparationLockMs
  );
}

function buildExistingPaymentResponse(
  payment: ExistingPaymentRecord,
  environment: "mock" | "production"
) {
  const paymentUrl = getExistingProviderPaymentUrl(payment);

  return {
    success: true,
    provider: "duitku",
    environment,
    paymentUrl,
    redirectUrl: paymentUrl,
    data: {
      reference: payment.providerReference ?? undefined,
      paymentUrl,
      vaNumber: payment.vaNumber ?? undefined,
      qrString: payment.qrString ?? undefined,
      merchantOrderId: payment.merchantOrderId ?? payment.order.orderId,
      invoiceId: payment.order.invoice?.invoiceId,
      orderId: payment.order.orderId,
    },
  };
}

function buildAlreadyPaidResponse(payment: ExistingPaymentRecord) {
  return {
    success: false,
    code: "PAYMENT_ALREADY_COMPLETED" satisfies DuitkuErrorCode,
    message: "Pembayaran untuk invoice ini sudah selesai.",
    data: {
      reference: payment.providerReference ?? undefined,
      merchantOrderId: payment.merchantOrderId ?? payment.order.orderId,
      invoiceId: payment.order.invoice?.invoiceId,
      orderId: payment.order.orderId,
    },
  };
}

async function waitForExistingPaymentResolution(input: {
  orderId: string;
  invoiceId: string;
  merchantOrderId: string;
}) {
  const waitStartedAt = Date.now();

  while (Date.now() - waitStartedAt < paymentPreparationWaitMs) {
    await sleep(paymentPreparationPollMs);

    const existingPayment = await findExistingPaymentRecord(input);

    if (!existingPayment) {
      return null;
    }

    if (
      isExistingPaymentPaid(existingPayment) ||
      hasUsableExistingPaymentResponse(existingPayment) ||
      !isActivePaymentPreparation(existingPayment)
    ) {
      return existingPayment;
    }
  }

  return findExistingPaymentRecord(input);
}

async function claimPaymentPreparation(input: {
  paymentId: string;
  paymentMethod: PaymentMethod;
  merchantOrderId: string;
  paymentCode: string;
  amount: number;
}) {
  const provider = `${paymentPreparationProviderPrefix}${randomUUID()}`;
  const staleBefore = new Date(Date.now() - paymentPreparationLockMs);
  const result = await prisma.payment.updateMany({
    where: {
      id: input.paymentId,
      providerPaymentUrl: null,
      status: {
        not: "PAID",
      },
      OR: [
        {
          provider: "duitku",
        },
        {
          provider: null,
        },
        {
          provider: {
            startsWith: paymentPreparationProviderPrefix,
          },
          updatedAt: {
            lt: staleBefore,
          },
        },
      ],
    },
    data: {
      status: "PENDING",
      paymentMethod: input.paymentMethod,
      provider,
      merchantOrderId: input.merchantOrderId,
      paymentCode: input.paymentCode,
      amount: input.amount,
    },
  });

  return result.count > 0 ? provider : null;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let claimedPaymentId: string | null = null;
  let claimedPaymentProvider: string | null = null;
  type TimingEntry = {
    seq: number;
    stage: string;
    elapsedMs: number;
    deltaMs: number;
    timestamp: string;
    extra?: Record<string, unknown>;
  };

  const timings: TimingEntry[] = [];
  let previousTimingAt = startedAt;

  const logTiming = (stage: string, extra?: Record<string, unknown>) => {
    const now = Date.now();

    timings.push({
      seq: timings.length + 1,
      stage,
      elapsedMs: now - startedAt,
      deltaMs: now - previousTimingAt,
      timestamp: new Date(now).toISOString(),
      ...(extra ? { extra } : {}),
    });

    previousTimingAt = now;
  };

  const flushTimingSummary = (
    finalStage: string,
    extra?: Record<string, unknown>
  ) => {
    logTiming(finalStage, extra);

    console.error("[TIMING SUMMARY] create-transaction", {
      route: "create-transaction",
      finalStage,
      totalElapsedMs: Date.now() - startedAt,
      environment: process.env.NODE_ENV,
      timings,
    });
  };

  logTiming("request_received");

  try {
    const body =
      (await request.json()) as Partial<DuitkuTransactionPayloadWithMeta>;
    logTiming("body_parsed");

    const selectedPlan = getSelectedPricingPlan(body.planId);

    if (!selectedPlan) {
      logDuitkuError({
        code: "VALIDATION_ERROR",
        statusMessage: "Plan checkout tidak ditemukan di pricingPlans.",
        paymentMethod: body.paymentMethod,
      });

      flushTimingSummary("plan_validation_failed", {
        reason: "selected_plan_not_found",
        paymentMethod: body.paymentMethod ?? null,
      });
      return Response.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Plan checkout tidak ditemukan. Silakan pilih paket dari halaman harga.",
        },
        { status: 400 }
      );
    }

    const selectedAmount = parsePackagePrice(selectedPlan.price);

    if (selectedAmount <= 0) {
      logDuitkuError({
        code: "VALIDATION_ERROR",
        statusMessage: "Plan checkout tidak memiliki nominal pembayaran.",
        paymentMethod: body.paymentMethod,
      });

      flushTimingSummary("plan_validation_failed", {
        reason: "invalid_selected_amount",
        planId: selectedPlan.id,
      });
      return Response.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message:
            "Paket ini belum memiliki nominal pembayaran otomatis. Silakan konsultasi terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    logTiming("plan_validated");

    const normalizedBody: Partial<DuitkuTransactionPayloadWithMeta> = {
      ...body,
      packageName: selectedPlan.name,
      packageDescription: selectedPlan.description,
      amount: selectedAmount,
    };

    const ewalletProvider = normalizeEWalletProvider(
      normalizedBody.paymentMethod,
      normalizedBody.ewalletProvider
    );

    if (!ewalletProvider.valid) {
      logDuitkuError({
        code: "VALIDATION_ERROR",
        statusMessage: ewalletProvider.message,
        paymentMethod: normalizedBody.paymentMethod,
      });

      flushTimingSummary("ewallet_provider_validation_failed", {
        paymentMethod: normalizedBody.paymentMethod ?? null,
        message: ewalletProvider.message,
      });
      return Response.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: ewalletProvider.message,
        },
        { status: 400 }
      );
    }

    if (ewalletProvider.provider) {
      normalizedBody.ewalletProvider = ewalletProvider.provider;
    }

    const validation = validateDuitkuRequestPayload(normalizedBody);

    if (!validation.valid) {
      const code =
        validation.code === "INVALID_PAYMENT_METHOD"
          ? "INVALID_PAYMENT_METHOD"
          : "VALIDATION_ERROR";

      logDuitkuError({
        code,
        statusMessage: validation.message,
        paymentMethod: normalizedBody.paymentMethod,
      });

      flushTimingSummary("payload_validation_failed", {
        code,
        message: validation.message,
        paymentMethod: normalizedBody.paymentMethod ?? null,
      });
      return Response.json(
        {
          success: false,
          code,
          message: validation.message,
        },
        { status: 400 }
      );
    }

    logTiming("payload_validated");

    const config = getDuitkuConfig();

    if (!config.merchantCode || !config.apiKey) {
      logDuitkuError({ code: "MISSING_DUITKU_ENV" });

      flushTimingSummary("config_failed", {
        reason: "missing_duitku_config",
        merchantCodeConfigured: Boolean(config.merchantCode),
        apiKeyConfigured: Boolean(config.apiKey),
      });
      return Response.json(
        {
          success: false,
          code: "MISSING_DUITKU_ENV",
          message: "Konfigurasi Duitku belum lengkap di server.",
        },
        { status: 500 }
      );
    }

    logTiming("config_loaded");

    const payload = normalizedBody as DuitkuTransactionPayloadWithMeta;
    const merchantOrderId = createMerchantOrderId(payload.orderId);
    const duitkuPaymentMethodCode = mapPaymentMethodToDuitkuCode(
      payload.paymentMethod,
      payload.ewalletProvider
    );
    const prismaPaymentMethod = mapPaymentMethodToPrisma(payload.paymentMethod);
    const expiresAt = createInvoiceExpiresAt();

    if (!duitkuPaymentMethodCode) {
      logDuitkuError({
        code: "INVALID_PAYMENT_METHOD",
        merchantOrderId,
        paymentMethod: payload.paymentMethod,
        duitkuPaymentMethodCode,
      });

      flushTimingSummary("payment_code_failed", {
        paymentMethod: payload.paymentMethod,
        ewalletProvider: payload.ewalletProvider ?? null,
        duitkuPaymentMethodCode,
      });
      return Response.json(
        {
          success: false,
          code: "INVALID_PAYMENT_METHOD",
          message: "Metode pembayaran ini belum aktif di Duitku Production.",
        },
        { status: 400 }
      );
    }

    logTiming("payment_code_resolved", {
      paymentMethod: payload.paymentMethod,
      ewalletProvider: payload.ewalletProvider ?? null,
      duitkuPaymentMethodCode,
    });

    logTiming("idempotency_precheck_start");
    const existingPaymentBeforeWrite = await findExistingPaymentRecord({
      orderId: payload.orderId,
      invoiceId: payload.invoiceId,
      merchantOrderId,
    });

    if (existingPaymentBeforeWrite) {
      if (isExistingPaymentPaid(existingPaymentBeforeWrite)) {
        console.info("[PAYMENT IDEMPOTENCY] existing_paid_invoice", {
          orderId: payload.orderId,
          invoiceId: payload.invoiceId,
          merchantOrderId,
          paymentId: existingPaymentBeforeWrite.id,
        });

        flushTimingSummary("idempotency_existing_paid_invoice", {
          orderId: payload.orderId,
          invoiceId: payload.invoiceId,
          merchantOrderId,
        });
        return Response.json(
          buildAlreadyPaidResponse(existingPaymentBeforeWrite),
          { status: 409 }
        );
      }

      if (hasUsableExistingPaymentResponse(existingPaymentBeforeWrite)) {
        console.info("[PAYMENT IDEMPOTENCY] existing_payment_url_returned", {
          orderId: payload.orderId,
          invoiceId: payload.invoiceId,
          merchantOrderId,
          paymentId: existingPaymentBeforeWrite.id,
        });

        flushTimingSummary("idempotency_existing_payment_url_returned", {
          orderId: payload.orderId,
          invoiceId: payload.invoiceId,
          merchantOrderId,
        });
        return Response.json(
          buildExistingPaymentResponse(
            existingPaymentBeforeWrite,
            config.mockEnabled ? "mock" : "production"
          )
        );
      }
    }

    logTiming("idempotency_precheck_done", {
      existingPaymentFound: Boolean(existingPaymentBeforeWrite),
    });

    logTiming("database_start");

    // Critical before Duitku: persist the order/payment skeleton so callbacks can
    // resolve by merchantOrderId even if Duitku calls back very quickly.
    const orderData = {
      status: "WAITING_PAYMENT" as const,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerWhatsapp: payload.customerWhatsapp,
      businessName: payload.businessName ?? null,
      packageName: payload.packageName,
      packageDescription: payload.packageDescription,
      quantity: 1,
      price: payload.amount,
      subtotal: payload.amount,
      total: payload.amount,
      notes: payload.notes ?? null,
    };
    let isNewOrder = false;
    let order: Order;

    try {
      order = await prisma.order.create({
        data: {
          orderId: payload.orderId,
          ...orderData,
        },
      });
      isNewOrder = true;
    } catch (reason) {
      if (!isUniqueConstraintError(reason)) {
        throw reason;
      }

      await prisma.order.updateMany({
        where: {
          orderId: payload.orderId,
          status: {
            not: "PAID",
          },
        },
        data: orderData,
      });

      const existingOrder = await prisma.order.findUnique({
        where: {
          orderId: payload.orderId,
        },
      });

      if (!existingOrder) {
        throw new Error("Existing order could not be loaded.");
      }

      order = existingOrder;
    }

    let invoice: Invoice;
    let paymentRecord: Payment | null = null;

    try {
      invoice = await prisma.invoice.create({
        data: {
          invoiceId: payload.invoiceId,
          status: "PENDING",
          paymentMethod: prismaPaymentMethod,
          expiresAt,
          orderIdRef: order.id,
        },
      });
    } catch (reason) {
      if (!isUniqueConstraintError(reason)) {
        throw reason;
      }

      await prisma.invoice.updateMany({
        where: {
          invoiceId: payload.invoiceId,
          status: {
            not: "PAID",
          },
        },
        data: {
          status: "PENDING",
          paymentMethod: prismaPaymentMethod,
          paidAt: null,
          expiresAt,
        },
      });

      const existingInvoice = await prisma.invoice.findUnique({
        where: {
          invoiceId: payload.invoiceId,
        },
      });

      if (!existingInvoice) {
        throw new Error("Existing invoice could not be loaded.");
      }

      invoice = existingInvoice;
    }

    paymentRecord = await prisma.payment.findUnique({
      where: {
        orderIdRef: order.id,
      },
    });

    if (!paymentRecord) {
      try {
        paymentRecord = await prisma.payment.create({
          data: {
            status: "PENDING",
            paymentMethod: prismaPaymentMethod,
            provider: "duitku",
            merchantOrderId,
            paymentCode: duitkuPaymentMethodCode,
            amount: payload.amount,
            orderIdRef: order.id,
          },
        });
      } catch (reason) {
        if (!isUniqueConstraintError(reason)) {
          throw reason;
        }

        paymentRecord = await prisma.payment.findFirst({
          where: {
            OR: [
              {
                orderIdRef: order.id,
              },
              {
                merchantOrderId,
              },
            ],
          },
        });
      }
    }

    if (!paymentRecord) {
      throw new Error("Existing payment could not be loaded.");
    }

    if (!isPaymentPreparationProvider(paymentRecord.provider)) {
      await prisma.payment.updateMany({
        where: {
          orderIdRef: order.id,
          status: {
            not: "PAID",
          },
          provider: {
            not: {
              startsWith: paymentPreparationProviderPrefix,
            },
          },
        },
        data: {
          status: "PENDING",
          paymentMethod: prismaPaymentMethod,
          provider: "duitku",
          merchantOrderId,
          paymentCode: duitkuPaymentMethodCode,
          amount: payload.amount,
        },
      });

      paymentRecord = await prisma.payment.findUnique({
        where: {
          orderIdRef: order.id,
        },
      });
    }

    if (!paymentRecord) {
      throw new Error("Payment record could not be loaded after update.");
    }

    logTiming("database_done");

    logTiming("idempotency_postwrite_start");
    let existingPaymentAfterWrite = await findExistingPaymentRecord({
      orderId: payload.orderId,
      invoiceId: payload.invoiceId,
      merchantOrderId,
    });

    if (!existingPaymentAfterWrite) {
      throw new Error("Payment record could not be loaded for idempotency.");
    }

    if (isExistingPaymentPaid(existingPaymentAfterWrite)) {
      console.info("[PAYMENT IDEMPOTENCY] existing_paid_invoice", {
        orderId: payload.orderId,
        invoiceId: payload.invoiceId,
        merchantOrderId,
        paymentId: existingPaymentAfterWrite.id,
      });

      flushTimingSummary("idempotency_existing_paid_invoice", {
        orderId: payload.orderId,
        invoiceId: payload.invoiceId,
        merchantOrderId,
      });
      return Response.json(
        buildAlreadyPaidResponse(existingPaymentAfterWrite),
        { status: 409 }
      );
    }

    if (hasUsableExistingPaymentResponse(existingPaymentAfterWrite)) {
      console.info("[PAYMENT IDEMPOTENCY] existing_payment_url_returned", {
        orderId: payload.orderId,
        invoiceId: payload.invoiceId,
        merchantOrderId,
        paymentId: existingPaymentAfterWrite.id,
      });

      flushTimingSummary("idempotency_existing_payment_url_returned", {
        orderId: payload.orderId,
        invoiceId: payload.invoiceId,
        merchantOrderId,
      });
      return Response.json(
        buildExistingPaymentResponse(
          existingPaymentAfterWrite,
          config.mockEnabled ? "mock" : "production"
        )
      );
    }

    logTiming("idempotency_postwrite_done", {
      paymentId: existingPaymentAfterWrite.id,
      paymentStatus: existingPaymentAfterWrite.status,
      provider: existingPaymentAfterWrite.provider,
    });

    logTiming("admin_email_start", {
      isNewOrder,
    });
    if (isNewOrder) {
      const isSmtpEnvComplete = Boolean(
        process.env.SMTP_HOST &&
          process.env.SMTP_USER &&
          process.env.SMTP_PASS &&
          process.env.ADMIN_NOTIFICATION_EMAIL &&
          process.env.SMTP_FROM
      );

      if (!isSmtpEnvComplete) {
        logTiming("admin_email_skipped", {
          reason: "smtp_env_incomplete",
        });
      } else {
        logTiming("admin_email_queued");
      }

      const adminEmailInput = {
        orderId: order.orderId,
        invoiceId: invoice.invoiceId,
        paymentId: paymentRecord.id,
        customerEmail: order.customerEmail,
        customerPhone: order.customerWhatsapp,
        amount: order.total,
        orderStatus: order.status,
        paymentStatus: paymentRecord.status,
        invoiceStatus: invoice.status,
        createdAt: order.createdAt,
      };

      // Non-critical after response: admin notification must not delay paymentUrl.
      after(async () => {
        await sendAdminOrderCreatedEmail(adminEmailInput);
      });
    } else {
      logTiming("admin_email_skipped", {
        reason: "existing_order",
      });
    }

    if (config.mockEnabled) {
      flushTimingSummary("response_success", {
        environment: "mock",
      });
      return Response.json({
        success: true,
        provider: "duitku",
        environment: "mock",
        data: {
          reference: `MOCK-${merchantOrderId}`,
          paymentUrl: null,
          merchantOrderId,
          invoiceId: payload.invoiceId,
          orderId: payload.orderId,
        },
      });
    }

    logTiming("payment_preparation_claim_start", {
      paymentId: existingPaymentAfterWrite.id,
    });

    let preparationClaim = await claimPaymentPreparation({
      paymentId: existingPaymentAfterWrite.id,
      paymentMethod: prismaPaymentMethod,
      merchantOrderId,
      paymentCode: duitkuPaymentMethodCode,
      amount: payload.amount,
    });

    if (!preparationClaim) {
      logTiming("payment_preparation_wait_start", {
        paymentId: existingPaymentAfterWrite.id,
      });

      const waitedPayment = await waitForExistingPaymentResolution({
        orderId: payload.orderId,
        invoiceId: payload.invoiceId,
        merchantOrderId,
      });

      if (waitedPayment) {
        if (isExistingPaymentPaid(waitedPayment)) {
          console.info("[PAYMENT IDEMPOTENCY] existing_paid_invoice", {
            orderId: payload.orderId,
            invoiceId: payload.invoiceId,
            merchantOrderId,
            paymentId: waitedPayment.id,
          });

          flushTimingSummary("idempotency_existing_paid_invoice", {
            orderId: payload.orderId,
            invoiceId: payload.invoiceId,
            merchantOrderId,
          });
          return Response.json(buildAlreadyPaidResponse(waitedPayment), {
            status: 409,
          });
        }

        if (hasUsableExistingPaymentResponse(waitedPayment)) {
          console.info("[PAYMENT IDEMPOTENCY] existing_payment_url_returned", {
            orderId: payload.orderId,
            invoiceId: payload.invoiceId,
            merchantOrderId,
            paymentId: waitedPayment.id,
          });

          flushTimingSummary("idempotency_existing_payment_url_returned", {
            orderId: payload.orderId,
            invoiceId: payload.invoiceId,
            merchantOrderId,
          });
          return Response.json(
            buildExistingPaymentResponse(waitedPayment, "production")
          );
        }

        if (isActivePaymentPreparation(waitedPayment)) {
          flushTimingSummary("idempotency_existing_payment_preparing", {
            orderId: payload.orderId,
            invoiceId: payload.invoiceId,
            merchantOrderId,
            paymentId: waitedPayment.id,
          });
          return Response.json(
            {
              success: false,
              code: "PAYMENT_PREPARING" satisfies DuitkuErrorCode,
              message:
                "Transaksi pembayaran sedang disiapkan. Silakan tunggu sebentar.",
            },
            { status: 409 }
          );
        }

        existingPaymentAfterWrite = waitedPayment;
        preparationClaim = await claimPaymentPreparation({
          paymentId: waitedPayment.id,
          paymentMethod: prismaPaymentMethod,
          merchantOrderId,
          paymentCode: duitkuPaymentMethodCode,
          amount: payload.amount,
        });
      }
    }

    if (!preparationClaim) {
      flushTimingSummary("idempotency_claim_failed", {
        orderId: payload.orderId,
        invoiceId: payload.invoiceId,
        merchantOrderId,
        paymentId: existingPaymentAfterWrite.id,
      });
      return Response.json(
        {
          success: false,
          code: "PAYMENT_PREPARING" satisfies DuitkuErrorCode,
          message:
            "Transaksi pembayaran sedang disiapkan. Silakan tunggu sebentar.",
        },
        { status: 409 }
      );
    }

    claimedPaymentId = existingPaymentAfterWrite.id;
    claimedPaymentProvider = preparationClaim;

    console.info("[PAYMENT IDEMPOTENCY] creating_new_duitku_invoice", {
      orderId: payload.orderId,
      invoiceId: payload.invoiceId,
      merchantOrderId,
      paymentId: existingPaymentAfterWrite.id,
    });

    logTiming("payment_preparation_claim_done", {
      paymentId: existingPaymentAfterWrite.id,
    });

    const callbackUrl = `${config.siteUrl}/api/duitku/callback`;
    const returnUrl = `${config.siteUrl}/payment/pending?invoiceId=${encodeURIComponent(
      payload.invoiceId
    )}`;
    const productDetails = `Digital Carroll Base - ${payload.packageName}`;
    const phoneNumber = normalizePhoneNumber(payload.customerWhatsapp);
    const timestamp = Date.now().toString();

    const signature = buildDuitkuCreateInvoiceSignature({
      merchantCode: config.merchantCode,
      timestamp,
      apiKey: config.apiKey,
    });

    const duitkuPayload = {
      paymentAmount: payload.amount,
      paymentMethod: duitkuPaymentMethodCode,
      merchantOrderId,
      productDetails,
      additionalParam: payload.invoiceId,
      merchantUserInfo: payload.customerEmail,
      customerVaName: payload.customerName,
      email: payload.customerEmail,
      phoneNumber,
      itemDetails: [
        {
          name: payload.packageName,
          price: payload.amount,
          quantity: 1,
        },
      ],
      customerDetail: {
        firstName: payload.customerName,
        email: payload.customerEmail,
        phoneNumber,
      },
      callbackUrl,
      returnUrl,
      expiryPeriod: 10,
    };

    console.log("DUITKU REQUEST URL:", `${config.baseUrl}/api/merchant/createInvoice`);
    console.log("DUITKU REQUEST PAYLOAD:", duitkuPayload);

    logTiming("duitku_request_start");

    const duitkuResponse = await fetch(
      `${config.baseUrl}/api/merchant/createInvoice`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-duitku-signature": signature,
          "x-duitku-timestamp": timestamp,
          "x-duitku-merchantcode": config.merchantCode,
        },
        body: JSON.stringify(duitkuPayload),
        cache: "no-store",
      }
    );

    const duitkuData = await readDuitkuResponse(duitkuResponse);

    logTiming("duitku_request_done", {
      httpStatus: duitkuResponse.status,
      statusCode: duitkuData.statusCode,
      statusMessage: duitkuData.statusMessage ?? duitkuData.Message ?? null,
    });

    console.log("DUITKU STATUS:", duitkuResponse.status);
    console.log("DUITKU DATA:", duitkuData);

    const isSuccess =
      duitkuResponse.ok &&
      duitkuData.statusCode === "00" &&
      Boolean(duitkuData.paymentUrl);

    if (isSuccess) {
      logTiming("provider_payment_update_start");

      const providerPaymentUpdate = {
        status: "PENDING" as const,
        provider: "duitku",
        providerReference: duitkuData.reference,
        providerPaymentUrl: duitkuData.paymentUrl,
        paymentCode: duitkuPaymentMethodCode,
        vaNumber: duitkuData.vaNumber,
        qrString: duitkuData.qrString,
      };

      await prisma.payment.update({
        where: {
          id: claimedPaymentId ?? existingPaymentAfterWrite.id,
        },
        data: providerPaymentUpdate,
      });

      claimedPaymentId = null;
      claimedPaymentProvider = null;

      logTiming("provider_payment_update_done");

      flushTimingSummary("response_success", {
        environment: "production",
      });
      return Response.json({
        success: true,
        provider: "duitku",
        environment: "production",
        data: {
          reference: duitkuData.reference,
          paymentUrl: duitkuData.paymentUrl,
          vaNumber: duitkuData.vaNumber,
          qrString: duitkuData.qrString,
          statusCode: duitkuData.statusCode,
          statusMessage: duitkuData.statusMessage,
          merchantOrderId,
          invoiceId: payload.invoiceId,
          orderId: payload.orderId,
        },
      });
    }

    await prisma.payment.update({
      where: {
        id: claimedPaymentId ?? existingPaymentAfterWrite.id,
      },
      data: {
        status: "FAILED",
        provider: "duitku",
      },
    });
    claimedPaymentId = null;
    claimedPaymentProvider = null;

    logDuitkuError({
      code: "DUITKU_REQUEST_FAILED",
      httpStatus: duitkuResponse.status,
      statusMessage: getSafeStatusMessage(duitkuData),
      merchantOrderId,
      paymentMethod: payload.paymentMethod,
      duitkuPaymentMethodCode,
    });

    flushTimingSummary("response_failed", {
      httpStatus: duitkuResponse.status,
      statusCode: duitkuData.statusCode ?? null,
      statusMessage: duitkuData.statusMessage ?? duitkuData.Message ?? null,
    });
    return Response.json(
      {
        success: false,
        code: "DUITKU_REQUEST_FAILED",
        message: "Gagal membuat transaksi Duitku.",
        detail: getSafeStatusMessage(duitkuData),
        duitkuResponse: duitkuData,
      },
      { status: duitkuResponse.ok ? 400 : 500 }
    );
  } catch (reason) {
    if (claimedPaymentId && claimedPaymentProvider) {
      try {
        await prisma.payment.updateMany({
          where: {
            id: claimedPaymentId,
            provider: claimedPaymentProvider,
          },
          data: {
            status: "FAILED",
            provider: "duitku",
          },
        });
      } catch (cleanupReason) {
        console.error("Duitku payment preparation cleanup failed", {
          paymentId: claimedPaymentId,
          message:
            cleanupReason instanceof Error
              ? cleanupReason.message
              : "Unknown error",
        });
      }
    }

    logDuitkuError({
      code: "UNKNOWN_ERROR",
      statusMessage: reason instanceof Error ? reason.message : "Unknown error",
    });

    flushTimingSummary("response_error", {
      message: reason instanceof Error ? reason.message : String(reason),
    });
    return Response.json(
      {
        success: false,
        code: "UNKNOWN_ERROR",
        message: "Gagal membuat transaksi Duitku.",
        detail: reason instanceof Error ? reason.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
