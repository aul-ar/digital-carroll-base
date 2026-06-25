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
import { PaymentMethod } from "@prisma/client";

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

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body =
      (await request.json()) as Partial<DuitkuTransactionPayloadWithMeta>;

    const selectedPlan = getSelectedPricingPlan(body.planId);

    if (!selectedPlan) {
      logDuitkuError({
        code: "VALIDATION_ERROR",
        statusMessage: "Plan checkout tidak ditemukan di pricingPlans.",
        paymentMethod: body.paymentMethod,
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

      return Response.json(
        {
          success: false,
          code,
          message: validation.message,
        },
        { status: 400 }
      );
    }

    const config = getDuitkuConfig();

    if (!config.merchantCode || !config.apiKey) {
      logDuitkuError({ code: "MISSING_DUITKU_ENV" });

      return Response.json(
        {
          success: false,
          code: "MISSING_DUITKU_ENV",
          message: "Konfigurasi Duitku belum lengkap di server.",
        },
        { status: 500 }
      );
    }

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

      return Response.json(
        {
          success: false,
          code: "INVALID_PAYMENT_METHOD",
          message: "Metode pembayaran ini belum aktif di Duitku Production.",
        },
        { status: 400 }
      );
    }

    console.log("[TIMING] validation:", Date.now() - startedAt, "ms");

    const existingOrder = await prisma.order.findUnique({
      where: {
        orderId: payload.orderId,
      },
      select: {
        id: true,
      },
    });

    const order = await prisma.order.upsert({
      where: {
        orderId: payload.orderId,
      },
      update: {
        status: "WAITING_PAYMENT",
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
      },
      create: {
        orderId: payload.orderId,
        status: "WAITING_PAYMENT",
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
      },
    });

    const invoice = await prisma.invoice.upsert({
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
    });

    const paymentRecord = await prisma.payment.upsert({
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
    });

    console.log("[TIMING] database:", Date.now() - startedAt, "ms");

    if (!existingOrder) {
      await sendAdminOrderCreatedEmail({
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
      });
    }

    if (config.mockEnabled) {
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

    console.log("[TIMING] before_duitku:", Date.now() - startedAt, "ms");

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

    console.log("[TIMING] after_duitku:", Date.now() - startedAt, "ms");

    console.log("DUITKU STATUS:", duitkuResponse.status);
    console.log("DUITKU DATA:", duitkuData);

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

    return Response.json(
      {
        success: false,
        code: "UNKNOWN_ERROR",
        message: "Gagal membuat transaksi Duitku.",
        detail: reason instanceof Error ? reason.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    console.log("[TIMING] response:", Date.now() - startedAt, "ms");
  }
}
