import Link from "next/link";
import type {
  InvoiceStatus as PrismaInvoiceStatus,
  PaymentMethod as PrismaPaymentMethod,
} from "@prisma/client";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import type { Invoice } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Invoice | Digital Carroll Base",
};

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

async function getInvoiceByInvoiceId(invoiceId: string): Promise<Invoice | null> {
  const invoice = await prisma.invoice.findUnique({
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

  if (!invoice) {
    return null;
  }

  const { order } = invoice;
  const { payment } = order;

  return {
    invoiceId: invoice.invoiceId,
    orderId: order.orderId,
    createdAt: invoice.createdAt.toISOString(),
    paidAt: invoice.paidAt?.toISOString(),
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

function InvoiceNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Invoice tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Data invoice tidak ditemukan di database. Periksa kembali nomor invoice atau buat pesanan baru.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/harga"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Lihat Paket Harga
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceByInvoiceId(invoiceId);

  if (!invoice) {
    return <InvoiceNotFound />;
  }

  return <InvoiceDocument invoice={invoice} />;
}
