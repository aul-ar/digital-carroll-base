import Link from "next/link";
import { ArrowLeft, RefreshCcw, Layout, Check, Smartphone } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

export const metadata = {
  title: "Demo Redesign Website | Digital Carroll Base",
  description: "Demo redesign Klinik SehatCare dengan before/after, masalah lama, dan solusi desain baru.",
};

export default function DemoRedesignWebsite() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <div className="sticky top-0 z-50 bg-violet-950 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Demo</span>
          <span>Contoh redesign <strong>Klinik SehatCare</strong> untuk tampilan website yang lebih modern.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="underline hover:text-violet-200 font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
          <a
            href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin memesan redesign website Klinik SehatCare.")}
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
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Klinik SehatCare</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">Redesign website klinik dengan tampilan lebih bersih, modern, dan mudah dikunjungi pasien.</h1>
            <p className="max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">Demo ini menampilkan perbandingan antara website lama Klinik SehatCare dan hasil redesign yang lebih fokus pada pengalaman pasien, informasi layanan, serta CTA pendaftaran yang jelas.</p>
            <div className="flex flex-wrap gap-4">
              <a
                href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin memesan redesign website klinik.")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-violet-950 hover:bg-violet-900 text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                Konsultasi WhatsApp
              </a>
              <a href="#compare" className="border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-full transition-colors">Lihat Perbandingan</a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="rounded-[1.5rem] bg-violet-950 p-8 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Redesign Case</p>
              <h2 className="mt-4 text-3xl font-bold">Jadikan website klinik lebih ramah pasien</h2>
              <p className="mt-4 text-sm leading-relaxed text-violet-200">Struktur ulang halaman layanan, perkuat CTA konsultasi, dan tampilkan informasi klinik dengan desain yang mudah dipahami.</p>
            </div>
          </div>
        </section>

        <section id="compare" className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">Sebelum</span>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Website Lama Klinik SehatCare</h2>
            <div className="mt-6 space-y-4 text-slate-600 text-sm">
              <p className="rounded-3xl bg-slate-50 p-4">Header penuh teks, informasi layanan tersebar, dan tombol booking tidak menonjol.</p>
              <p className="rounded-3xl bg-slate-50 p-4">Halaman layanan tampak padat, pasien kesulitan menemukan jadwal praktik.</p>
              <p className="rounded-3xl bg-slate-50 p-4">Desain desktop dan mobile tidak konsisten, mengurangi kepercayaan pengunjung.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-700">Sesudah</span>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Redesign Modern dan Fokus</h2>
            <div className="mt-6 space-y-4 text-slate-600 text-sm">
              <p className="rounded-3xl bg-violet-50 p-4">Header bersih dengan CTA daftar konsultasi dan nomor WhatsApp klinik jelas terlihat.</p>
              <p className="rounded-3xl bg-violet-50 p-4">Layanan utama disusun dalam kartu ringkas, memudahkan pasien memilih treatment.</p>
              <p className="rounded-3xl bg-violet-50 p-4">Preview mobile responsif menunjukkan akses cepat ke jadwal dan kontak.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Preview Responsif</p>
                <h3 className="text-2xl font-bold text-slate-900">Tampilan Mobile yang Lebih Baik</h3>
              </div>
            </div>
            <div className="mt-8 grid gap-4">
              {[
                { label: "Menu Ringkas", text: "Navigasi layanan, dokter, dan kontak langsung tanpa gulir panjang." },
                { label: "CTA Konsultasi", text: "Tombol WhatsApp selalu terlihat di perangkat kecil." },
                { label: "Informasi Praktik", text: "Jam buka, lokasi, dan layanan unggulan disajikan singkat." }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-violet-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-600">{item.label}</p>
                  <p className="mt-3 text-sm text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-violet-950 p-8 text-white shadow-sm">
            <h3 className="text-2xl font-bold">Hasil Redesign</h3>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-violet-200">
              <p>Website baru tampil lebih profesional dan membantu pasien memahami layanan klinik dalam hitungan detik.</p>
              <p>CTA pendaftaran dan konsultasi diperkuat dengan tombol WhatsApp yang mudah diakses.</p>
              <p>Konten klinik terstruktur dalam komponen card sehingga informasi lebih cepat ditemukan.</p>
            </div>
            <a
              href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin memulai redesign website Klinik SehatCare.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-4 text-sm font-bold text-slate-950 hover:bg-emerald-400"
            >
              Hubungi untuk Redesign
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Apa yang Kami Perbaiki</p>
              <h3 className="text-2xl font-bold text-slate-900">Perbaikan Desain yang Dirasakan</h3>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Hierarki Konten", text: "Teks utama, layanan, dan CTA diletakkan dalam urutan yang logis." },
              { title: "Akses Mobile", text: "Tampilan mobile disederhanakan, sehingga pasien cepat menemukan kontak." },
              { title: "Brand Konsisten", text: "Warna dan tipografi suara klinik lebih profesional." },
              { title: "Formulir Cepat", text: "Pendaftaran dan booking dialihkan ke WhatsApp dengan pesan otomatis." }
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-slate-50 p-6">
                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
