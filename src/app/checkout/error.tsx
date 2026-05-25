"use client";

import Link from "next/link";

export default function CheckoutError() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Checkout belum dapat dimuat.</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Silakan coba kembali.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/checkout?plan=plan-landing-page"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            Coba Lagi
          </Link>
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
