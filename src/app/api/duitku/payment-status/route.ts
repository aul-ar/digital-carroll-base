import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const invoiceId = url.searchParams.get("invoiceId")?.trim();

  if (!invoiceId) {
    return Response.json(
      {
        success: false,
        code: "VALIDATION_ERROR",
        message: "invoiceId wajib diisi.",
      },
      { status: 400 }
    );
  }

  const invoice = await prisma.invoice.findUnique({
    where: { invoiceId },
    include: {
      order: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (!invoice) {
    return Response.json(
      {
        success: false,
        code: "NOT_FOUND",
        message: "Invoice tidak ditemukan.",
      },
      { status: 404 }
    );
  }

  const payment = invoice.order.payment;

  if (payment?.providerPaymentUrl) {
    return Response.json({
      success: true,
      status: "ready",
      data: {
        invoiceId: invoice.invoiceId,
        orderId: invoice.order.orderId,
        merchantOrderId: payment.merchantOrderId,
        reference: payment.providerReference,
        paymentUrl: payment.providerPaymentUrl,
        vaNumber: payment.vaNumber,
        qrString: payment.qrString,
        paymentStatus: payment.status,
        invoiceStatus: invoice.status,
      },
    });
  }

  if (
    payment?.status === "FAILED" ||
    payment?.status === "CANCELLED" ||
    payment?.status === "EXPIRED" ||
    invoice.status === "FAILED" ||
    invoice.status === "EXPIRED"
  ) {
    return Response.json({
      success: true,
      status: "failed",
      data: {
        invoiceId: invoice.invoiceId,
        orderId: invoice.order.orderId,
        merchantOrderId: payment?.merchantOrderId ?? null,
        paymentStatus: payment?.status ?? null,
        invoiceStatus: invoice.status,
      },
    });
  }

  return Response.json({
    success: true,
    status: "processing",
    data: {
      invoiceId: invoice.invoiceId,
      orderId: invoice.order.orderId,
      merchantOrderId: payment?.merchantOrderId ?? null,
      paymentStatus: payment?.status ?? null,
      invoiceStatus: invoice.status,
    },
  });
}