"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import { getCheckoutPackage } from "@/lib/checkout-packages";
import { createInvoiceData, PaymentMethod } from "@/lib/invoice";
import { saveInvoice } from "@/lib/invoice-storage";
import { getWhatsAppLink } from "@/utils/whatsapp";

interface CheckoutCustomer {
  fullName: string;
  email: string;
  whatsapp: string;
  businessName: string;
  notes: string;
}

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: typeof CreditCard;
  details?: {
    label: string;
    value: string;
  }[];
}

const automaticPaymentOptions: PaymentOption[] = [
  {
    id: "virtual_account",
    title: "Virtual Account",
    description:
      "Pembayaran melalui nomor Virtual Account yang dibuat otomatis oleh sistem Duitku Sandbox untuk setiap transaksi.",
    icon: Landmark,
  },
  {
    id: "qris",
    title: "QRIS All Payment",
    description:
      "Bayar menggunakan aplikasi apa pun yang mendukung QRIS, seperti mobile banking, GoPay, OVO, DANA, ShopeePay, dan aplikasi pembayaran lainnya.",
    icon: QrCode,
  },
  {
    id: "ewallet",
    title: "E-Wallet",
    description: "Pembayaran melalui dompet digital yang didukung oleh sistem Duitku Sandbox.",
    icon: Wallet,
  },
];

const manualPaymentOptions: PaymentOption[] = [
  {
    id: "bank_transfer_manual",
    title: "Transfer Bank BCA",
    description:
      "Alternatif pembayaran manual melalui transfer bank. Setelah transfer, customer perlu melakukan konfirmasi melalui WhatsApp.",
    icon: Landmark,
    details: [
      { label: "Bank", value: "BCA" },
      { label: "Nomor Rekening", value: "6580812382" },
      { label: "Atas Nama", value: "Aulia Abdul Rahman" },
    ],
  },
  {
    id: "ewallet_manual",
    title: "E-Wallet Manual",
    description:
      "Alternatif pembayaran manual melalui nomor e-wallet. Gunakan metode ini jika pembayaran otomatis belum tersedia atau mengalami kendala.",
    icon: Wallet,
    details: [
      { label: "Nomor", value: "081288430688" },
      { label: "Atas Nama", value: "Aulia Abdul Rahman" },
    ],
  },
];

const initialCustomer: CheckoutCustomer = {
  fullName: "",
  email: "",
  whatsapp: "",
  businessName: "",
  notes: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isManualPayment(method: PaymentMethod | "") {
  return method === "bank_transfer_manual" || method === "ewallet_manual";
}

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPackageId = searchParams.get("package");
  const selectedPackage = useMemo(() => getCheckoutPackage(selectedPackageId), [selectedPackageId]);

  const [customer, setCustomer] = useState<CheckoutCustomer>(initialCustomer);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [manualInvoiceId, setManualInvoiceId] = useState("");

  function updateCustomer(field: keyof CheckoutCustomer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function validateForm() {
    if (!customer.fullName.trim()) {
      return "Nama lengkap wajib diisi.";
    }

    if (!customer.email.trim()) {
      return "Email wajib diisi.";
    }

    if (!isValidEmail(customer.email)) {
      return "Format email belum valid.";
    }

    if (!customer.whatsapp.trim()) {
      return "Nomor WhatsApp wajib diisi.";
    }

    if (!paymentMethod) {
      return "Silakan pilih metode pembayaran terlebih dahulu.";
    }

    return "";
  }

  function createPendingInvoice(method: PaymentMethod) {
    const invoice = createInvoiceData({
      paymentMethod: method,
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerWhatsapp: customer.whatsapp,
      businessName: customer.businessName,
      packageName: selectedPackage.name,
      packageDescription: selectedPackage.description,
      packagePrice: selectedPackage.price,
      notes: customer.notes,
    });

    saveInvoice(invoice);
    return invoice;
  }

  function handleAutomaticPayment(method: PaymentMethod) {
    setIsLoading(true);
    const invoice = createPendingInvoice(method);

    window.setTimeout(() => {
      router.push(`/payment/pending?invoiceId=${invoice.invoiceId}`);
    }, 450);
  }

  function handleManualPayment(method: PaymentMethod) {
    setIsLoading(true);
    const invoice = createPendingInvoice(method);
    const message = `Halo Digital Carroll Base, saya ingin konfirmasi pembayaran untuk pesanan ${selectedPackage.name}. Nama saya ${customer.fullName}.`;
    setManualInvoiceId(invoice.invoiceId);
    window.open(getWhatsAppLink(message), "_blank", "noopener,noreferrer");
    window.setTimeout(() => setIsLoading(false), 500);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError("");

    if (!paymentMethod) {
      return;
    }

    if (isManualPayment(paymentMethod)) {
      handleManualPayment(paymentMethod);
      return;
    }

    handleAutomaticPayment(paymentMethod);
  }

  function renderPaymentCard(option: PaymentOption) {
    const Icon = option.icon;
    const selected = paymentMethod === option.id;

    return (
      <button
        key={option.id}
        type="button"
        onClick={() => setPaymentMethod(option.id)}
        className={`w-full rounded-2xl border p-4 text-left transition ${
          selected
            ? "border-blue-500 bg-blue-50/80 ring-4 ring-blue-500/10 dark:bg-blue-950/25"
            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              selected
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">{option.title}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isManualPayment(option.id)
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                }`}
              >
                {isManualPayment(option.id) ? "Manual" : "Duitku Sandbox"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{option.description}</p>
            {option.details && (
              <dl className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-900">
                {option.details.map((detail) => (
                  <div key={detail.label} className="flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-slate-400">{detail.label}</dt>
                    <dd className="text-right font-bold text-slate-800 dark:text-slate-100">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </button>
    );
  }

  const submitLabel = isLoading
    ? "Memproses..."
    : isManualPayment(paymentMethod)
      ? "Konfirmasi via WhatsApp"
      : "Lanjutkan Pembayaran";

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Form Data Pemesan</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Data ini digunakan untuk verifikasi pesanan dan briefing awal.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nama lengkap
              <input
                value={customer.fullName}
                onChange={(event) => updateCustomer("fullName", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="Nama Anda"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Email
              <input
                type="email"
                value={customer.email}
                onChange={(event) => updateCustomer("email", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="email@domain.com"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nomor WhatsApp
              <input
                value={customer.whatsapp}
                onChange={(event) => updateCustomer("whatsapp", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="08xxxxxxxxxx"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nama bisnis / brand
              <input
                value={customer.businessName}
                onChange={(event) => updateCustomer("businessName", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="Nama bisnis Anda"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:col-span-2">
              Catatan kebutuhan website
              <textarea
                rows={4}
                value={customer.notes}
                onChange={(event) => updateCustomer("notes", event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="Contoh: butuh landing page untuk iklan, referensi desain, jumlah halaman, atau fitur khusus."
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Pilih Metode Pembayaran</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pilih pembayaran otomatis via Duitku Sandbox atau metode manual cadangan.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pembayaran Otomatis via Duitku Sandbox
              </p>
              <div className="grid gap-3 md:grid-cols-3">{automaticPaymentOptions.map(renderPaymentCard)}</div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pembayaran Manual
              </p>
              <div className="grid gap-3 md:grid-cols-2">{manualPaymentOptions.map(renderPaymentCard)}</div>
            </div>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/25 dark:text-red-300">
              {error}
            </p>
          )}

          {manualInvoiceId && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-200">
              Invoice manual berhasil dibuat.{" "}
              <Link href={`/invoice/${manualInvoiceId}`} className="font-bold underline underline-offset-4">
                Lihat Invoice
              </Link>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitLabel}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Ringkasan Pesanan</p>
        <h2 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">{selectedPackage.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{selectedPackage.description}</p>

        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Package ID</span>
            <span className="text-right font-semibold text-slate-800 dark:text-slate-100">{selectedPackage.id}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Harga</span>
            <span className="text-right font-extrabold text-slate-950 dark:text-white">{selectedPackage.price}</span>
          </div>
        </div>

        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          Harga final dapat menyesuaikan scope halaman, konten, fitur, domain, hosting, dan integrasi tambahan.
        </p>
      </aside>
    </form>
  );
}
