import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, Presentation } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

export const metadata = {
  title: "Demo Website Sesuai Kebutuhan | Digital Carroll Base",
  description: "Demo custom event website EventPro Summit 2026 dengan hero, speaker, agenda, dan pendaftaran WhatsApp.",
};

export default function DemoWebsiteSesuaiKebutuhan() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <div className="sticky top-0 z-50 bg-orange-950 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Demo</span>
          <span>Contoh demo <strong>Website Sesuai Kebutuhan</strong> untuk EventPro Summit 2026.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="underline hover:text-orange-200 font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
          <a
            href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin memesan website event custom seperti EventPro Summit 2026.")}
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
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">EventPro Summit 2026</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">Website event serbaguna untuk pendaftaran, agenda, dan speaker premium.</h1>
            <p className="max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">Landing page custom yang memperkenalkan acara, menampilkan jadwal, dan memudahkan peserta mendaftar melalui WhatsApp dengan tampilan profesional.</p>
            <div className="flex flex-wrap gap-4">
              <a
                href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin membuat website event custom untuk EventPro Summit 2026.")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-950 hover:bg-orange-900 text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                Daftar via WhatsApp
              </a>
              <a href="#agenda" className="border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-full transition-colors">Lihat Agenda</a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="rounded-[1.5rem] bg-orange-950 p-8 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-200">Event Custom</p>
              <h2 className="mt-4 text-3xl font-bold">Situs Pendaftaran Acara</h2>
              <p className="mt-4 text-sm leading-relaxed text-orange-200">Menampilkan nilai acara, pembicara unggulan, dan langkah pendaftaran yang jelas dalam satu halaman.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { label: "Tanggal", value: "12 Juni 2026" },
              { label: "Lokasi", value: "Jakarta Convention Center" },
              { label: "Peserta", value: "200+ profesional" }
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pembicara Unggulan</p>
            <h2 className="text-3xl font-bold text-slate-900">Speaker yang Membawa Wawasan Nyata</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Rina Putri",
                role: "Founder Startup Kreatif",
                highlight: "Strategi brand dan pertumbuhan digital untuk event bisnis."
              },
              {
                name: "Dimas Hartono",
                role: "Head of Marketing",
                highlight: "Membahas taktik promosi acara dan engagement peserta."
              },
              {
                name: "Nadia Saputra",
                role: "Event Planner Senior",
                highlight: "Panduan eksperiensial untuk menyusun agenda yang efektif."
              }
            ].map((speaker) => (
              <article key={speaker.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="h-14 w-14 rounded-3xl bg-orange-100 text-orange-700 flex items-center justify-center text-2xl font-bold">{speaker.name.split(" ").map((n) => n[0]).join("")}</div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Speaker</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{speaker.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{speaker.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{speaker.highlight}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="agenda" className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Agenda Utama</p>
                <h3 className="text-2xl font-bold text-slate-900">Jadwal Event</h3>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { time: "09:00", title: "Registrasi & Welcome Coffee" },
                { time: "10:00", title: "Keynote: Strategi Event 2026" },
                { time: "11:30", title: "Panel: Marketing & Engagement" },
                { time: "14:00", title: "Workshop: Ide Kampanye" },
                { time: "16:00", title: "Networking & Penutup" }
              ].map((item) => (
                <div key={item.time} className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.time}</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Benefit</p>
                <h3 className="text-2xl font-bold text-slate-900">Kenapa Bergabung</h3>
              </div>
            </div>
            <ul className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <li className="rounded-3xl bg-slate-50 p-4">Dapatkan wawasan strategi event dari pembicara dengan pengalaman praktis.</li>
              <li className="rounded-3xl bg-slate-50 p-4">Bangun jaringan bisnis dan kolaborasi dalam sesi networking.</li>
              <li className="rounded-3xl bg-slate-50 p-4">Akses materi workshop yang bisa langsung diterapkan.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Form Pendaftaran</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Daftar untuk EventPro Summit 2026</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">Form pendaftaran mockup dengan field nama, email, dan tipe tiket. Peserta dapat mengirim detail via WhatsApp untuk konfirmasi lebih cepat.</p>

              <div className="mt-8 space-y-4">
                {[
                  { label: "Nama Lengkap", value: "Alya Putri" },
                  { label: "Email", value: "alya.putri@email.com" },
                  { label: "Tipe Tiket", value: "Early Bird" }
                ].map((field) => (
                  <div key={field.label} className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{field.label}</p>
                    <p className="mt-2 text-sm text-slate-700">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-orange-950 p-8 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-200">Pendaftaran WhatsApp</p>
              <h3 className="mt-4 text-2xl font-bold">Konfirmasi Langsung</h3>
              <p className="mt-4 text-sm leading-relaxed text-orange-200">Peserta dapat mengirim data pendaftaran dan pilihan tiket langsung ke tim event melalui WhatsApp tanpa proses checkout tambahan.</p>
              <a
                href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin mendaftar EventPro Summit 2026.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-4 text-sm font-bold text-slate-950 hover:bg-emerald-400"
              >
                Daftar via WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Design Event", text: "Halaman hero dan info event yang menarik perhatian." },
            { title: "Speaker Showcase", text: "Profil speaker dan highlight sesi yang akan datang." },
            { title: "Agenda Terstruktur", text: "Jadwal event mudah dibaca dan mudah diikuti." },
            { title: "Pendaftaran Cepat", text: "Form dan CTA WhatsApp untuk konversi lebih cepat." }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
