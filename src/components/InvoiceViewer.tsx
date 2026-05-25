"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Invoice } from "@/lib/invoice";
import { getStoredInvoice } from "@/lib/invoice-storage";
import { InvoiceDocument } from "@/components/InvoiceDocument";

export function InvoiceViewer({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);

  useEffect(() => {
    async function loadInvoice() {
      const localInvoice = getStoredInvoice(invoiceId);
      if (localInvoice) {
        setInvoice(localInvoice);
        return;
      }

      const response = await fetch(`/api/invoice/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
        return;
      }

      setInvoice(null);
    }

    loadInvoice();
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
            Untuk MVP tanpa database, invoice tersimpan di browser yang digunakan saat checkout.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return <InvoiceDocument invoice={invoice} />;
}
