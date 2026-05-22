import Link from "next/link";
import { ArrowLeft, UserCircle, AtSign } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

export const metadata = {
  title: "Demo Website Portfolio | Digital Carroll Base",
  description: "Demo website portfolio personal untuk Alya Putri, menampilkan profil profesional, skill, karya, dan kontak WhatsApp.",
};

export default function DemoWebsitePortfolio() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <div className="sticky top-0 z-50 bg-blue-950 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Demo</span>
          <span>Contoh website <strong>Portfolio Personal</strong> untuk UI Designer dan Content Creator.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="underline hover:text-blue-200 font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
          <a
            href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin membuat website portfolio seperti Alya Putri.")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 font-bold px-3 py-1 rounded-full text-[11px] transition-colors"
          >
            Pesan Website Ini
          </a>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-16 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Alya Putri • UI Designer</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">Mendesain pengalaman digital yang elegan dan berfokus pada cerita brand.</h1>
            <p className="max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">Website portfolio modern untuk menunjukkan identitas, proyek unggulan, serta kemampuan UI dan konten kreatif dalam format yang mudah dibaca dan profesional.</p>
            <div className="flex flex-wrap gap-4">
              <a
                href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin memesan website portfolio untuk personal branding.")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                Hubungi via WhatsApp
              </a>
              <a href="#projects" className="border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-full transition-colors">Lihat Proyek</a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-100 p-6">
                <div className="h-72 rounded-[1.5rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_40%)]">
                  <div className="flex h-full flex-col justify-end p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-3xl bg-slate-200 flex items-center justify-center text-slate-500 text-3xl"><UserCircle className="w-12 h-12" /></div>
                      <div>
                        <p className="text-xs uppercase text-slate-500 tracking-[0.2em]">Alya Putri</p>
                        <h2 className="text-2xl font-bold text-slate-900">UI Designer & Content Creator</h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between text-slate-600 text-sm">
                  <span className="font-semibold">Brand Identity</span>
                  <span className="text-slate-400">Alya Studio</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "UI Design",
                    "Brand Strategy",
                    "Social Content",
                    "Presentasi klien"
                  ].map((skill) => (
                    <span key={skill} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{skill}</span>
                  ))}
                </div>
                <div className="rounded-3xl bg-slate-950 px-4 py-4 text-white shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kontak Cepat</p>
                  <p className="mt-2 text-sm">Design inquiry & collaboration via WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Tentang Saya</h2>
            <p className="text-slate-600 leading-relaxed">Saya membantu brand lifestyle dan startup memperkuat citra digital mereka melalui desain antarmuka yang bersih, rentetan konten yang mudah dipahami, dan pengalaman pengguna yang fokus pada tujuan bisnis.</p>
            <div className="mt-6 grid gap-3 text-sm text-slate-700">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold">Fokus desain</p>
                <p className="text-slate-500">UI untuk website portfolio, landing page produk, dan halaman konten visual.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold">Target klien</p>
                <p className="text-slate-500">Personal brand, creative startup, dan bisnis micro.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Keahlian Utama</h2>
            <div className="grid gap-4">
              {[
                { title: "Design System", text: "UI konsisten dan komponen yang mudah digunakan untuk website personal." },
                { title: "Storytelling", text: "Narasi kerja yang jelas, fokus pada hasil dan pengalaman pengguna." },
                { title: "Content Support", text: "Mockup konten yang mendukung presentasi brand dan portofolio." }
              ].map((item) => (
                <div key={item.title} className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contoh Karya</p>
              <h2 className="text-3xl font-bold text-slate-900">Proyek Pilihan</h2>
            </div>
            <a
              href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin membuat website portfolio dengan proyek showcase.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-blue-950 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900"
            >
              Konsultasi Portofolio
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Brand Refresh untuk artis visual",
                category: "Portfolio Kreatif",
                description: "Desain landing page sederhana untuk memamerkan karya ilustrasi dan studi proyek dengan CTA booking."
              },
              {
                title: "Personal branding UX",
                category: "Designer Profile",
                description: "Halaman portofolio dengan section studi kasus, testimoni, dan layanan yang ditawarkan."
              },
              {
                title: "Konten media sosial",
                category: "Digital Showcase",
                description: "Halaman khusus untuk menampilkan sampel konten, publikasi, dan konsep posting."
              }
            ].map((project) => (
              <article key={project.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{project.category}</span>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{project.title}</h3>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{project.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">Lihat detail</div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Pengalaman Kerja</h2>
            <div className="space-y-6">
              {[
                {
                  title: "UI Designer Freelance",
                  period: "2024 - Sekarang",
                  detail: "Menyediakan desain website portfolio, halaman produk, dan materi digital untuk kreator dan brand micro."
                },
                {
                  title: "Content Creator Projects",
                  period: "2023 - 2024",
                  detail: "Menangani konsep visual storytelling dan aset konten untuk kampanye digital."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{item.period}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-blue-950 p-8 text-white shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-2xl bg-white/10 p-3">
                <AtSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Kontak Cepat</p>
                <h3 className="text-2xl font-bold">Sampaikan brief Anda</h3>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed">Tampilkan kebutuhan portfolio Anda, kategori layanan, dan target audiens untuk proposal desain yang lebih cepat.</p>
            <a
              href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin membuat website portfolio seperti Alya Putri.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-4 text-sm font-bold text-slate-950 hover:bg-emerald-400"
            >
              Konsultasi WhatsApp
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
