import { buildDuitkuCallbackSignature, getDuitkuConfig } from "@/lib/duitku";

interface DuitkuCallbackPayload {
  merchantCode?: string;
  amount?: string;
  merchantOrderId?: string;
  productDetail?: string;
  additionalParam?: string;
  paymentCode?: string;
  resultCode?: string;
  merchantUserId?: string;
  reference?: string;
  signature?: string;
}

async function parseCallbackPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as DuitkuCallbackPayload;
  }

  const rawBody = await request.text();
  const formData = new URLSearchParams(rawBody);

  return Object.fromEntries(formData.entries()) as DuitkuCallbackPayload;
}

function normalizeCallbackStatus(resultCode?: string) {
  if (resultCode === "00") {
    return "paid";
  }

  if (resultCode === "01") {
    return "failed";
  }

  return "pending";
}

export async function POST(request: Request) {
  try {
    const payload = await parseCallbackPayload(request);
    const { apiKey } = getDuitkuConfig();

    if (!payload.merchantCode || !payload.amount || !payload.merchantOrderId || !payload.signature || !apiKey) {
      return Response.json({ success: false, message: "Invalid callback payload" }, { status: 400 });
    }

    const expectedSignature = buildDuitkuCallbackSignature({
      merchantCode: payload.merchantCode,
      amount: payload.amount,
      merchantOrderId: payload.merchantOrderId,
      apiKey,
    });

    if (payload.signature !== expectedSignature) {
      return Response.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const paymentStatus = normalizeCallbackStatus(payload.resultCode);

    console.info("Duitku callback received", {
      merchantOrderId: payload.merchantOrderId,
      reference: payload.reference,
      resultCode: payload.resultCode,
      amount: payload.amount,
      paymentStatus,
    });

    // TODO: When database is added, update invoice/order status by merchantOrderId or reference here.
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, message: "Invalid callback payload" }, { status: 400 });
  }
}
