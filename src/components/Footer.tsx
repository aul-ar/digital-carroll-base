import React from "react";
import Link from "next/link";
import { Laptop, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const servicesLinks = [
    { name: "Landing Page Bisnis", href: "/layanan/landing-page" },
    { name: "Company Profile Website", href: "/layanan/company-profile" },
    { name: "Katalog Produk Online", href: "/layanan/katalog-produk" },
  ];

  const demoLinks = [
    { name: "Demo Landing Page", href: "/demo/landing-page" },
    { name: "Demo Company Profile", href: "/demo/company-profile" },
    { name: "Demo Katalog Produk", href: "/demo/katalog-produk" },
  ];

  const companyLinks = [
    { name: "Beranda", href: "/" },
    { name: "Layanan Kami", href: "/layanan" },
    { name: "Demo Hasil Website", href: "/demo" },
    { name: "Paket & Harga", href: "/harga" },
    { name: "Hubungi Kontak", href: "/kontak" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Laptop className="w-5.5 h-5.5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Digital Carroll Base
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Membantu UMKM, personal brand, dan bisnis lokal memiliki website modern, responsif, dan siap digunakan untuk promosi online.
            </p>
            <div className="space-y-3">
              <a 
                href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin tanya-tanya seputar pembuatan website.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>0851-7969-0688</span>
              </a>
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>digital@carrollbase.com</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Indonesia (Melayani pembuatan website secara online untuk seluruh wilayah Indonesia.)</span>
              </div>
            </div>
          </div>

          {/* Quick Links Col */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-base">Perusahaan</h3>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Col */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-base">Layanan Pembuatan</h3>
            <ul className="space-y-3 text-sm">
              {servicesLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-purple-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Demos Col */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-base">Demo Website</h3>
            <ul className="space-y-3 text-sm">
              {demoLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-emerald-500 transition-colors" />
                    {link.name}
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-slate-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-slate-950/60 py-6 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} <strong>Digital Carroll Base</strong>. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/layanan" className="hover:text-slate-400 transition-colors">Syarat & Ketentuan</Link>
            <Link href="/kontak" className="hover:text-slate-400 transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
