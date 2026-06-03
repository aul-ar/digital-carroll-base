import "server-only";

import type {
  InvoiceStatus as PrismaInvoiceStatus,
  PaymentMethod as PrismaPaymentMethod,
} from "@prisma/client";
import { sendAdminInvoiceExpiredEmail } from "@/lib/admin-email";
import type { Invoice } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";

const paymentStatusMap: Record<PrismaInvoiceStatus, Invoice["paymentStatus"]> = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  EXPIRED: "expired",
};

const paymentMethodMap: Record<PrismaPaymentMethod, Invoice["paymentMethod"]> = {
  VIRTUAL_ACCOUNT: "virtual_account",
  QRIS: "qris",
  EWALLET: "ewallet",
  BANK_TRANSFER_MANUAL: "bank_transfer_manual",
  EWALLET_MANUAL: "ewallet_manual",
};

async function readInvoiceRecord(invoiceId: string) {
  return prisma.invoice.findUnique({
    where: {
      invoiceId,
    },
    include: {
      order: {
        include: {
          payment: true,
        },
      },
    },
  });
}

type InvoiceRecord = NonNullable<Awaited<ReturnType<typeof readInvoiceRecord>>>;

function shouldExpireInvoice(invoice: InvoiceRecord, now = new Date()) {
  return invoice.status === "PENDING" && Boolean(invoice.expiresAt) && now > invoice.expiresAt!;
}

async function expireInvoice(invoice: InvoiceRecord, now = new Date()) {
  let didExpireInvoice = false;

  await prisma.$transaction(async (transaction) => {
    const result = await transaction.invoice.updateMany({
      where: {
        id: invoice.id,
        status: "PENDING",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    if (result.count === 0) {
      return;
    }

    didExpireInvoice = true;

    await transaction.order.updateMany({
      where: {
        id: invoice.orderIdRef,
        status: {
          not: "PAID",
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    await transaction.payment.updateMany({
      where: {
        orderIdRef: invoice.orderIdRef,
        status: {
          not: "PAID",
        },
      },
      data: {
        status: "EXPIRED",
      },
    });
  });

  if (didExpireInvoice) {
    await sendAdminInvoiceExpiredEmail({
      orderId: invoice.order.orderId,
      invoiceId: invoice.invoiceId,
      paymentId: invoice.order.payment?.id,
      customerEmail: invoice.order.customerEmail,
      customerPhone: invoice.order.customerWhatsapp,
      amount: invoice.order.payment?.amount ?? invoice.order.total,
      orderStatus: "CANCELLED",
      paymentStatus: "EXPIRED",
      invoiceStatus: "EXPIRED",
      createdAt: invoice.order.createdAt,
    });
  }
}

function mapInvoiceRecordToInvoice(invoice: InvoiceRecord): Invoice {
  const { order } = invoice;
  const { payment } = order;

  return {
    invoiceId: invoice.invoiceId,
    orderId: order.orderId,
    createdAt: invoice.createdAt.toISOString(),
    paidAt: invoice.paidAt?.toISOString(),
    expiresAt: invoice.expiresAt?.toISOString(),
    paymentStatus: paymentStatusMap[invoice.status],
    paymentMethod: paymentMethodMap[invoice.paymentMethod],
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerWhatsapp: order.customerWhatsapp,
    businessName: order.businessName ?? undefined,
    packageName: order.packageName,
    packageDescription: order.packageDescription,
    quantity: order.quantity,
    price: order.price,
    subtotal: order.subtotal,
    total: order.total,
    notes: order.notes ?? undefined,
    provider: payment?.provider === "duitku" ? "duitku" : undefined,
    providerReference: payment?.providerReference ?? undefined,
    providerPaymentUrl: payment?.providerPaymentUrl ?? undefined,
    vaNumber: payment?.vaNumber ?? undefined,
    qrString: payment?.qrString ?? undefined,
    merchantOrderId: payment?.merchantOrderId ?? undefined,
  };
}

export async function getInvoiceByInvoiceId(invoiceId: string) {
  let invoice = await readInvoiceRecord(invoiceId);

  if (!invoice) {
    return null;
  }

  if (shouldExpireInvoice(invoice)) {
    await expireInvoice(invoice);
    invoice = await readInvoiceRecord(invoiceId);
  }

  return invoice ? mapInvoiceRecordToInvoice(invoice) : null;
}
