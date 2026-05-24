"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "Apa saja data/materi yang perlu disiapkan sebelum mulai?",
      answer: "Anda hanya perlu menyiapkan data bisnis dasar seperti nama brand, deskripsi produk/jasa, logo (jika ada), foto pendukung, dan nomor WhatsApp yang aktif untuk menerima pesanan. Urusan copywriting, susunan tata letak, dan teknis coding semuanya kami bantu tangani."
    },
    {
      question: "Berapa lama proses pembuatan website hingga online?",
      answer: "Proses pengerjaan bergantung pada jenis paket yang dipilih. Landing Page Bisnis biasanya selesai dalam 3-5 hari kerja. Company Profile memakan waktu 7-10 hari kerja. Sementara Katalog Produk Online memerlukan waktu sekitar 10-14 hari kerja tergantung jumlah produk yang diinput."
    },
    {
      question: "Apakah website bisa dibantu sampai online?",
      answer: "Bisa. Kami dapat membantu proses deploy, pengaturan custom domain, dan konfigurasi dasar agar website siap diakses publik. Detail kebutuhan teknis akan disesuaikan dengan paket dan kondisi website Anda."
    },
    {
      question: "Apakah websitenya Mobile-Friendly dan cepat dibuka?",
      answer: "Ya. Website dibuat responsif agar nyaman diakses dari berbagai ukuran layar. Struktur halaman juga dibuat ringan untuk membantu performa loading tetap optimal."
    },
    {
      question: "Bagaimana jika ada kesalahan atau revisi setelah website online?",
      answer: "Setelah website online, kami membantu pengecekan awal jika ada kendala teknis dari proses pengerjaan. Panduan penggunaan dasar juga dapat diberikan agar Anda lebih mudah memahami website."
    },
    {
      question: "Bagaimana alur pembayaran dan pemesanan?",
      answer: "Alurnya sangat praktis: 1) Konsultasi konsep dan kebutuhan via WhatsApp, 2) Pembayaran uang muka (DP) sebesar 50% untuk mulai pengerjaan, 3) Proses pengerjaan & penyerahan link demo untuk direview, 4) Proses revisi jika dibutuhkan, 5) Pelunasan sisa 50%, dan 6) Website resmi diluncurkan secara live."
    }
  ];

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <Reveal key={index} delay={Math.min(index * 90, 450)} y={18}>
            <div
              className={`border rounded-2xl transition-all duration-300 ${
                isOpen
                  ? "bg-blue-50/40 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white transition-colors cursor-pointer select-none"
            >
              <span className="text-base sm:text-lg">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ${
                  isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 pt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-100/50 dark:border-slate-800/50 mt-1">
                {faq.answer}
              </div>
            </div>
          </div>
          </Reveal>
        );
      })}
    </div>
  );
};
