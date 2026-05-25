import {
  buildDuitkuInquirySignature,
  createMerchantOrderId,
  DuitkuTransactionPayload,
  getDuitkuConfig,
  mapPaymentMethodToDuitkuCode,
  normalizePhoneNumber,
  validateDuitkuRequestPayload,
} from "@/lib/duitku";

interface DuitkuInquiryResponse {
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
    return {} as DuitkuInquiryResponse;
  }

  try {
    return JSON.parse(text) as DuitkuInquiryResponse;
  } catch {
    return { statusMessage: text };
  }
}

function getSafeStatusMessage(response: DuitkuInquiryResponse) {
  return response.statusMessage ?? response.Message ?? "Duitku Sandbox tidak mengembalikan pesan detail.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DuitkuTransactionPayload>;
    const validation = validateDuitkuRequestPayload(body);

    if (!validation.valid) {
      return Response.json({ success: false, message: validation.message }, { status: 400 });
    }

    const config = getDuitkuConfig();

    if (!config.merchantCode || !config.apiKey) {
      return Response.json(
        {
          success: false,
          message: "Konfigurasi Duitku Sandbox belum lengkap.",
        },
        { status: 500 }
      );
    }

    const payload = body as DuitkuTransactionPayload;
    const merchantOrderId = createMerchantOrderId(payload.orderId);
    const duitkuPaymentMethodCode = mapPaymentMethodToDuitkuCode(payload.paymentMethod);

    if (!duitkuPaymentMethodCode) {
      return Response.json(
        {
          success: false,
          message: "Metode pembayaran tidak dapat diproses melalui Duitku Sandbox.",
        },
        { status: 400 }
      );
    }

    const callbackUrl = `${config.siteUrl}/api/duitku/callback`;
    const returnUrl = `${config.siteUrl}/payment/pending?invoiceId=${encodeURIComponent(payload.invoiceId)}`;
    const productDetails = `Digital Carroll Base - ${payload.packageName}`;
    const phoneNumber = normalizePhoneNumber(payload.customerWhatsapp);
    const signature = buildDuitkuInquirySignature({
      merchantCode: config.merchantCode,
      merchantOrderId,
      amount: payload.amount,
      apiKey: config.apiKey,
    });

    const duitkuPayload = {
      merchantCode: config.merchantCode,
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
      signature,
      expiryPeriod: 60,
    };

    const duitkuResponse = await fetch(`${config.sandboxBaseUrl}/webapi/api/merchant/v2/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duitkuPayload),
      cache: "no-store",
    });

    const duitkuData = await readDuitkuResponse(duitkuResponse);
    const hasPaymentInstruction = Boolean(duitkuData.paymentUrl || duitkuData.vaNumber || duitkuData.qrString);
    const isSuccess = duitkuResponse.ok && duitkuData.statusCode === "00";

    if (isSuccess && hasPaymentInstruction) {
      return Response.json({
        success: true,
        provider: "duitku",
        environment: "sandbox",
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

    return Response.json(
      {
        success: false,
        message: "Gagal membuat transaksi Duitku Sandbox.",
        detail: getSafeStatusMessage(duitkuData),
      },
      { status: duitkuResponse.ok ? 400 : 500 }
    );
  } catch {
    return Response.json(
      {
        success: false,
        message: "Gagal membuat transaksi Duitku Sandbox.",
      },
      { status: 500 }
    );
  }
}
