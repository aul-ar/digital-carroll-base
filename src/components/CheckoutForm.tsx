"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CreditCard, Landmark, Loader2, Wallet } from "lucide-react";
import {
  CustomerData,
  formatCurrency,
  getPlanAmount,
  getPlanById,
  getPlanCheckoutDescription,
  isManualPayment,
  PaymentMethod,
  paymentMethodLabels,
} from "@/lib/invoice";
import { saveInvoice } from "@/lib/invoice-storage";

const paymentMethods: {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: "virtual_account",
    title: "Virtual Account",
    description: "Otomatis via Duitku Sandbox",
    icon: Landmark,
  },
  {
    id: "qris",
    title: "QRIS",
    description: "Otomatis via Duitku Sandbox",
    icon: CreditCard,
  },
  {
    id: "ewallet",
    title: "E-Wallet",
    description: "Otomatis via Duitku Sandbox",
    icon: Wallet,
  },
  {
    id: "bank_transfer_manual",
    title: "Transfer Bank BCA",
    description: "Pembayaran manual alternatif",
    icon: Landmark,
  },
  {
    id: "ewallet_manual",
    title: "E-Wallet Manual",
    description: "Pembayaran manual alternatif",
    icon: Wallet,
  },
];

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get("plan") ?? "plan-company-profile";
  const selectedPlan = useMemo(() => getPlanById(selectedPlanId), [selectedPlanId]);
  const amount = getPlanAmount(selectedPlan.price);

  const [customer, setCustomer] = useState<CustomerData>({
    fullName: "",
    email: "",
    whatsapp: "",
    businessName: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("virtual_account");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateCustomer(field: keyof CustomerData, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          paymentMethod,
          planId: selectedPlan.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Invoice gagal dibuat. Coba beberapa saat lagi.");
      }

      const { invoice } = await response.json();
      saveInvoice(invoice);

      if (isManualPayment(paymentMethod)) {
        router.push(`/invoice/${invoice.invoiceId}`);
        return;
      }

      const transactionResponse = await fetch("/api/duitku/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice }),
      });

      if (!transactionResponse.ok) {
        router.push(`/payment/pending?invoiceId=${invoice.invoiceId}`);
        return;
      }

      const { paymentUrl, reference } = await transactionResponse.json();
      saveInvoice({ ...invoice, paymentUrl, duitkuReference: reference });
      window.location.href = paymentUrl;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Data Pemesan</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nama lengkap
              <input
                required
                value={customer.fullName}
                onChange={(event) => updateCustomer("fullName", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="Nama Anda"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Email
              <input
                required
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
                required
                value={customer.whatsapp}
                onChange={(event) => updateCustomer("whatsapp", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="08xxxxxxxxxx"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nama bisnis / brand
              <input
                required
                value={customer.businessName}
                onChange={(event) => updateCustomer("businessName", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
                placeholder="Nama bisnis Anda"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Metode Pembayaran</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const selected = paymentMethod === method.id;

              return (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    selected
                      ? "border-blue-500 bg-blue-50/70 ring-4 ring-blue-500/10 dark:bg-blue-950/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selected}
                    onChange={() => setPaymentMethod(method.id)}
                    className="mt-1"
                  />
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{method.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {method.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Ringkasan Pesanan</p>
        <h2 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">{selectedPlan.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {getPlanCheckoutDescription(selectedPlan.id)}
        </p>
        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Metode</span>
            <span className="text-right font-semibold text-slate-800 dark:text-slate-100">{paymentMethodLabels[paymentMethod]}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 dark:border-slate-800">
            <span className="font-bold text-slate-950 dark:text-white">Total</span>
            <span className="font-extrabold text-slate-950 dark:text-white">{formatCurrency(amount)}</span>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/25 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || amount <= 0}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Lanjutkan Pembayaran
        </button>
      </aside>
    </form>
  );
}
