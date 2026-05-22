"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coffee, PhoneCall, Clock, MapPin, Star, MessageSquare } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

export default function DemoLandingPage() {
  const [activeTab, setActiveTab] = useState("all");

  const menuItems = [
    { name: "Carroll Signature Espresso", category: "hot", price: "Rp 22.000", desc: "Konsentrat kopi murni berkualitas tinggi diseduh dengan tekanan tinggi." },
    { name: "Creamy Latte Macchiato", category: "hot", price: "Rp 28.000", desc: "Perpaduan pas antara espresso mantap, susu steam lembut, dan foam tebal." },
    { name: "Carroll Iced Cold Brew", category: "cold", price: "Rp 26.055", desc: "Kopi seduh dingin selama 16 jam, menghasilkan rasa lembut dan rendah asam." },
    { name: "Caramel Frappuccino", category: "cold", price: "Rp 32.000", desc: "Espresso blender es dengan sirup karamel gurih, susu, dan topping whipped cream." },
    { name: "Smoked Beef Croissant", category: "food", price: "Rp 25.000", desc: "Pastri croissant renyah mentega dengan isian daging asap dan keju meleleh." },
    { name: "Signature Cheese Danish", category: "food", price: "Rp 24.000", desc: "Kue pastri manis dengan isian krim keju gurih yang melimpah di tengahnya." },
  ];

  const filteredMenu = activeTab === "all" ? menuItems : menuItems.filter(item => item.category === activeTab);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#3c2f2f] font-sans antialiased relative">
      
      {/* 1. Header Banner Alert */}
      <div className="sticky top-0 z-50 bg-amber-800 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Demo</span>
          <span>Ini adalah contoh web <strong>Landing Page Kedai Kopi</strong> hasil karya Digital Carroll Base.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="underline hover:text-amber-200 font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
          <a
            href={getWhatsAppLink("Halo Digital Carroll Base, saya melihat demo Landing Page Kedai Kopi Carroll Coffee dan ingin memesan website seperti itu.")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 font-bold px-3 py-1 rounded-full text-[11px] transition-colors"
          >
            Pesan Website Ini
          </a>
        </div>
      </div>

      {/* Cafe Navbar */}
      <nav className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between border-b border-amber-900/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-amber-900 rounded-full flex items-center justify-center text-amber-100">
            <Coffee className="w-5 h-5" />
          </div>
          <span className="font-serif font-black text-xl tracking-wide text-[#3c2f2f]">Carroll Coffee</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm font-semibold">
          <a href="#hero" className="hover:text-amber-700 transition-colors">Home</a>
          <a href="#menu" className="hover:text-amber-700 transition-colors">Menu</a>
          <a href="#about" className="hover:text-amber-700 transition-colors">Tentang Kami</a>
          <a href="#contact" className="hover:text-amber-700 transition-colors">Lokasi</a>
        </div>
        <div>
          <a 
            href={getWhatsAppLink("Halo Carroll Coffee, saya ingin membooking meja untuk sore ini.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-amber-900 hover:bg-amber-800 text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-md transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Pesan Meja</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-6xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Diseduh Dengan Cinta & Dedikasi
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#2a1e1e] leading-tight">
            Kopi Spesial untuk Semangat Harianmu
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Menghadirkan biji kopi arabika pilihan dari pegunungan Nusantara yang disangrai dengan presisi dan diseduh oleh barista bersertifikat. Rasakan sensasi rasa kopi autentik di Carroll Coffee.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="#menu" 
              className="bg-amber-900 hover:bg-amber-800 text-white font-bold px-7 py-3 rounded-full text-xs sm:text-sm shadow-lg shadow-amber-900/10 transition-colors"
            >
              Lihat Menu Kami
            </a>
            <a 
              href={getWhatsAppLink("Halo Carroll Coffee, saya ingin pesan delivery kopi susu signature.")}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-amber-900 text-amber-900 hover:bg-amber-50 font-bold px-7 py-3 rounded-full text-xs sm:text-sm transition-colors text-center"
            >
              Delivery via WhatsApp
            </a>
          </div>
        </div>

        {/* Hero Image Mockup Container */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-3xl bg-amber-900/5 overflow-hidden border border-amber-900/10 flex items-center justify-center p-8 relative">
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-2xl shadow-sm flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-[#3c2f2f]">4.9 (500+ Ulasan)</span>
            </div>
            {/* Visual simulation of coffee cup */}
            <div className="text-center space-y-4">
              <div className="text-8xl select-none">☕</div>
              <h3 className="font-serif font-black text-2xl text-amber-900">Carroll Signature Coffee</h3>
              <p className="text-xs text-amber-800/80 max-w-xs mx-auto">Disajikan segar setiap hari lengkap dengan donat mini hangat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="bg-amber-900/5 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
            <h2 className="font-serif text-3xl font-black text-[#2a1e1e]">Menu Favorit Kedai</h2>
            <p className="text-xs sm:text-sm text-slate-650">Banyak dipesan oleh pelanggan setia kami di pagi dan sore hari.</p>
            
            {/* Tab filter */}
            <div className="flex justify-center items-center gap-2 pt-4">
              {[
                { id: "all", label: "Semua" },
                { id: "hot", label: "Kopi Hangat" },
                { id: "cold", label: "Kopi Dingin" },
                { id: "food", label: "Camilan" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? "bg-amber-900 text-white shadow-sm"
                      : "bg-white border border-amber-900/10 text-amber-900 hover:bg-amber-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-amber-900/5 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-[#2a1e1e]">{item.name}</h3>
                    <span className="text-sm font-black text-amber-900 shrink-0 ml-2">{item.price}</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium capitalize">Kategori: {item.category}</span>
                  <a
                    href={getWhatsAppLink(`Halo Carroll Coffee, saya ingin memesan menu "${item.name}" untuk diantar/ambil.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-900 hover:text-amber-700 transition-colors flex items-center gap-1"
                  >
                    Pesan via WA &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Testimonial Section */}
      <section id="about" className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black text-[#2a1e1e]">Komitmen Kualitas Rasa</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Didirikan sejak 2021, Carroll Coffee berkomitmen menjadi tempat persinggahan yang nyaman bagi pecinta kopi sejati. Kami secara konsisten bekerja sama dengan petani lokal Indonesia untuk menyuplai biji kopi pilihan terbaik, melestarikan budidaya lokal sambil menjaga kualitas seduhan di gelas Anda.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-amber-900/5 text-center">
                <span className="block text-2xl font-black text-amber-900">10+</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Varian Biji Kopi</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-900/5 text-center">
                <span className="block text-2xl font-black text-amber-900">100%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Biji Kopi Asli</span>
              </div>
            </div>
          </div>
          
          {/* Testimonial card */}
          <div className="bg-amber-900 text-[#faf8f5] rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-9xl text-amber-950/20 font-serif select-none pointer-events-none">“</div>
            <div className="flex gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400" />)}
            </div>
            <p className="font-serif text-base italic leading-relaxed relative z-10">
              &quot;Kopi Susu Gula Aren di sini juara banget, manisnya pas dan kopinya masih kerasa strong. Tempatnya nyaman banget buat kerja atau nongkrong sore.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-amber-800 flex items-center justify-center text-sm font-bold text-amber-100">B</div>
              <div>
                <h4 className="font-bold text-sm">Budi Pratama</h4>
                <p className="text-xs text-amber-300">Pelanggan Setia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Lokasi Section */}
      <section id="contact" className="max-w-6xl mx-auto px-4 py-16 border-t border-amber-900/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black text-[#2a1e1e]">Kunjungi Kedai Kami</h2>
            <p className="text-slate-650 text-sm leading-relaxed">
              Kami berlokasi strategis di pusat kota dengan fasilitas Wi-Fi cepat, stop kontak melimpah, dan area outdoor yang asri. Cocok untuk work-from-cafe maupun sekadar bersantai.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Alamat Kedai</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Jl. Kopi Sudirman No. 12, Senayan, Jakarta Selatan</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Jam Operasional</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Senin - Minggu: 08.00 WIB - 22.00 WIB</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Kontak Telepon / WA</h4>
                  <p className="text-xs text-slate-500 mt-0.5">0851-7969-0688</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fake Map Layout */}
          <div className="bg-white rounded-3xl p-6 border border-amber-900/10 flex flex-col justify-between min-h-60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Google Maps Preview</span>
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Lokasi
              </span>
            </div>
            <div className="flex-1 bg-amber-50 rounded-2xl flex items-center justify-center text-center p-4 border border-dashed border-amber-950/20 text-slate-450 text-xs">
              <div className="space-y-2">
                <div className="text-4xl">📍</div>
                <p className="font-bold">Peta Interaktif Mockup</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Pada website asli, bagian ini akan diisi dengan Google Maps asli yang responsif dan dapat di-zoom.</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <a 
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Buka di Aplikasi Google Maps &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Fake Cafe Footer */}
      <footer className="bg-[#2a1e1e] text-[#bdae9e] py-8 text-center text-xs border-t border-amber-950/40">
        <p>&copy; {new Date().getFullYear()} Carroll Coffee. Powered by <strong>Digital Carroll Base</strong>.</p>
      </footer>
      
    </div>
  );
}
