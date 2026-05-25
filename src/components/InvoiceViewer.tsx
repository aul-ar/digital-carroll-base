"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Invoice } from "@/lib/invoice";
import { getStoredInvoice } from "@/lib/invoice-storage";
import { InvoiceDocument } from "@/components/InvoiceDocument";

export function InvoiceViewer({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setInvoice(getStoredInvoice(invoiceId));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [invoiceId]);

  if (invoice === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Memuat invoice...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Invoice tidak ditemukan</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Data invoice tidak tersedia di perangkat ini atau sudah terhapus.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/checkout?plan=plan-landing-page"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Buat Pesanan Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <InvoiceDocument invoice={invoice} />;
}
