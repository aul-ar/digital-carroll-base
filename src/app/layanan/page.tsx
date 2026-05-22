import React from "react";
import { services } from "@/data/services";
import { ServiceCard } from "@/components/ServiceCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { HelpCircle } from "lucide-react";

export const metadata = {
  title: "Layanan Pembuatan Website | Digital Carroll Base",
  description: "Pilih layanan pembuatan website yang sesuai dengan kebutuhan bisnis Anda: Landing Page, Company Profile, atau Katalog Produk Online."
};

export default function LayananPage() {
  return (
    <div className="space-y-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-10">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Solusi Digital Kami
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Layanan Pembuatan Website Profesional
        </h1>
        <p className="text-slate-650 dark:text-slate-350 text-base sm:text-lg">
          Mulai dari halaman promosi konversi tinggi hingga katalog produk interaktif, kami siap merealisasikan platform online terbaik untuk bisnis Anda.
        </p>
      </section>

      {/* Services Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </section>

      {/* Process summary / CTA banner */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wider text-blue-300">
            <HelpCircle className="w-3.5 h-3.5" />
            Butuh Fitur Khusus atau Kustomisasi?
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ingin Konsultasi Desain atau Penawaran Kustom?
          </h2>
          <p className="text-slate-350 text-sm">
            Jika bisnis Anda memiliki alur kerja unik, form pendaftaran bertingkat, atau integrasi API tertentu, tim kami siap membangun solusi kustom sesuai kebutuhan Anda.
          </p>
          <div className="pt-2">
            <WhatsAppButton
              size="md"
              variant="primary"
              className="bg-white! text-slate-950! hover:bg-slate-100!"
              text="Diskusikan Kebutuhan Kustom via WA"
              message="Halo Digital Carroll Base, saya ingin mendiskusikan pembuatan website kustom dengan fitur khusus."
            />
          </div>
        </div>
      </section>
      
    </div>
  );
}
