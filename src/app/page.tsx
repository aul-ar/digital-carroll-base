import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  HeartHandshake
} from "lucide-react";
import { services } from "@/data/services";
import { demos } from "@/data/demos";
import { pricingPlans } from "@/data/pricing";
import { ServiceCard } from "@/components/ServiceCard";
import { DemoCard } from "@/components/DemoCard";
import { PricingCard } from "@/components/PricingCard";
import { FAQSection } from "@/components/FAQSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function HomePage() {
  // Steps for the work process
  const processSteps = [
    {
      step: "01",
      title: "Konsultasi Kebutuhan",
      description: "Kami mulai dengan memahami jenis bisnis, tujuan website, target pelanggan, referensi desain, dan fitur yang dibutuhkan."
    },
    {
      step: "02",
      title: "Perencanaan Konten & Desain",
      description: "Struktur halaman, alur informasi, tampilan visual, dan copywriting disusun agar website terlihat profesional dan mudah dipahami pengunjung."
    },
    {
      step: "03",
      title: "Development & Revisi",
      description: "Website dikembangkan menggunakan teknologi modern, lalu Anda dapat meninjau hasilnya dan mengajukan revisi sesuai ketentuan paket."
    },
    {
      step: "04",
      title: "Publikasi & Panduan Dasar",
      description: "Setelah final, website dibantu untuk dipublikasikan. Kami juga memberikan panduan dasar agar Anda memahami cara menggunakan website."
    }
  ];

  // Benefits / Core pillars of Digital Carroll Base
  const corePillars = [
    {
      icon: Zap,
      title: "Website Ringan & Responsif",
      description: "Dibuat dengan struktur modern agar tampilan nyaman dibuka dari HP, tablet, maupun desktop.",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
    },
    {
      icon: ShieldCheck,
      title: "Struktur Website Rapi",
      description: "Layout, navigasi, dan konten disusun agar pengunjung mudah memahami layanan bisnis Anda.",
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30"
    },
    {
      icon: HeartHandshake,
      title: "Bantuan Publikasi Website",
      description: "Kami membantu proses deploy, pengaturan custom domain, dan konfigurasi dasar agar website dapat diakses publik dengan rapi.",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
    }
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[75vh] flex items-center pt-8 md:pt-16">
        {/* Glow backgrounds */}
        <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/10 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Jasa Pembuatan Website Kredibel
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight max-w-4xl mx-auto">
            Website Modern untuk Bisnis yang Ingin{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              Tampil Profesional
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-350 max-w-2xl mx-auto leading-relaxed">
            Kami membantu UMKM, personal brand, dan bisnis lokal memiliki website modern, responsif, dan mudah dihubungi pelanggan.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/layanan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg shadow-indigo-500/20 hover:from-blue-500 hover:to-purple-500 hover:scale-103 transition-all duration-300 gap-2 cursor-pointer"
            >
              <span>Lihat Layanan</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <WhatsAppButton
              variant="outline"
              className="w-full sm:w-auto border-slate-300! text-slate-700! dark:text-slate-300! dark:border-slate-800! hover:bg-slate-100! dark:hover:bg-slate-900!"
              text="Konsultasi via WhatsApp"
              message="Halo Digital Carroll Base, saya ingin berkonsultasi mengenai pembuatan website untuk bisnis saya."
            />
          </div>
        </div>
      </section>

      {/* 2. Short Explanation About Digital Carroll Base */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Tentang Digital Carroll Base
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Mengapa Memilih Digital Carroll Base?
            </h2>
            <p className="text-slate-650 dark:text-slate-350 text-base sm:text-lg leading-relaxed">
              Digital Carroll Base membantu UMKM, personal brand, dan bisnis kecil membangun website modern yang rapi, cepat, dan mudah dipahami calon pelanggan. Kami fokus pada landing page, company profile, katalog online, dan website bisnis sederhana yang siap digunakan untuk promosi, branding, dan meningkatkan kepercayaan pelanggan.
            </p>
            
            {/* Core Pillars list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {corePillars.map((pillar, i) => (
                <div key={i} className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pillar.color}`}>
                    <pillar.icon className="w-5.5 h-5.5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pillar.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Graphic Panel / Stats */}
          <div className="relative bg-slate-900 rounded-3xl p-8 sm:p-12 overflow-hidden text-white shadow-xl shadow-blue-950/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">FOKUS UTAMA KAMI</span>
                <h3 className="text-2xl font-bold">Membuat Website Bisnis yang Siap Dipakai untuk Promosi</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                <div className="space-y-1">
                  <span className="text-3xl font-extrabold text-blue-400">100%</span>
                  <p className="text-xs text-slate-400">Tampilan Responsif</p>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-extrabold text-purple-400">&lt; 3 Detik</span>
                  <p className="text-xs text-slate-400">Target Akses Cepat</p>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-extrabold text-emerald-400">Gratis</span>
                  <p className="text-xs text-slate-400">Konsultasi Awal</p>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-extrabold text-pink-400">Praktis</span>
                  <p className="text-xs text-slate-400">Proses Pengerjaan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Main Service Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-900/10 py-16 rounded-3xl">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Layanan Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Solusi Pembuatan Website Terbaik
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base">
            Kami menyediakan paket spesifik yang dirancang sesuai skala kebutuhan bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Harga belum termasuk pembelian domain, hosting, aset premium, atau biaya layanan pihak ketiga. Jika diperlukan, kami dapat membantu proses setup dan konfigurasi dasar.
        </p>
      </section>

      {/* 4. Demo Website Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16 gap-4">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Live Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Lihat Contoh Hasil Website
            </h2>
            <p className="text-slate-650 dark:text-slate-450 text-sm sm:text-base">
              Jangan beli kucing dalam karung. Jelajahi interaktif berbagai jenis layout yang dapat langsung Anda miliki.
            </p>
          </div>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
          >
            <span>Semua Demo Website</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {demos.map((demo) => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </div>
      </section>

      {/* 5. Work Process Section */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        {/* Glow decoration */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-450 text-blue-400">
            Alur Kerja Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            4 Langkah Mudah Memiliki Website
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Proses kerja dibuat sederhana dan terstruktur agar kebutuhan website Anda dapat dipahami, dikerjakan, dan dipublikasikan dengan lebih rapi.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {processSteps.map((step, i) => (
            <div key={i} className="relative space-y-4 group">
              {/* Step indicator */}
              <div className="text-5xl font-black text-slate-800 group-hover:text-blue-500/30 transition-colors duration-300">
                {step.step}
              </div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
              
              {/* Connecting line for desktop */}
              {i < 3 && (
                <div className="hidden md:block absolute top-6 left-1/2 w-full h-[1px] bg-slate-800 -z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Pricing Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Investasi Bisnis
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Paket Harga Transparan & Jujur
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base">
            Biaya satu kali bayar (one-time fee) di awal dengan cakupan fitur yang jelas sesuai kebutuhan website bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Harga belum termasuk pembelian domain, hosting, aset premium, atau biaya layanan pihak ketiga. Jika diperlukan, kami dapat membantu proses setup dan konfigurasi dasar.
        </p>

        <div className="text-center mt-10">
          <Link
            href="/harga"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Bandingkan Detail Paket & Fitur</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-650 dark:text-purple-400">
            Pertanyaan Umum
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Paling Sering Ditanyakan (FAQ)
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base">
            Jawaban cepat untuk membantu Anda memahami detail layanan dan teknis pembuatan website.
          </p>
        </div>

        <FAQSection />
      </section>

      {/* 8. WhatsApp CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-blue-650 to-indigo-900 dark:from-slate-900 dark:to-indigo-950/60 p-8 sm:p-14 rounded-3xl text-center text-white relative overflow-hidden shadow-xl shadow-indigo-950/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-650/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Punya Pertanyaan Khusus Mengenai Website Impian Anda?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Konsultasikan secara gratis apa saja yang bisnis Anda perlukan. Tim developer kami siap menjawab pertanyaan teknis maupun non-teknis secara ramah.
            </p>
            <div className="pt-4">
              <WhatsAppButton
                size="lg"
                variant="primary"
                className="bg-white! text-blue-900! hover:bg-slate-100! shadow-lg hover:shadow-white/10"
                text="Konsultasikan via WhatsApp Sekarang"
                message="Halo Digital Carroll Base, saya ingin tanya-tanya seputar pembuatan website."
              />
            </div>
            <p className="text-xs text-slate-350">
              Respons cepat dalam waktu kurang dari 30 menit (Jam Kerja: 08.00 - 21.00 WIB)
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
