import React from "react";
import { demos } from "@/data/demos";
import { DemoCard } from "@/components/DemoCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Info } from "lucide-react";

export const metadata = {
  title: "Galeri Demo Website | Digital Carroll Base",
  description: "Uji coba langsung berbagai layout demo interaktif kami: Landing Page Kafe, Company Profile Jasa, dan Katalog Toko Fashion."
};

export default function DemoPage() {
  return (
    <div className="space-y-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-10">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          Uji Coba Interaktif
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Galeri Demo Hasil Website
        </h1>
        <p className="text-slate-650 dark:text-slate-350 text-base sm:text-lg">
          Jelajahi fungsionalitas dan tampilan responsif dari contoh-contoh website yang siap kami bangun khusus untuk merek bisnis Anda.
        </p>
      </section>

      {/* Info Warning Alert */}
      <section className="max-w-4xl mx-auto">
        <div className="flex gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 p-5 rounded-2xl">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tentang Halaman Demo</h4>
            <p className="text-slate-600 dark:text-slate-450 text-xs sm:text-sm leading-relaxed">
              Semua halaman demo di bawah ini adalah representasi fungsional penuh di sisi frontend. Tombol interaksi (seperti filter kategori atau keranjang belanja) dapat diuji coba langsung. Tombol pemesanan/CTA akan mengarah langsung ke WhatsApp resmi Digital Carroll Base dengan detail pesanan otomatis.
            </p>
          </div>
        </div>
      </section>

      {/* Demos Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {demos.map((demo) => (
          <DemoCard key={demo.id} demo={demo} />
        ))}
      </section>

      {/* Custom design CTA */}
      <section className="bg-slate-100/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Punya Referensi Desain Sendiri?</h2>
        <p className="text-slate-600 dark:text-slate-350 text-sm max-w-xl mx-auto">
          Jika Anda melihat layout website kompetitor yang Anda sukai, atau memiliki sketsa desain sendiri di Figma, kami siap membantu membangunnya dari nol menggunakan standar kode modern.
        </p>
        <div className="pt-2">
          <WhatsAppButton
            size="md"
            variant="secondary"
            text="Kirim Referensi Desain ke WA"
            message="Halo Digital Carroll Base, saya punya contoh referensi desain website sendiri dan ingin menanyakannya."
          />
        </div>
      </section>
      
    </div>
  );
}
