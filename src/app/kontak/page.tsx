"use client";

import React, { useState } from "react";
import { Phone, Mail, Clock, MapPin, Send, HelpCircle } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

const WEB3FORMS_ACCESS_KEY = "ba85473f-326e-4010-a39c-3c98ac1deb37";
const CONTACT_EMAIL = "hi@auliaabdulrahman.site";

export default function KontakPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("idle");

    if (!email || !message) {
      setFormStatus("error");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          email,
          message,
          subject: "New Portfolio Contact Message",
          from_name: "Aulia Portfolio Website",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to submit contact form");
      }

      setEmail("");
      setMessage("");
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const contactInfos = [
    {
      icon: Phone,
      title: "WhatsApp Chat",
      value: "0851-7969-0688",
      description: "Kami akan merespons secepat mungkin pada jam operasional.",
      link: getWhatsAppLink("Halo Digital Carroll Base, saya ingin tanya-tanya seputar pembuatan website.")
    },
    {
      icon: Mail,
      title: "Email Resmi",
      value: CONTACT_EMAIL,
      description: "Untuk proposal kerjasama B2B & penawaran formal.",
      link: `mailto:${CONTACT_EMAIL}`
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      value: "08:00 - 21:00 WIB",
      description: "Senin sampai Minggu, sesuai ketersediaan jam operasional.",
      link: null
    },
    {
      icon: MapPin,
      title: "Lokasi",
      value: "Indonesia",
      description: "Melayani pembuatan website secara online untuk seluruh wilayah Indonesia.",
      link: null
    }
  ];

  return (
    <div className="pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-10">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Hubungi Kami
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Mulai Diskusi Website Impian Anda
        </h1>
        <p className="text-slate-650 dark:text-slate-350 text-base sm:text-lg">
          Ada pertanyaan seputar paket, kebutuhan custom, atau ingin melihat demo lebih detail? Kirim pesan Anda di bawah ini.
        </p>
      </section>

      {/* Grid Contact info and Form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Informasi Kontak</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Kami siap membantu menjawab pertanyaan teknis maupun non-teknis terkait kebutuhan website Anda. Klik nomor WhatsApp atau Email di bawah ini untuk terhubung langsung.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {contactInfos.map((info, idx) => {
              const Icon = info.icon;
              const content = (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl flex gap-4 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-blue-550/10 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{info.title}</h4>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{info.value}</p>
                    <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed">{info.description}</p>
                  </div>
                </div>
              );

              return info.link ? (
                <a 
                  key={idx} 
                  href={info.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  {content}
                </a>
              ) : (
                <div key={idx}>{content}</div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Formulir Pertanyaan</h2>
              <p className="text-slate-550 dark:text-slate-450 text-xs sm:text-sm mt-1">
                Data formulir di bawah ini dikirimkan langsung ke email kontak kami.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email-addr" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  id="email-addr"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cth. alex@carroll.com"
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="question-text" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                <textarea
                  id="question-text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Jelaskan jenis bisnis Anda dan fitur apa saja yang Anda harapkan ada di website..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-slate-50 dark:bg-slate-950 resize-none"
                />
              </div>

              {formStatus === "success" && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Pesan berhasil dikirim. Terima kasih, kami akan menghubungi Anda kembali.
                </p>
              )}
              {formStatus === "error" && (
                <p className="text-sm font-medium text-red-500 dark:text-red-400">
                  Pesan belum berhasil dikirim. Pastikan email dan pesan sudah terisi, lalu coba lagi.
                </p>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? "Mengirim..." : "Kirim Pesan"}</span>
              </button>
            </form>
          </div>
        </div>

      </section>

      {/* Mini FAQ reminder */}
      <section className="bg-slate-100/50 dark:bg-slate-900/10 p-8 sm:p-12 rounded-3xl max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6 border border-slate-200/50 dark:border-slate-800/50">
        <HelpCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 shrink-0" />
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Butuh diskusi langsung terkait kebutuhan website?</h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Kami siap membantu menjawab pertanyaan teknis maupun non-teknis terkait kebutuhan website Anda.</p>
        </div>
      </section>
      
    </div>
  );
}
