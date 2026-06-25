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

      order = await prisma.order.update({
        where: {
          orderId: payload.orderId,
        },
        data: orderData,
      });
    }

    // Critical before Duitku: invoice/payment writes are independent once order
    // exists, so run them together while keeping both before createInvoice.
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
      logTiming("provider_payment_update_queued");

      const providerPaymentUpdate = {
        providerReference: duitkuData.reference,
        providerPaymentUrl: duitkuData.paymentUrl,
        paymentCode: duitkuPaymentMethodCode,
        vaNumber: duitkuData.vaNumber,
        qrString: duitkuData.qrString,
      };

      // Non-critical after response: callback lookup works via merchantOrderId
      // already saved before Duitku, while this persists display/reference data.
      after(async () => {
        try {
          await prisma.payment.update({
            where: {
              orderIdRef: order.id,
            },
            data: providerPaymentUpdate,
          });
        } catch (reason) {
          console.error("Duitku provider payment update failed", {
            merchantOrderId,
            message: reason instanceof Error ? reason.message : "Unknown error",
          });
        }
      });

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
