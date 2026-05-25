import { InvoiceStatus } from "@/lib/invoice";

function normalizeStatus(value: unknown): InvoiceStatus {
  if (value === "00" || value === "SUCCESS" || value === "paid") {
    return "paid";
  }

  if (value === "EXPIRED" || value === "expired") {
    return "expired";
  }

  if (value === "FAILED" || value === "failed") {
    return "failed";
  }

  return "pending";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invoiceId = body.invoiceId ?? body.merchantOrderId ?? body.orderId;
    const status = normalizeStatus(body.resultCode ?? body.status);

    return Response.json({
      received: true,
      invoiceId,
      status,
      note: "MVP callback endpoint. Persist status ini ke database saat Supabase/Neon sudah tersedia.",
    });
  } catch {
    return Response.json({ message: "Callback tidak valid." }, { status: 400 });
  }
}
