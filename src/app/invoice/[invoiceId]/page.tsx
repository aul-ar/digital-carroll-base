import Link from "next/link";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { getInvoiceByInvoiceId } from "@/lib/invoice-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Invoice | Digital Carroll Base",
};

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
