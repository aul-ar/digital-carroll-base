"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { InvoiceStatus } from "@/lib/invoice";
import { getLatestInvoiceId } from "@/lib/invoice-storage";

const content = {
  paid: {
    icon: CheckCircle2,
    title: "Pembayaran Berhasil",
    description: "Terima kasih. Pembayaran Anda berhasil diproses.",
    className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 dark:text-emerald-300",
  },
  pending: {
    icon: Clock3,
    title: "Pembayaran Menunggu",
    description: "Invoice telah dibuat dan menunggu pembayaran.",
    className: "text-amber-600 bg-amber-50 dark:bg-amber-950/25 dark:text-amber-300",
  },
  failed: {
    icon: XCircle,
    title: "Pembayaran Gagal",
    description: "Pembayaran belum berhasil. Silakan coba kembali atau hubungi admin.",
    className: "text-red-600 bg-red-50 dark:bg-red-950/25 dark:text-red-300",
  },
};

export function PaymentResult({ status }: { status: InvoiceStatus }) {
  const searchParams = useSearchParams();
  const queryInvoiceId = searchParams.get("invoiceId");
  const [latestInvoiceId] = useState(() => getLatestInvoiceId());
  const invoiceId = queryInvoiceId ?? latestInvoiceId;
  const view = useMemo(() => content[status === "expired" ? "failed" : status], [status]);
  const Icon = view.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${view.className}`}>
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-950 dark:text-white">{view.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{view.description}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {invoiceId && (
            <Link
              href={`/invoice/${invoiceId}`}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Lihat Invoice
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
