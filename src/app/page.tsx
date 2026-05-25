import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  HeartHandshake,
  CheckCircle2,
  Info
} from "lucide-react";
import { services } from "@/data/services";
import { demos } from "@/data/demos";
import { pricingPlans } from "@/data/pricing";
import { ServiceCard } from "@/components/ServiceCard";
import { DemoCard } from "@/components/DemoCard";
import { PricingCard } from "@/components/PricingCard";
import { FAQSection } from "@/components/FAQSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Reveal } from "@/components/Reveal";

export default function HomePage() {
  // Steps for the customer ordering flow
  const processSteps = [
    {
      step: "01",
      title: "Pilih Paket",
      description: "Pilih paket website yang sesuai dengan kebutuhan bisnis Anda."
    },
    {
      step: "02",
      title: "Isi Checkout",
      description: "Lengkapi data pemesan, informasi brand, dan kebutuhan website."
    },
    {
      step: "03",
      title: "Pilih Pembayaran",
      description: "Gunakan Virtual Account, QRIS All Payment, E-Wallet, atau metode manual yang tersedia."
    },
    {
      step: "04",
      title: "Terima Invoice",
      description: "Invoice dibuat otomatis sebagai bukti pemesanan dan ringkasan transaksi."
    },
    {
      step: "05",
      title: "Briefing Project",
      description: "Tim Digital Carroll Base akan menghubungi Anda untuk proses briefing dan pengerjaan."
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

  const includedItems = [
    "Desain website responsif",
    "Struktur halaman sesuai kebutuhan paket",
    "Penyusunan konten dasar",
    "Checkout website dengan pilihan pembayaran otomatis atau manual",
    "Invoice otomatis sebagai bukti pemesanan",
    "Kontak WhatsApp untuk konsultasi dan konfirmasi manual",
    "Form kontak sederhana jika diperlukan",
    "Bantuan publikasi website",
    "Panduan penggunaan dasar"
  ];

  const excludedItems = [
    "Pembelian domain tahunan",
    "Biaya hosting atau server",
    "Aset premium seperti font, gambar, icon, atau template berbayar",
    "Biaya layanan pihak ketiga",
    "Fitur custom kompleks di luar cakupan paket",
    "Integrasi khusus di luar metode pembayaran yang tersedia",
    "Pengelolaan iklan, SEO lanjutan, atau maintenance rutin bulanan"
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
          <Reveal y={18} duration={600}>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Jasa Pembuatan Website Kredibel
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={90} y={22} duration={680}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight max-w-4xl mx-auto">
              Website Modern untuk Bisnis yang Ingin{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                Tampil Profesional
              </span>
            </h1>
          </Reveal>

          {/* Subheadline */}
          <Reveal delay={180} y={22} duration={680}>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-350 max-w-2xl mx-auto leading-relaxed">
              Kami membantu UMKM, personal brand, dan bisnis lokal memiliki website modern, responsif, dan mudah dihubungi pelanggan.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={270} y={20} duration={680}>
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
          </Reveal>
        </div>
      </section>

      {/* 2. Short Explanation About Digital Carroll Base */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <Reveal className="space-y-6">
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
                <Reveal key={i} delay={Math.min(i * 90, 270)} y={18} className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pillar.color}`}>
                    <pillar.icon className="w-5.5 h-5.5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pillar.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pillar.description}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>

          {/* Graphic Panel / Stats */}
          <Reveal delay={120} y={28} className="relative bg-slate-900 rounded-3xl p-8 sm:p-12 overflow-hidden text-white shadow-xl shadow-blue-950/20">
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
                  <span className="text-3xl font-extrabold text-purple-400">Ringan</span>
                  <p className="text-xs text-slate-400">Struktur Website Optimal</p>
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
          </Reveal>
        </div>
      </section>

      {/* 3. Three Main Service Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-900/10 py-16 rounded-3xl">
        <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Layanan Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Solusi Pembuatan Website Terbaik
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base">
            Kami menyediakan paket spesifik yang dirancang sesuai skala kebutuhan bisnis Anda.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={Math.min(i * 90, 450)} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
        <Reveal y={16}>
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Harga belum termasuk pembelian domain, hosting, aset premium, atau biaya layanan pihak ketiga. Jika diperlukan, kami dapat membantu proses setup dan konfigurasi dasar.
          </p>
        </Reveal>
      </section>

      {/* 4. Demo Website Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16 gap-4">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Live Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Lihat Contoh Hasil Website
            </h2>
            <p className="text-slate-650 dark:text-slate-450 text-sm sm:text-base">
              Lihat contoh tampilan sebelum menentukan paket yang paling sesuai dengan kebutuhan bisnis Anda.
            </p>
          </div>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
          >
            <span>Semua Demo Website</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {demos.map((demo, i) => (
            <Reveal key={demo.id} delay={Math.min(i * 90, 450)} className="h-full">
              <DemoCard demo={demo} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. Order Process Section */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        {/* Glow decoration */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-450 text-blue-400">
            Alur Pemesanan
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            5 Langkah Pemesanan Website
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Pemesanan dapat dimulai langsung dari website, lengkap dengan ringkasan paket, pilihan pembayaran, invoice, dan tindak lanjut briefing project.
          </p>
        </Reveal>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
          {processSteps.map((step, i) => (
            <Reveal key={i} delay={Math.min(i * 90, 360)} className="relative space-y-4 group">
              {/* Step indicator */}
              <div className="text-5xl font-black text-slate-800 group-hover:text-blue-500/30 transition-colors duration-300">
                {step.step}
              </div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
              
              {/* Connecting line for desktop */}
              {i < processSteps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-1/2 w-full h-[1px] bg-slate-800 -z-10" />
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6. Pricing Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Investasi Bisnis
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Paket Harga Transparan & Jujur
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base">
            Biaya satu kali bayar (one-time fee) di awal dengan cakupan fitur yang jelas sesuai kebutuhan website bisnis Anda.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, i) => (
            <Reveal key={plan.id} delay={Math.min(i * 90, 450)} className="h-full">
              <PricingCard plan={plan} />
            </Reveal>
          ))}
        </div>

        <Reveal y={16}>
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Harga belum termasuk pembelian domain, hosting, aset premium, atau biaya layanan pihak ketiga. Jika diperlukan, kami dapat membantu proses setup dan konfigurasi dasar.
          </p>
        </Reveal>

        <Reveal y={16} className="text-center mt-10">
          <Link
            href="/harga"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Bandingkan Detail Paket & Fitur</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>

      {/* 7. Scope Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Scope Layanan
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Apa yang Termasuk & Belum Termasuk?
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Agar proses kerja lebih jelas sejak awal, berikut gambaran umum hal yang biasanya termasuk dalam layanan dan hal yang perlu disiapkan atau dibayar terpisah sesuai kebutuhan proyek.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal className="h-full" delay={0}>
            <div className="h-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Yang Termasuk</h3>
              </div>

              <ul className="space-y-3">
                {includedItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="h-full" delay={90}>
            <div className="h-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Info className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Belum Termasuk</h3>
              </div>

              <ul className="space-y-3">
                {excludedItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                    <Info className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal y={16}>
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Detail akhir tetap menyesuaikan jenis website, jumlah halaman, fitur yang dibutuhkan, dan kesepakatan sebelum pengerjaan dimulai.
          </p>
        </Reveal>
      </section>

      {/* 8. FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-650 dark:text-purple-400">
            Pertanyaan Umum
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Paling Sering Ditanyakan (FAQ)
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base">
            Jawaban cepat untuk membantu Anda memahami detail layanan dan teknis pembuatan website.
          </p>
        </Reveal>

        <FAQSection />
      </section>

      {/* 9. WhatsApp CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="bg-gradient-to-tr from-blue-650 to-indigo-900 dark:from-slate-900 dark:to-indigo-950/60 p-8 sm:p-14 rounded-3xl text-center text-white relative overflow-hidden shadow-xl shadow-indigo-950/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-650/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Punya Pertanyaan Khusus Mengenai Website Impian Anda?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Konsultasikan apa saja yang bisnis Anda perlukan. Kami siap membantu menjawab pertanyaan teknis maupun non-teknis terkait kebutuhan website Anda.
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
              Kami akan merespons secepat mungkin pada jam operasional.
            </p>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
