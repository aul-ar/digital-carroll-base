import React from "react";
import { pricingPlans } from "@/data/pricing";
import { PricingCard } from "@/components/PricingCard";
import { FAQSection } from "@/components/FAQSection";
import { Check, X, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Daftar Harga Pembuatan Website | Digital Carroll Base",
  description: "Bandingkan harga paket pembuatan website dari Digital Carroll Base. Transparan, terjangkau, satu kali bayar (one-time fee)."
};

export default function HargaPage() {
  const comparisonFeatures = [
    { name: "Target Utama Bisnis", landing: "Produk Tunggal / Iklan", profile: "Profil Perusahaan & Jasa", catalog: "Etalase Toko / Retailer" },
    { name: "Jumlah Halaman Utama", landing: "1 Halaman (One-Page)", profile: "Hingga 5 Halaman", catalog: "Halaman Produk Unlimited" },
    { name: "Bantuan Custom Domain", landing: true, profile: true, catalog: true },
    { name: "Bantuan Deploy Website", landing: true, profile: true, catalog: true },
    { name: "Pengaturan Dasar Website", landing: true, profile: true, catalog: true },
    { name: "Responsive Desain (Mobile & Tablet)", landing: true, profile: true, catalog: true },
    { name: "Copywriting Struktur Konversi", landing: true, profile: false, catalog: false },
    { name: "Integrasi Tombol Pemesanan WA", landing: true, profile: true, catalog: true },
    { name: "Fitur Keranjang Belanja WA", landing: false, profile: false, catalog: true },
    { name: "Fitur Pencarian & Filter Produk", landing: false, profile: false, catalog: true },
    { name: "Waktu Pengerjaan Selesai", landing: "3-5 Hari Kerja", profile: "7-10 Hari Kerja", catalog: "10-14 Hari Kerja" },
    { name: "Garansi Pemeliharaan Bug", landing: "30 Hari", profile: "30 Hari", catalog: "30 Hari" },
  ];

  return (
    <div className="space-y-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-10">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Paket Investasi Digital
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Pilihan Paket & Harga Pembuatan Website
        </h1>
        <p className="text-slate-650 dark:text-slate-350 text-base sm:text-lg">
          Semua biaya bersifat transparan tanpa biaya tersembunyi. Pilih paket yang paling cocok untuk mendukung pertumbuhan skala bisnis Anda.
        </p>
      </section>

      {/* Pricing Cards Grid */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
        <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Harga belum termasuk pembelian domain, hosting, aset premium, atau biaya layanan pihak ketiga. Jika diperlukan, kami dapat membantu proses setup dan konfigurasi dasar.
        </p>
      </section>

      {/* Comparison Table Section */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Bandingkan Fitur Secara Detail
          </h2>
          <p className="text-slate-650 dark:text-slate-450 text-xs sm:text-sm">
            Lihat perbandingan lengkap fitur yang didapatkan pada masing-masing paket.
          </p>
        </div>

        {/* Table container for responsiveness */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-5 font-bold text-slate-900 dark:text-white">Fitur Website</th>
                <th className="p-5 font-bold text-slate-900 dark:text-white">Landing Page</th>
                <th className="p-5 font-bold text-slate-900 dark:text-white">Company Profile</th>
                <th className="p-5 font-bold text-slate-900 dark:text-white">Katalog Produk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparisonFeatures.map((feat, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                  <td className="p-5 font-semibold text-slate-800 dark:text-slate-350">{feat.name}</td>
                  
                  {/* Landing cell */}
                  <td className="p-5">
                    {typeof feat.landing === "boolean" ? (
                      feat.landing ? (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-500/70" />
                      )
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{feat.landing}</span>
                    )}
                  </td>

                  {/* Profile cell */}
                  <td className="p-5">
                    {typeof feat.profile === "boolean" ? (
                      feat.profile ? (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-500/70" />
                      )
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{feat.profile}</span>
                    )}
                  </td>

                  {/* Catalog cell */}
                  <td className="p-5">
                    {typeof feat.catalog === "boolean" ? (
                      feat.catalog ? (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-500/70" />
                      )
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{feat.catalog}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust banner */}
      <section className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/50 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-550/15 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Semua Transaksi Dilindungi Garansi</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Garansi 30 hari pemeliharaan error, bug, maupun link rusak pasca go-live secara cuma-cuma.</p>
          </div>
        </div>
      </section>

      {/* FAQ block */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Pertanyaan Mengenai Harga
          </h2>
          <p className="text-slate-650 dark:text-slate-450 text-xs sm:text-sm">
            Temukan jawaban singkat seputar domain perpanjangan tahunan, hosting, dan mekanisme pembayaran.
          </p>
        </div>
        <FAQSection />
      </section>
      
    </div>
  );
}
