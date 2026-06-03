import { buildDuitkuCallbackSignature, getDuitkuConfig } from "@/lib/duitku";
import { sendAdminPaymentPaidEmail } from "@/lib/admin-email";
import { prisma } from "@/lib/prisma";

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

function normalizeStatuses(resultCode?: string) {
  if (resultCode === "00") {
    return {
      orderStatus: "PAID" as const,
      invoiceStatus: "PAID" as const,
      paymentStatus: "PAID" as const,
      paidAt: new Date(),
    };
  }

  if (resultCode === "01") {
    return {
      orderStatus: "FAILED" as const,
      invoiceStatus: "FAILED" as const,
      paymentStatus: "FAILED" as const,
      paidAt: null,
    };
  }

  return {
    orderStatus: "WAITING_PAYMENT" as const,
    invoiceStatus: "PENDING" as const,
    paymentStatus: "PENDING" as const,
    paidAt: null,
  };
}

export async function POST(request: Request) {
  try {
    const payload = await parseCallbackPayload(request);
    const { apiKey, merchantCode } = getDuitkuConfig();

    if (
      !payload.merchantCode ||
      !payload.amount ||
      !payload.merchantOrderId ||
      !payload.signature ||
      !apiKey
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid callback payload",
        },
        { status: 400 }
      );
    }

    if (payload.merchantCode !== merchantCode) {
      return Response.json(
        {
          success: false,
          message: "Invalid merchant code",
        },
        { status: 400 }
      );
    }

    const expectedSignature = buildDuitkuCallbackSignature({
      merchantCode: payload.merchantCode,
      amount: payload.amount,
      merchantOrderId: payload.merchantOrderId,
      apiKey,
    });

    if (payload.signature !== expectedSignature) {
      return Response.json(
        {
          success: false,
          message: "Invalid signature",
        },
        { status: 400 }
      );
    }

    const statuses = normalizeStatuses(payload.resultCode);
    const isPaymentPaidTransition = statuses.paymentStatus === "PAID";

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          {
            merchantOrderId: payload.merchantOrderId,
          },
          {
            providerReference: payload.reference,
          },
        ],
      },
      include: {
        order: {
          include: {
            invoice: true,
          },
        },
      },
    });

    if (!payment) {
      console.error("Duitku callback payment not found", {
        merchantOrderId: payload.merchantOrderId,
        reference: payload.reference,
        resultCode: payload.resultCode,
      });

      return Response.json(
        {
          success: false,
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    const shouldSendPaidEmail = isPaymentPaidTransition && payment.status !== "PAID";

    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: statuses.paymentStatus,
          providerReference: payload.reference ?? payment.providerReference,
          paymentCode: payload.paymentCode ?? payment.paymentCode,
        },
      }),

      prisma.order.update({
        where: {
          id: payment.orderIdRef,
        },
        data: {
          status: statuses.orderStatus,
        },
      }),

      prisma.invoice.updateMany({
        where: {
          orderIdRef: payment.orderIdRef,
        },
        data: {
          status: statuses.invoiceStatus,
          paidAt: statuses.paidAt,
        },
      }),
    ]);

    console.info("Duitku callback processed", {
      merchantOrderId: payload.merchantOrderId,
      reference: payload.reference,
      resultCode: payload.resultCode,
      amount: payload.amount,
      paymentStatus: statuses.paymentStatus,
      orderStatus: statuses.orderStatus,
      invoiceStatus: statuses.invoiceStatus,
    });

    if (shouldSendPaidEmail) {
      await sendAdminPaymentPaidEmail({
        orderId: payment.order.orderId,
        invoiceId: payment.order.invoice?.invoiceId ?? payload.additionalParam ?? "-",
        paymentId: payment.id,
        customerEmail: payment.order.customerEmail,
        customerPhone: payment.order.customerWhatsapp,
        amount: payment.amount,
        orderStatus: statuses.orderStatus,
        paymentStatus: statuses.paymentStatus,
        invoiceStatus: statuses.invoiceStatus,
        createdAt: payment.order.createdAt,
      });
    }

    return Response.json({
      success: true,
    });
  } catch (reason) {
    console.error("Duitku callback error", {
      message: reason instanceof Error ? reason.message : "Unknown error",
    });

    return Response.json(
      {
        success: false,
        message: "Invalid callback payload",
      },
      { status: 400 }
    );
  }
}
