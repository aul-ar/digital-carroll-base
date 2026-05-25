import React from "react";
import Link from "next/link";
import { services } from "@/data/services";
import { pricingPlans } from "@/data/pricing";
import { demos } from "@/data/demos";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Check, ArrowLeft, Eye, Clock, Tag, ShoppingCart, ShoppingBag, DollarSign } from "lucide-react";

export const metadata = {
  title: "Online Store Sederhana | Digital Carroll Base",
  description: "Bangun toko online sederhana dengan katalog produk, detail item, keranjang, dan checkout langsung melalui website.",
};

export default function OnlineStoreSederhanaService() {
  const service = services.find((s) => s.id === "online-store-sederhana")!;
  const plan = pricingPlans.find((p) => p.targetServiceSlug === "online-store-sederhana")!;
  const demo = demos.find((d) => d.slug === "online-store-sederhana")!;

  const highlights = [
    {
      icon: ShoppingBag,
      title: "Katalog Produk Profesional",
      description: "Tampilkan produk, harga, dan detail secara rapi dalam layout yang mudah dinavigasi."
    },
    {
      icon: DollarSign,
      title: "Checkout Website Mudah",
      description: "Pelanggan dapat melanjutkan pesanan dari keranjang dengan ringkasan transaksi yang jelas."
    },
    {
      icon: ShoppingCart,
      title: "Keranjang Ringkas",
      description: "Sistem keranjang sederhana membantu pengunjung mengumpulkan item sebelum checkout."
    }
  ];

  return (
    <div className="pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div>
        <Link
          href="/layanan"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Layanan</span>
        </Link>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-300 rounded-full text-xs font-semibold">
            <ShoppingCart className="w-3.5 h-3.5" />
            Toko Online Tanpa Ribet
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {service.title}
          </h1>
          <p className="text-slate-650 dark:text-slate-350 text-base sm:text-lg leading-relaxed">
            {service.fullDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-blue-500" />
              {service.deliveryTime}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              <Tag className="w-4 h-4 text-purple-500" />
              {service.priceStartingFrom}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href={demo.previewUrl}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-full text-sm shadow-md hover:scale-103 transition-all duration-200 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Lihat Live Demo Halaman
            </Link>
            <WhatsAppButton
              variant="primary"
              text="Pesan Online Store"
              message={`Halo Digital Carroll Base, saya tertarik memesan layanan Online Store Sederhana.`}
            />
          </div>
        </div>

        <div className="lg:col-span-5 relative bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/10 min-h-64 flex flex-col justify-between">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="space-y-4 relative z-10">
            <span className="text-xs uppercase font-extrabold text-emerald-200 tracking-wider">Highlight Paket</span>
            <h3 className="text-2xl font-bold">Website Toko Online Siap Jualan</h3>
            <ul className="space-y-2.5 text-sm text-slate-100 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Katalog produk responsif dengan detail lengkap</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Keranjang sederhana sebelum checkout website</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Checkout langsung melalui website</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fitur promo dan produk populer</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/10 relative z-10">
            <span className="text-xs text-emerald-200 block">Estimasi Harga</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold">{plan.price}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {highlights.map((hl, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <hl.icon className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{hl.title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{hl.description}</p>
          </div>
        ))}
      </section>

      <section className="bg-slate-100/50 dark:bg-slate-900/10 p-8 sm:p-12 rounded-3xl space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mengapa Pilih Online Store Sederhana</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.benefits.map((benefit, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-350 font-medium leading-relaxed">{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fitur Utama Online Store</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {service.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-350">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold">Jual Produk Anda Lebih Cepat</h2>
          <p className="text-emerald-100 text-xs sm:text-sm">Bangun toko online sederhana yang memudahkan pelanggan memilih produk dan melanjutkan pemesanan melalui website.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href={demo.previewUrl}
            className="inline-flex items-center justify-center gap-1.5 bg-white text-slate-950 font-bold px-6 py-3 rounded-full text-xs sm:text-sm hover:bg-slate-100 transition-colors shadow-md text-center"
          >
            <span>Buka Demo</span>
            <Eye className="w-4 h-4" />
          </Link>
          <WhatsAppButton
            variant="primary"
            className="bg-emerald-700! text-white! hover:bg-emerald-600! w-full sm:w-auto"
            text="Pesan Sekarang"
            message="Halo Digital Carroll Base, saya tertarik memesan Online Store Sederhana."
          />
        </div>
      </section>
    </div>
  );
}
