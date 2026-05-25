"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, Printer } from "lucide-react";
import {
  buildWhatsAppInvoiceMessage,
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
  Invoice,
  isManualPayment,
  manualPaymentDetails,
  statusLabels,
} from "@/lib/invoice";
import { getWhatsAppLink } from "@/utils/whatsapp";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/25 dark:text-amber-300 dark:border-amber-900",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-300 dark:border-emerald-900",
  failed: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/25 dark:text-red-300 dark:border-red-900",
  expired: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const showManualDetails = isManualPayment(invoice.paymentMethod);
  const waLink = getWhatsAppLink(buildWhatsAppInvoiceMessage(invoice));
  const status = invoice.paymentStatus;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          {invoice.paymentStatus === "pending" && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" />
              Konfirmasi via WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            Print Invoice
          </button>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8 print:border-0 print:bg-white print:p-0 print:shadow-none">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Digital Carroll Base
            </p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
              INVOICE
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Website Development & Digital Service
            </p>
          </div>
          <div className="space-y-2 text-left sm:text-right">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusStyles[status]}`}>
              {statusLabels[status]}
            </span>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">{invoice.invoiceId}</p>
              <p>{invoice.orderId}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-5 border-b border-slate-200 py-6 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoice No</p>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {invoice.invoiceId}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order ID</p>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {invoice.orderId}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tanggal Invoice</p>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {formatDate(invoice.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Pembayaran</p>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {statusLabels[status]}
            </p>
          </div>
        </section>

        <section className="grid gap-6 border-b border-slate-200 py-6 dark:border-slate-800 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">Data Customer</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Nama lengkap</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100">{invoice.customerName}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Email</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100">{invoice.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Nomor WhatsApp</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100">{invoice.customerWhatsapp}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Nama bisnis / brand</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100">{invoice.businessName || "-"}</dd>
              </div>
            </dl>
          </div>

          {showManualDetails && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">Instruksi Pembayaran Manual</h2>
              {invoice.paymentMethod === "bank_transfer_manual" ? (
                <dl className="mt-4 space-y-3 text-sm text-amber-900 dark:text-amber-100">
                  <div>
                    <dt className="font-medium opacity-75">Bank</dt>
                    <dd className="font-extrabold">{manualPaymentDetails.bank.bankName}</dd>
                  </div>
                  <div>
                    <dt className="font-medium opacity-75">Nomor Rekening</dt>
                    <dd className="font-extrabold">{manualPaymentDetails.bank.accountNumber}</dd>
                  </div>
                  <div>
                    <dt className="font-medium opacity-75">Atas Nama</dt>
                    <dd className="font-extrabold">{manualPaymentDetails.bank.accountName}</dd>
                  </div>
                </dl>
              ) : (
                <dl className="mt-4 space-y-3 text-sm text-amber-900 dark:text-amber-100">
                  <div>
                    <dt className="font-medium opacity-75">{manualPaymentDetails.ewallet.label}</dt>
                    <dd className="font-extrabold">{manualPaymentDetails.ewallet.phoneNumber}</dd>
                  </div>
                  <div>
                    <dt className="font-medium opacity-75">Atas Nama</dt>
                    <dd className="font-extrabold">{manualPaymentDetails.ewallet.accountName}</dd>
                  </div>
                </dl>
              )}
              <p className="mt-4 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                Setelah transfer, kirim bukti pembayaran melalui tombol konfirmasi WhatsApp.
              </p>
            </div>
          )}
        </section>

        <section className="py-6">
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">Detail Pesanan</h2>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
            <span className="text-slate-500 dark:text-slate-400">Metode Pembayaran: </span>
            <span className="font-bold text-slate-900 dark:text-white">{getPaymentMethodLabel(invoice.paymentMethod)}</span>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Nama layanan</th>
                  <th className="px-4 py-3">Deskripsi layanan</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Harga</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">{invoice.packageName}</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{invoice.packageDescription}</td>
                  <td className="px-4 py-4 text-center text-slate-700 dark:text-slate-200">{invoice.quantity}</td>
                  <td className="px-4 py-4 text-right text-slate-700 dark:text-slate-200">{formatCurrency(invoice.price)}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(invoice.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Terima kasih telah melakukan pemesanan. Tim Digital Carroll Base akan menghubungi Anda untuk proses briefing dan pengerjaan website.
            </p>
            <div className="text-left sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
                {formatCurrency(invoice.total)}
              </p>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
