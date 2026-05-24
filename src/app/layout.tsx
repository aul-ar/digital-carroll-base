import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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

const GA_MEASUREMENT_ID = "G-R75ZQ31FHQ";

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
        {/* Google Analytics 4 global tracking */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
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
