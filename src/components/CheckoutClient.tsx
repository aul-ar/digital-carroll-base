"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import { pricingPlans } from "@/data/pricing";
import { createInvoiceData, formatCurrency, parsePackagePrice, PaymentMethod } from "@/lib/invoice";
import { saveInvoice } from "@/lib/invoice-storage";
import { getWhatsAppLink } from "@/utils/whatsapp";

interface DuitkuCreateTransactionResponse {
  success: boolean;
  code?: string;
  message?: string;
  detail?: string;
  data?: {
    reference?: string;
    paymentUrl?: string;
    vaNumber?: string;
    qrString?: string;
  };
}

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
  badgeLabel?: string;
  disabled?: boolean;
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
      "Pembayaran melalui nomor Virtual Account yang dibuat otomatis oleh sistem Duitku untuk setiap transaksi.",
    icon: Landmark,
  },
  {
    id: "qris",
    title: "QRIS All Payment",
    description:
      "Belum aktif di Production. Gunakan Virtual Account atau pembayaran manual untuk saat ini.",
    icon: QrCode,
    badgeLabel: "Belum aktif di Production",
    disabled: true,
  },
  {
    id: "ewallet",
    title: "E-Wallet",
    description: "Belum aktif di Production. Gunakan Virtual Account atau E-Wallet Manual untuk saat ini.",
    icon: Wallet,
    badgeLabel: "Belum aktif di Production",
    disabled: true,
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

function isAutomaticPaymentActive(method: PaymentMethod) {
  return method === "virtual_account";
}

function getDuitkuErrorMessage(code?: string, serverMessage?: string, detail?: string) {
  if (code === "MISSING_DUITKU_ENV") {
    return "Konfigurasi Duitku belum lengkap. Periksa Environment Variables di Vercel.";
  }

  if (code === "INVALID_PAYMENT_METHOD") {
    return serverMessage || "Metode pembayaran ini belum aktif di Duitku Production.";
  }

  if (code === "DUITKU_REQUEST_FAILED") {
    const baseMessage = "Duitku menolak transaksi. Periksa konfigurasi channel pembayaran atau signature.";

    return detail ? `${baseMessage} Detail: ${detail}` : baseMessage;
  }

  return serverMessage || "Gagal menyiapkan transaksi Duitku. Silakan coba lagi.";
}

interface CheckoutClientProps {
  initialPlanId?: string | null;
}

export function CheckoutClient({ initialPlanId }: CheckoutClientProps) {
  const router = useRouter();
  const selectedPlan = useMemo(
    () => pricingPlans.find((plan) => plan.id === initialPlanId) ?? null,
    [initialPlanId]
  );

  const [customer, setCustomer] = useState<CheckoutCustomer>(initialCustomer);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | "">("");
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInvoiceId, setManualInvoiceId] = useState("");

  if (!selectedPlan) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm dark:border-red-900 dark:bg-red-950/25 dark:text-red-200 sm:p-6">
        <h2 className="text-lg font-bold">Paket checkout tidak ditemukan</h2>
        <p className="mt-2 leading-relaxed">
          Silakan pilih paket dari halaman harga agar nama paket, deskripsi, dan nominal pembayaran sesuai data terbaru.
        </p>
        <Link
          href="/harga"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Halaman Harga
        </Link>
      </div>
    );
  }

  const selectedAmount = parsePackagePrice(selectedPlan.price);
  const hasCheckoutAmount = selectedAmount > 0;
  const consultationLink = getWhatsAppLink(
    `Halo Digital Carroll Base, saya ingin konsultasi untuk paket ${selectedPlan.name}.`
  );

  if (!hasCheckoutAmount) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900 dark:bg-amber-950/25 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Paket Perlu Konsultasi</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            Paket ini belum memiliki nominal tetap, jadi tidak akan dikirim ke Duitku. Silakan konsultasi dulu agar tim Digital Carroll Base dapat menentukan scope dan estimasi biaya yang tepat.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={consultationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-500"
            >
              Konsultasi via WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/harga"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Halaman Harga
            </Link>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-28">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Ringkasan Pesanan</p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">{selectedPlan.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{selectedPlan.description}</p>

          <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Plan ID</span>
              <span className="text-right font-semibold text-slate-800 dark:text-slate-100">{selectedPlan.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Harga</span>
              <span className="text-right font-extrabold text-slate-950 dark:text-white">{selectedPlan.price}</span>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  const checkoutPlan = selectedPlan;
  const checkoutAmount = selectedAmount;

  function updateCustomer(field: keyof CheckoutCustomer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setError("");
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

    return "";
  }

  function validateCheckout() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      return false;
    }

    if (!selectedPaymentMethod) {
      setPaymentError("Silakan pilih metode pembayaran terlebih dahulu.");
      return false;
    }

    if (!hasCheckoutAmount) {
      setPaymentError("Paket ini belum memiliki nominal pembayaran otomatis. Silakan konsultasi via WhatsApp.");
      return false;
    }

    setError("");
    setPaymentError("");
    return true;
  }

  function createPendingInvoice(method: PaymentMethod) {
    const invoice = createInvoiceData({
      paymentMethod: method,
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerWhatsapp: customer.whatsapp,
      businessName: customer.businessName,
      packageName: checkoutPlan.name,
      packageDescription: checkoutPlan.description,
      packagePrice: checkoutAmount,
      notes: customer.notes,
    });

    saveInvoice(invoice);
    return invoice;
  }

  async function handleAutomaticPayment(method: PaymentMethod) {
    setIsProcessing(true);
    const invoice = createPendingInvoice(method);

    try {
      const response = await fetch("/api/duitku/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: checkoutPlan.id,
          customerName: invoice.customerName,
          customerEmail: invoice.customerEmail,
          customerWhatsapp: invoice.customerWhatsapp,
          businessName: invoice.businessName,
          packageName: invoice.packageName,
          packageDescription: invoice.packageDescription,
          amount: invoice.total,
          paymentMethod: invoice.paymentMethod,
          invoiceId: invoice.invoiceId,
          orderId: invoice.orderId,
          notes: invoice.notes,
        }),
      });

      const transaction = (await response.json()) as DuitkuCreateTransactionResponse;

      if (!response.ok || !transaction.success) {
        setPaymentError(getDuitkuErrorMessage(transaction.code, transaction.message, transaction.detail));
        setIsProcessing(false);
        return;
      }

      const updatedInvoice = {
        ...invoice,
        provider: "duitku" as const,
        providerReference: transaction.data?.reference,
        providerPaymentUrl: transaction.data?.paymentUrl,
        vaNumber: transaction.data?.vaNumber,
        qrString: transaction.data?.qrString,
        merchantOrderId: invoice.orderId,
        paymentStatus: "pending" as const,
      };

      saveInvoice(updatedInvoice);

      if (transaction.data?.paymentUrl) {
        try {
          const paymentUrl = new URL(transaction.data.paymentUrl);
          window.location.assign(paymentUrl.toString());
          return;
        } catch {
          setPaymentError("Transaksi berhasil dibuat, tetapi halaman pembayaran belum tersedia. Silakan buka invoice atau hubungi admin.");
          setIsProcessing(false);
          return;
        }
      }

      router.push(`/payment/pending?invoiceId=${invoice.invoiceId}`);
    } catch {
      setPaymentError(getDuitkuErrorMessage("UNKNOWN_ERROR"));
      setIsProcessing(false);
    }
  }

  function handleManualPayment(method: PaymentMethod) {
    setIsProcessing(true);
    const invoice = createPendingInvoice(method);
    const message = `Halo Digital Carroll Base, saya ingin konfirmasi pembayaran untuk pesanan ${checkoutPlan.name}. Nama saya ${customer.fullName}.`;
    setManualInvoiceId(invoice.invoiceId);
    window.open(getWhatsAppLink(message), "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      setIsProcessing(false);
      router.push(`/invoice/${invoice.invoiceId}`);
    }, 500);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateCheckout()) {
      return;
    }

    const method = selectedPaymentMethod;

    if (!method) {
      return;
    }

    if (isManualPayment(method)) {
      handleManualPayment(method);
      return;
    }

    if (!isAutomaticPaymentActive(method)) {
      setPaymentError("Metode pembayaran ini belum aktif di Duitku Production.");
      return;
    }

    handleAutomaticPayment(method);
  }

  function renderPaymentCard(option: PaymentOption) {
    const Icon = option.icon;
    const selected = selectedPaymentMethod === option.id;
    const badgeLabel = option.badgeLabel ?? (isManualPayment(option.id) ? "Manual" : "Duitku");
    const badgeClassName = option.disabled
      ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
      : isManualPayment(option.id)
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";

    return (
      <button
        key={option.id}
        type="button"
        disabled={option.disabled}
        onClick={() => {
          setSelectedPaymentMethod(option.id);
          setPaymentError("");
        }}
        className={`w-full rounded-2xl border p-4 text-left transition ${
          option.disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-75 dark:border-slate-800 dark:bg-slate-900"
            : selected
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
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badgeClassName}`}>
                {badgeLabel}
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

  const submitLabel = isProcessing
    ? "Memproses..."
    : isManualPayment(selectedPaymentMethod)
      ? "Konfirmasi via WhatsApp"
      : "Lanjutkan Pembayaran";

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Form Data Pemesan</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Lengkapi data utama agar tim Digital Carroll Base dapat menyiapkan proses briefing.
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

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/25 dark:text-red-300">
              {error}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Pilih Metode Pembayaran</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Silakan pilih metode pembayaran yang paling sesuai. Pembayaran otomatis akan diproses melalui Duitku, sedangkan pembayaran manual memerlukan konfirmasi melalui WhatsApp.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pembayaran Otomatis via Duitku
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

          {paymentError && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/25 dark:text-red-300">
              {paymentError}
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
              disabled={isProcessing || !hasCheckoutAmount}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitLabel}
              {!isProcessing && <ArrowRight className="h-4 w-4" />}
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
        <h2 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">{checkoutPlan.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{checkoutPlan.description}</p>

        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Plan ID</span>
            <span className="text-right font-semibold text-slate-800 dark:text-slate-100">{checkoutPlan.id}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Harga</span>
            <span className="text-right font-extrabold text-slate-950 dark:text-white">{checkoutPlan.price}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Total</span>
            <span className="text-right font-extrabold text-slate-950 dark:text-white">{formatCurrency(checkoutAmount)}</span>
          </div>
        </div>

        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          Harga dapat menyesuaikan scope final, domain, hosting, aset premium, dan integrasi tambahan.
        </p>
      </aside>
    </form>
  );
}
