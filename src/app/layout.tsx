import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsAppButton } from "@/components/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Carroll Base | Jasa Pembuatan Website Profesional & Modern",
  description: "Digital Carroll Base membantu UMKM, personal brand, dan bisnis lokal membuat website modern, responsif, dan profesional untuk mendukung promosi online.",
  keywords: ["jasa pembuatan website", "website umkm", "landing page murah", "company profile perusahaan", "digital carroll base", "buat website jakarta"],
  authors: [{ name: "Digital Carroll Base" }],
  openGraph: {
    title: "Digital Carroll Base | Jasa Pembuatan Website Profesional",
    description: "Digital Carroll Base membantu UMKM, personal brand, dan bisnis lokal membuat website modern, responsif, dan profesional.",
    type: "website",
    locale: "id_ID",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 selection:bg-blue-500/20">
        <Navbar />
        <main className="flex-grow pt-24 md:pt-28">
          {children}
        </main>
        <Footer />
        <FloatingWhatsAppButton />
      </body>
    </html>
  );
}
