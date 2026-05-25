import { Suspense } from "react";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata = {
  title: "Checkout Website | Digital Carroll Base",
  description: "Lengkapi data pemesan dan pilih metode pembayaran untuk layanan Digital Carroll Base.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <section className="mb-8 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Checkout</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
          Lengkapi Pemesanan Website
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
          Isi data pemesan, pilih metode pembayaran, lalu sistem akan membuat order dan invoice dengan status pending.
        </p>
      </section>
      <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Memuat checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
