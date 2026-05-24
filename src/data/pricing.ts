export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  popular: boolean;
  deliveryTime: string;
  targetServiceSlug: string;
  features: {
    text: string;
    included: boolean;
  }[];
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "plan-landing-page",
    name: "Landing Page Bisnis",
    price: "Mulai Rp 799.000",
    description: "Sempurna untuk promosi produk tunggal, event, jualan jasa, atau link tujuan iklan berbayar.",
    popular: false,
    deliveryTime: "3-5 Hari Kerja",
    targetServiceSlug: "landing-page",
    features: [
      { text: "Desain 1 Halaman Premium", included: true },
      { text: "Responsif di Mobile & Tablet", included: true },
      { text: "Copywriting Struktur Konversi", included: true },
      { text: "Integrasi Tombol Langsung via WhatsApp", included: true },
      { text: "Integrasi Pixel/Google Analytics", included: true },
      { text: "Bantuan Custom Domain", included: true },
      { text: "Bantuan Deploy Website", included: true },
      { text: "Multi-Halaman Menu", included: false },
      { text: "Katalog & Pencarian Produk", included: false },
      { text: "Sistem Keranjang WhatsApp", included: false },
      { text: "Revisi Desain", included: true }, // 3x revisi
    ]
  },
  {
    id: "plan-company-profile",
    name: "Company Profile",
    price: "Mulai Rp 1.499.000",
    description: "Cocok untuk UMKM, instansi, yayasan, atau profesional yang ingin meningkatkan kredibilitas merek.",
    popular: true,
    deliveryTime: "7-10 Hari Kerja",
    targetServiceSlug: "company-profile",
    features: [
      { text: "Desain Multi-Halaman (Hingga 5 Halaman)", included: true },
      { text: "Responsif di Mobile & Tablet", included: true },
      { text: "Halaman Tentang Kami, Layanan & Portofolio", included: true },
      { text: "Integrasi Tombol Langsung via WhatsApp", included: true },
      { text: "Integrasi Google Maps & Form Kontak", included: true },
      { text: "Bantuan Custom Domain", included: true },
      { text: "Bantuan Deploy Website", included: true },
      { text: "Katalog & Pencarian Produk", included: false },
      { text: "Sistem Keranjang WhatsApp", included: false },
      { text: "SEO Dasar", included: true },
      { text: "Revisi Desain", included: true }, // Sesuai ketentuan paket
    ]
  },
  {
    id: "plan-katalog-produk",
    name: "Katalog Produk Online",
    price: "Mulai Rp 1.499.000",
    description: "Pilihan praktis untuk toko online/distributor yang ingin memajang produk secara rapi tanpa ribet e-commerce.",
    popular: false,
    deliveryTime: "10-14 Hari Kerja",
    targetServiceSlug: "katalog-produk",
    features: [
      { text: "Showcase produk sesuai cakupan paket", included: true },
      { text: "Responsif di Mobile & Tablet", included: true },
      { text: "Fitur Pencarian & Filter Kategori", included: true },
      { text: "Tombol Order WhatsApp per Produk", included: true },
      { text: "Sistem Keranjang Pemesanan WhatsApp", included: true },
      { text: "Bantuan Custom Domain", included: true },
      { text: "Bantuan Deploy Website", included: true },
      { text: "Manajemen Produk Gampang", included: true },
      { text: "Struktur Website Rapi", included: true },
      { text: "SEO Dasar", included: true },
      { text: "Revisi Desain", included: true },
    ]
  },
  {
    id: "plan-website-portfolio",
    name: "Website Portfolio",
    price: "Mulai Rp 699.000",
    description: "Solusi website personal untuk menampilkan profil profesional, portofolio proyek, dan kontak WhatsApp langsung.",
    popular: false,
    deliveryTime: "3-5 Hari Kerja",
    targetServiceSlug: "website-portfolio",
    features: [
      { text: "Profil personal profesional", included: true },
      { text: "Section skill dan pengalaman", included: true },
      { text: "Galeri portofolio dan karya", included: true },
      { text: "Tombol Kontak WhatsApp", included: true },
      { text: "Responsif di semua perangkat", included: true },
      { text: "Form kontak langsung", included: true },
      { text: "Bantuan Custom Domain", included: true },
      { text: "Bantuan Deploy Website", included: true },
      { text: "Desain personal branding yang rapi", included: true },
      { text: "Revisi Desain", included: true }
    ]
  },
  {
    id: "plan-online-store-sederhana",
    name: "Online Store Sederhana",
    price: "Mulai Rp 1.999.000",
    description: "Website toko online sederhana dengan katalog, detail produk, keranjang ringan, dan checkout WhatsApp.",
    popular: true,
    deliveryTime: "7-14 Hari Kerja",
    targetServiceSlug: "online-store-sederhana",
    features: [
      { text: "Katalog produk responsif", included: true },
      { text: "Halaman detail produk lengkap", included: true },
      { text: "Keranjang sederhana", included: true },
      { text: "Checkout via WhatsApp", included: true },
      { text: "Filter produk dan kategori", included: true },
      { text: "Bantuan Custom Domain", included: true },
      { text: "Bantuan Deploy Website", included: true },
      { text: "Manajemen produk mudah", included: true },
      { text: "Sistem order WA otomatis", included: true },
      { text: "Revisi Desain", included: true }
    ]
  },
  {
    id: "plan-redesign-website",
    name: "Redesign Website",
    price: "Mulai Rp 799.000",
    description: "Pembaruan tampilan website lama menjadi lebih modern, responsif, dan mudah digunakan.",
    popular: false,
    deliveryTime: "3-7 Hari Kerja",
    targetServiceSlug: "redesign-website",
    features: [
      { text: "Redesign tampilan visual", included: true },
      { text: "Optimasi layout mobile", included: true },
      { text: "CTA lebih jelas dan menonjol", included: true },
      { text: "Struktur halaman profesional", included: true },
      { text: "Update palet warna & tipografi", included: true },
      { text: "Review aksesibilitas dasar", included: true },
      { text: "Bantuan Custom Domain", included: false },
      { text: "Bantuan Deploy Website", included: false },
      { text: "Revisi Desain", included: true }
    ]
  },
  {
    id: "plan-website-sesuai-kebutuhan",
    name: "Website Sesuai Kebutuhan",
    price: "Konsultasi Kebutuhan",
    description: "Website custom untuk event, pendaftaran, komunitas atau kampanye promosi khusus.",
    popular: false,
    deliveryTime: "Menyesuaikan kebutuhan",
    targetServiceSlug: "website-sesuai-kebutuhan",
    features: [
      { text: "Desain custom sesuai brand", included: true },
      { text: "Struktur halaman fleksibel", included: true },
      { text: "CTA dan alur disesuaikan", included: true },
      { text: "Form pendaftaran atau event", included: true },
      { text: "Konsultasi konsep sebelum pengerjaan", included: true },
      { text: "Responsif di semua perangkat", included: true },
      { text: "Dukungan order via WhatsApp", included: true },
      { text: "Bantuan Deploy Website", included: false },
      { text: "Revisi desain sesuai ketentuan paket", included: true }
    ]
  }
];
