import {
  buildDuitkuCreateInvoiceSignature,
  createMerchantOrderId,
  DuitkuTransactionPayload,
  getDuitkuConfig,
  mapPaymentMethodToDuitkuCode,
  normalizePhoneNumber,
  validateDuitkuRequestPayload,
} from "@/lib/duitku";

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
  return response.statusMessage ?? response.Message ?? "Duitku tidak mengembalikan pesan detail.";
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
    code: input.code,
    httpStatus: input.httpStatus,
    statusMessage: input.statusMessage,
    merchantOrderId: input.merchantOrderId,
    paymentMethod: input.paymentMethod,
    duitkuPaymentMethodCode: input.duitkuPaymentMethodCode,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DuitkuTransactionPayload>;
    const validation = validateDuitkuRequestPayload(body);

    if (!validation.valid) {
      const code = validation.code === "INVALID_PAYMENT_METHOD" ? "INVALID_PAYMENT_METHOD" : "VALIDATION_ERROR";
      logDuitkuError({ code, statusMessage: validation.message, paymentMethod: body.paymentMethod });
      return Response.json({ success: false, code, message: validation.message }, { status: 400 });
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

    const payload = body as DuitkuTransactionPayload;
    const merchantOrderId = createMerchantOrderId(payload.orderId);
    const duitkuPaymentMethodCode = mapPaymentMethodToDuitkuCode(payload.paymentMethod);

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
    const returnUrl = `${config.siteUrl}/payment/pending?invoiceId=${encodeURIComponent(payload.invoiceId)}`;
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
      expiryPeriod: 60,
    };

    const duitkuResponse = await fetch(`${config.baseUrl}/api/merchant/createInvoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-duitku-signature": signature,
        "x-duitku-timestamp": timestamp,
        "x-duitku-merchantcode": config.merchantCode,
      },
      body: JSON.stringify(duitkuPayload),
      cache: "no-store",
    });

    const duitkuData = await readDuitkuResponse(duitkuResponse);
    const isSuccess = duitkuResponse.ok && duitkuData.statusCode === "00" && Boolean(duitkuData.paymentUrl);

    if (isSuccess) {
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
      },
      { status: 500 }
    );
  }
}
