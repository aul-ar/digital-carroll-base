"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Briefcase, Award, Users, ArrowUpRight, Send } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

export default function DemoCompanyProfile() {
  const [filter, setFilter] = useState("all");
  
  // Contact form state
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [service, setService] = useState("Konsultasi Manajemen");
  const [notes, setNotes] = useState("");

  const projects = [
    { title: "Sistem FinTech Carroll Pay", category: "it", client: "PT Carroll Finansial Utama", year: "2024" },
    { title: "Rebranding Carroll Creative", category: "branding", client: "Carroll Wear Studio", year: "2023" },
    { title: "Audit Keamanan Sistem B2B", category: "security", client: "Lembaga Carroll Security", year: "2024" },
    { title: "Aplikasi Inventory Real-time", category: "it", client: "Carroll Logistic Global", year: "2023" },
    { title: "Kampanye Merek Go-Digital", category: "branding", client: "UMKM Carroll Wear", year: "2024" },
  ];

  const filteredProjects = filter === "all" ? projects : projects.filter(p => p.category === filter);

  // Handle contact form submit (Redirect to WhatsApp)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !business) {
      alert("Harap isi nama Anda dan nama bisnis Anda.");
      return;
    }
    const message = `Halo Carroll Consulting, saya ${name} dari ${business}. Saya ingin menjadwalkan konsultasi untuk layanan "${service}".\nCatatan tambahan: ${notes || '-'}`;
    const url = getWhatsAppLink(message);
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative">
      
      {/* Header Alert Banner */}
      <div className="sticky top-0 z-50 bg-blue-900 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Demo</span>
          <span>Ini adalah contoh web <strong>Company Profile Perusahaan</strong> hasil karya Digital Carroll Base.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="underline hover:text-blue-200 font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
          <a
            href={getWhatsAppLink("Halo Digital Carroll Base, saya melihat demo Company Profile Perusahaan Carroll Consulting dan ingin memesan website seperti itu.")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 font-bold px-3 py-1 rounded-full text-[11px] transition-colors"
          >
            Pesan Website Ini
          </a>
        </div>
      </div>

      {/* Corporate Navbar */}
      <nav className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Carroll Consulting</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm font-semibold text-slate-650">
          <a href="#hero" className="hover:text-blue-700 transition-colors">Home</a>
          <a href="#stats" className="hover:text-blue-700 transition-colors">Tentang Kami</a>
          <a href="#portfolio" className="hover:text-blue-700 transition-colors">Portofolio</a>
          <a href="#contact" className="hover:text-blue-700 transition-colors">Kontak</a>
        </div>
        <div>
          <a 
            href="#contact"
            className="inline-flex items-center bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <span>Mulai Konsultasi</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full">
            Partner Pertumbuhan Bisnis Terpercaya
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Tingkatkan Skala & Efisiensi Operasional Bisnis Anda
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Carroll Consulting membantu perusahaan berkembang, institusi, dan agensi jasa merancang strategi ekspansi pasar, audit sistem manajemen, serta transformasi digital terukur. Didukung tim analis berpengalaman lebih dari 5 tahun.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="#contact" 
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-7 py-3.5 rounded-lg text-xs sm:text-sm shadow-md transition-colors"
            >
              Jadwalkan Sesi Analisis
            </a>
            <a 
              href="#portfolio" 
              className="border border-slate-300 hover:bg-slate-100 font-bold px-7 py-3.5 rounded-lg text-xs sm:text-sm transition-colors text-center"
            >
              Lihat Proyek Kami
            </a>
          </div>
        </div>

        {/* Hero Illustrative Block */}
        <div className="lg:col-span-5 relative">
          <div className="aspect-[4/3] rounded-3xl bg-blue-950 text-white p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">Statistik Utama</span>
              <h3 className="text-2xl font-bold">Terbukti Membantu Klien Berkembang</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-1">
                <span className="text-2xl font-extrabold text-blue-400">150+</span>
                <p className="text-[10px] text-slate-400 uppercase">Proyek Selesai</p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-extrabold text-purple-400">98%</span>
                <p className="text-[10px] text-slate-400 uppercase">Tingkat Kepuasan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-3xl font-extrabold text-white">5+ Tahun</h4>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Pengalaman Industri</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-3xl font-extrabold text-white">25+ Tim</h4>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Konsultan Berlisensi</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-3xl font-extrabold text-white">10+ Negara</h4>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Relasi Skala Global</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-3xl font-extrabold text-white">99% Aman</h4>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Kepatuhan Hukum</p>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Portofolio Kerja Klien</h2>
            <p className="text-xs sm:text-sm text-slate-500">Berikut beberapa hasil audit, manajemen, dan integrasi sistem kami.</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { id: "all", label: "Semua Kategori" },
              { id: "it", label: "Integrasi IT" },
              { id: "branding", label: "Branding Merek" },
              { id: "security", label: "Keamanan Data" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  filter === tab.id
                    ? "bg-blue-900 border-blue-900 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col justify-between min-h-48">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {proj.category === "it" ? "Integrasi IT" : proj.category === "branding" ? "Branding" : "Keamanan Data"}
                </span>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{proj.title}</h3>
                <p className="text-xs text-slate-500">Client: {proj.client}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Tahun Rilis: {proj.year}</span>
                <span className="text-blue-900 font-semibold flex items-center gap-1">
                  Studi Kasus <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Form Section */}
      <section id="contact" className="bg-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Jadwalkan Konsultasi Gratis</h2>
            <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
              Isi data di samping. Setelah Anda mengklik kirim formulir, data pendaftaran akan otomatis dikirimkan ke WhatsApp resmi kami untuk tindak lanjut cepat penjadwalan.
            </p>
            <div className="text-xs text-slate-550 pt-2 space-y-1">
              <p>&bull; Sesi Zoom/GMeet gratis 15 menit</p>
              <p>&bull; Analisis awal model operasional</p>
              <p>&bull; Solusi proposal dalam 24 jam</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4 shadow-sm">
            <div className="space-y-1">
              <label htmlFor="name-input" className="text-xs font-bold text-slate-550 uppercase">Nama Lengkap Anda</label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth. Alexander Carroll"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 bg-slate-50"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="business-input" className="text-xs font-bold text-slate-550 uppercase">Nama Perusahaan / Bisnis</label>
              <input
                id="business-input"
                type="text"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="cth. Carroll Wear Indonesia"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="service-select" className="text-xs font-bold text-slate-550 uppercase">Layanan Utama</label>
              <select
                id="service-select"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 bg-slate-50 cursor-pointer"
              >
                <option value="Konsultasi Manajemen">Konsultasi Manajemen & Strategi</option>
                <option value="Audit Keamanan IT">Audit Keamanan & Infrastruktur IT</option>
                <option value="Branding Merek">Branding & Desain Identitas Merek</option>
                <option value="Lainnya">Lainnya / Kustomisasi Penawaran</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="notes-textarea" className="text-xs font-bold text-slate-550 uppercase">Catatan Tambahan (Opsional)</label>
              <textarea
                id="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan keluhan atau tujuan singkat Anda di sini..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 bg-slate-50 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm py-3 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Formulir ke WhatsApp</span>
            </button>
          </form>
        </div>
      </section>

      {/* Corporate Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-xs border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} Carroll Consulting. Powered by <strong>Digital Carroll Base</strong>.</p>
      </footer>
      
    </div>
  );
}
