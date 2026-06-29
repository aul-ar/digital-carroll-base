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
import { PaymentMethod, Prisma, type Order } from "@prisma/client";
import { after } from "next/server";

type DuitkuErrorCode =
  | "MISSING_DUITKU_ENV"
  | "INVALID_PAYMENT_METHOD"
  | "DUITKU_REQUEST_FAILED"
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
    return {
      valid: false,
      message:
        "Provider e-wallet wajib dipilih. Pilih salah satu: ovo, shopeepay, linkaja, atau dana.",
    };
  }

  if (isEWalletProvider(ewalletProvider)) {
    return { valid: true, provider: ewalletProvider };
  }

  return {
    valid: false,
    message:
      "Provider e-wallet harus salah satu dari ovo, shopeepay, linkaja, atau dana.",
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

function isDuitkuDebugLogsEnabled() {
  return process.env.DUITKU_DEBUG_LOGS === "true";
}

function redactSensitiveLogText(value: string | null | undefined) {
  if (!value) {
    return value ?? null;
  }

  return value
    .replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      "[redacted-email]"
    )
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted-phone]");
}

function logDuitkuError(input: {
  code: DuitkuErrorCode;
  httpStatus?: number;
  statusMessage?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  duitkuPaymentMethodCode?: string | null;
}) {
  console.error("Duitku transaction error", {
    ...input,
    statusMessage: redactSensitiveLogText(input.statusMessage),
  });
}

function isUniqueConstraintError(reason: unknown) {
  return (
    reason instanceof Prisma.PrismaClientKnownRequestError &&
    reason.code === "P2002"
  );
}

export async function POST(request: Request) {
  const startedAt = Date.now();

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

    console.info("[DUITKU] payment_code_resolved", {
      paymentMethod: payload.paymentMethod,
      ewalletProvider: payload.ewalletProvider ?? null,
      duitkuPaymentMethodCode,
      merchantOrderId,
      invoiceId: payload.invoiceId,
      orderId: payload.orderId,
    });

    logTiming("database_start");

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

      order = await prisma.order.update({
        where: {
          orderId: payload.orderId,
        },
        data: orderData,
      });
    }

    const [invoice, paymentRecord] = await Promise.all([
      prisma.invoice.upsert({
        where: {
          invoiceId: payload.invoiceId,
        },
        update: {
          status: "PENDING",
          paymentMethod: prismaPaymentMethod,
          paidAt: null,
          expiresAt,
        },
        create: {
          invoiceId: payload.invoiceId,
          status: "PENDING",
          paymentMethod: prismaPaymentMethod,
          expiresAt,
          orderIdRef: order.id,
        },
      }),
      prisma.payment.upsert({
        where: {
          orderIdRef: order.id,
        },
        update: {
          status: "PENDING",
          paymentMethod: prismaPaymentMethod,
          provider: "duitku",
          merchantOrderId,
          amount: payload.amount,
        },
        create: {
          status: "PENDING",
          paymentMethod: prismaPaymentMethod,
          provider: "duitku",
          merchantOrderId,
          amount: payload.amount,
          orderIdRef: order.id,
        },
      }),
    ]);

    logTiming("database_done");

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

    console.log(
      "DUITKU REQUEST URL:",
      `${config.baseUrl}/api/merchant/createInvoice`
    );

    if (isDuitkuDebugLogsEnabled()) {
      console.log("DUITKU REQUEST PAYLOAD:", duitkuPayload);
    } else {
      console.info("DUITKU REQUEST SUMMARY:", {
        paymentMethod: duitkuPayload.paymentMethod,
        ewalletProvider: payload.ewalletProvider ?? null,
        merchantOrderId: duitkuPayload.merchantOrderId,
        invoiceId: duitkuPayload.additionalParam,
        itemCount: duitkuPayload.itemDetails.length,
        expiryPeriod: duitkuPayload.expiryPeriod,
        hasCustomerEmail: Boolean(duitkuPayload.email),
        hasCustomerName: Boolean(duitkuPayload.customerVaName),
        hasPhoneNumber: Boolean(duitkuPayload.phoneNumber),
      });
    }

    logTiming("duitku_request_queued");

    after(async () => {
      const providerStartedAt = Date.now();

      try {
        console.info("DUITKU ASYNC REQUEST STARTED", {
          merchantOrderId,
          invoiceId: payload.invoiceId,
          paymentMethod: duitkuPaymentMethodCode,
          ewalletProvider: payload.ewalletProvider ?? null,
        });

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

        console.info("DUITKU ASYNC REQUEST DONE", {
          merchantOrderId,
          invoiceId: payload.invoiceId,
          httpStatus: duitkuResponse.status,
          statusCode: duitkuData.statusCode ?? null,
          ewalletProvider: payload.ewalletProvider ?? null,
          elapsedMs: Date.now() - providerStartedAt,
          hasPaymentUrl: Boolean(duitkuData.paymentUrl),
          hasReference: Boolean(duitkuData.reference),
        });

        const isSuccess =
          duitkuResponse.ok &&
          duitkuData.statusCode === "00" &&
          Boolean(duitkuData.paymentUrl);

        if (isSuccess) {
          await prisma.payment.update({
            where: {
              orderIdRef: order.id,
            },
            data: {
              providerReference: duitkuData.reference,
              providerPaymentUrl: duitkuData.paymentUrl,
              paymentCode: duitkuPaymentMethodCode,
              vaNumber: duitkuData.vaNumber,
              qrString: duitkuData.qrString,
            },
          });

          return;
        }

        await prisma.payment.update({
          where: {
            orderIdRef: order.id,
          },
          data: {
            status: "FAILED",
          },
        });

        logDuitkuError({
          code: "DUITKU_REQUEST_FAILED",
          httpStatus: duitkuResponse.status,
          statusMessage: getSafeStatusMessage(duitkuData),
          merchantOrderId,
          paymentMethod: payload.paymentMethod,
          duitkuPaymentMethodCode,
        });
      } catch (reason) {
        await prisma.payment.update({
          where: {
            orderIdRef: order.id,
          },
          data: {
            status: "FAILED",
          },
        });

        logDuitkuError({
          code: "UNKNOWN_ERROR",
          statusMessage: reason instanceof Error ? reason.message : String(reason),
          merchantOrderId,
          paymentMethod: payload.paymentMethod,
          duitkuPaymentMethodCode,
        });
      }
    });

    flushTimingSummary("response_accepted", {
      environment: "production",
      mode: "async_payment_preparation",
    });

    return Response.json({
      success: true,
      provider: "duitku",
      environment: "production",
      code: "PAYMENT_PREPARING",
      message: "Pembayaran sedang disiapkan.",
      paymentUrl: null,
      data: {
        reference: null,
        paymentUrl: null,
        vaNumber: null,
        qrString: null,
        statusCode: "PROCESSING",
        statusMessage: "Pembayaran sedang disiapkan.",
        status: "preparing_payment",
        merchantOrderId,
        invoiceId: payload.invoiceId,
        orderId: payload.orderId,
      },
    });
  } catch (reason) {
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
