import { Invoice, isManualPayment } from "@/lib/invoice";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { invoice?: Invoice };

    if (!body.invoice) {
      return Response.json({ message: "Invoice tidak ditemukan." }, { status: 400 });
    }

    if (isManualPayment(body.invoice.paymentMethod)) {
      return Response.json({ message: "Metode manual tidak diproses melalui Duitku." }, { status: 400 });
    }

    const baseUrl = new URL(request.url).origin;
    const paymentUrl = new URL("/payment/success", baseUrl);
    paymentUrl.searchParams.set("invoiceId", body.invoice.invoiceId);
    paymentUrl.searchParams.set("sandbox", "duitku");

    return Response.json({
      reference: `DUITKU-SBX-${body.invoice.orderId}`,
      paymentUrl: paymentUrl.toString(),
      amount: body.invoice.total,
      merchantOrderId: body.invoice.orderId,
    });
  } catch {
    return Response.json({ message: "Transaksi Duitku Sandbox gagal dibuat." }, { status: 500 });
  }
}
