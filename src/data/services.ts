export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  benefits: string[];
  priceStartingFrom: string;
  deliveryTime: string;
  iconName: string; // Used to determine which Lucide icon to render
}

export const services: Service[] = [
  {
    id: "landing-page",
    title: "Landing Page Bisnis",
    slug: "landing-page",
    shortDescription: "Halaman penawaran satu halaman (one-page) yang dioptimalkan khusus untuk meningkatkan penjualan dan konversi iklan Anda.",
    fullDescription: "Landing Page Bisnis adalah solusi untuk Anda yang ingin mempromosikan produk spesifik, jasa, acara, atau menjalankan kampanye iklan berbayar (Google Ads, Facebook Ads, TikTok Ads). Didesain dengan struktur copywriting yang persuasif, struktur website ringan, dan call-to-action (CTA) yang jelas untuk checkout website maupun konsultasi.",
    features: [
      "Desain Responsif & Mobile-Friendly",
      "Struktur Copywriting Persuasif",
      "Hingga 5-7 Bagian Halaman",
      "Form Kontak dan Checkout Website",
      "Integrasi Tracking (Pixel, Analytics)",
      "Bantuan Deploy & Custom Domain",
      "Kecepatan Loading Maksimal (Speed Optimized)"
    ],
    benefits: [
      "Membantu meningkatkan efektivitas halaman tujuan iklan.",
      "Memudahkan calon pelanggan memahami produk/jasa dalam sekali baca.",
      "Tampilan profesional membantu membangun rasa percaya.",
      "Proses pembuatan cepat (3-5 hari kerja)."
    ],
    priceStartingFrom: "Mulai Rp 799.000",
    deliveryTime: "3-5 Hari Kerja",
    iconName: "FileText"
  },
  {
    id: "company-profile",
    title: "Company Profile Website",
    slug: "company-profile",
    shortDescription: "Website multi-halaman profesional untuk memperkenalkan visi, misi, layanan, dan portofolio perusahaan atau personal brand Anda.",
    fullDescription: "Company Profile Website dirancang untuk perusahaan, UMKM berkembang, dan personal brand yang membutuhkan representasi online yang kredibel dan tepercaya. Memiliki halaman beranda, profil tentang kami, daftar layanan, galeri portofolio, hingga blog/berita, serta halaman kontak yang lengkap.",
    features: [
      "Desain Premium & Elegant sesuai Branding",
      "Multi-halaman (Home, About, Services, Portfolio, Contact)",
      "Galeri Portofolio & Proyek",
      "Integrasi Google Maps & FAQ",
      "SEO Friendly (Mudah ditemukan di Google)",
      "Struktur Halaman Rapi & Mudah Dipahami",
      "Bantuan Deploy & Custom Domain"
    ],
    benefits: [
      "Memperkuat kredibilitas bisnis di mata klien nasional maupun internasional.",
      "Menjadi brosur digital 24/7 yang dapat diakses kapan saja.",
      "Membantu memenangkan tender dan negosiasi bisnis.",
      "Dapat dikembangkan di kemudian hari (skalabel)."
    ],
    priceStartingFrom: "Mulai Rp 1.499.000",
    deliveryTime: "7-10 Hari Kerja",
    iconName: "Building2"
  },
  {
    id: "katalog-produk",
    title: "Katalog Produk Online",
    slug: "katalog-produk",
    shortDescription: "Website katalog produk interaktif dengan kategori, detail produk, dan alur pemesanan yang jelas untuk calon pembeli.",
    fullDescription: "Katalog Produk Online adalah pilihan praktis bagi bisnis ritel atau UMKM yang ingin menampilkan banyak produk dengan rapi. Pelanggan dapat menjelajahi produk Anda secara interaktif, memfilter berdasarkan kategori, melihat detail produk, dan melanjutkan pemesanan melalui alur checkout atau konfirmasi yang tersedia.",
    features: [
      "Showcase Produk Interaktif & Galeri Foto",
      "Filter Kategori & Pencarian Produk",
      "Halaman Detail Produk Lengkap",
      "Tombol Pesan dengan Detail Produk Otomatis",
      "Manajemen Produk yang Mudah & Ringan",
      "Responsif di Semua Layar Gadget",
      "Bantuan Deploy & Custom Domain"
    ],
    benefits: [
      "Memudahkan pelanggan melihat stok & varian produk Anda secara mandiri.",
      "Menghemat waktu melayani pertanyaan 'ada produk apa saja?' di chat.",
      "Mengurangi biaya pembuatan aplikasi e-commerce yang mahal.",
      "Meningkatkan profesionalisme toko online Anda."
    ],
    priceStartingFrom: "Mulai Rp 1.499.000",
    deliveryTime: "10-14 Hari Kerja",
    iconName: "ShoppingBag"
  },
  {
    id: "website-portfolio",
    title: "Website Portfolio",
    slug: "website-portfolio",
    shortDescription: "Website personal untuk menampilkan profil, pengalaman, skill, project, dan kontak profesional.",
    fullDescription: "Website Portfolio membantu Anda membangun reputasi profesional online dengan halaman yang menonjolkan personal brand, keahlian, portofolio proyek, dan cara cepat untuk dihubungi.",
    features: [
      "Profil personal profesional",
      "Section skill dan pengalaman",
      "Galeri project atau karya",
      "Tombol kontak langsung",
      "Testimonial klien atau rekomendasi",
      "Responsif di semua perangkat"
    ],
    benefits: [
      "Menonjolkan kredibilitas personal brand.",
      "Mempermudah klien atau perekrut melihat kemampuan Anda.",
      "Memberikan kesan profesional dengan tampilan rapi.",
      "Mempercepat calon klien menghubungi Anda."
    ],
    priceStartingFrom: "Mulai Rp 699.000",
    deliveryTime: "3-5 Hari Kerja",
    iconName: "UserCircle"
  },
  {
    id: "online-store-sederhana",
    title: "Online Store Sederhana",
    slug: "online-store-sederhana",
    shortDescription: "Website toko online sederhana untuk menampilkan produk, detail produk, keranjang sederhana, dan checkout langsung melalui website.",
    fullDescription: "Online Store Sederhana cocok untuk UMKM dan usaha retail yang ingin menjual produk secara online dengan tampilan bersih, katalog interaktif, halaman produk detail, serta proses checkout yang mudah melalui website dengan opsi pembayaran otomatis atau manual.",
    features: [
      "Katalog produk responsif",
      "Detail produk lengkap",
      "Keranjang sederhana",
      "Checkout langsung melalui website dengan pilihan pembayaran otomatis atau manual.",
      "Filter dan kategori produk",
      "Menu populer dan promo"
    ],
    benefits: [
      "Mempercepat pelanggan menemukan produk Anda.",
      "Menjaga proses penjualan tetap simpel dan mudah dipahami.",
      "Meningkatkan peluang closing dengan alur pemesanan yang jelas.",
      "Membuat toko online tampil lebih profesional."
    ],
    priceStartingFrom: "Mulai Rp 1.999.000",
    deliveryTime: "7-14 Hari Kerja",
    iconName: "ShoppingCart"
  },
  {
    id: "redesign-website",
    title: "Redesign Website",
    slug: "redesign-website",
    shortDescription: "Layanan perbaikan tampilan website lama agar terlihat lebih modern, rapi, responsif, dan mudah dipahami pelanggan.",
    fullDescription: "Redesign Website adalah layanan penyegaran tampilan untuk website lama Anda sehingga lebih modern, mudah dinavigasi, dan lebih efektif mengarahkan pengunjung pada CTA penting seperti checkout, konsultasi, atau formulir kontak.",
    features: [
      "Perbaikan tampilan visual",
      "Optimasi layout mobile",
      "CTA lebih jelas",
      "Struktur halaman lebih profesional",
      "Update palet warna dan tipografi",
      "Review aksesibilitas dasar"
    ],
    benefits: [
      "Meningkatkan kepercayaan pengunjung.",
      "Memudahkan pengguna menemukan informasi penting.",
      "Mengurangi bounce rate dan kebingungan.",
      "Membuat website lebih siap untuk pasar modern."
    ],
    priceStartingFrom: "Mulai Rp 799.000",
    deliveryTime: "3-7 Hari Kerja",
    iconName: "RefreshCcw"
  },
  {
    id: "website-sesuai-kebutuhan",
    title: "Website Sesuai Kebutuhan",
    slug: "website-sesuai-kebutuhan",
    shortDescription: "Layanan pembuatan website custom untuk kebutuhan khusus seperti halaman event, form pendaftaran, profil komunitas, atau website promosi spesifik.",
    fullDescription: "Website Sesuai Kebutuhan memberikan solusi kustom untuk halaman event, pendaftaran, komunitas, atau promosi khusus, dengan desain dan alur yang disesuaikan untuk tujuan pemasaran Anda.",
    features: [
      "Struktur website menyesuaikan kebutuhan",
      "Desain custom sesuai brand",
      "CTA dan alur halaman disesuaikan",
      "Konsultasi konsep sebelum pengerjaan",
      "Form pendaftaran / RSVP online",
      "Halaman promosi acara dan kampanye"
    ],
    benefits: [
      "Mendapatkan website yang tepat guna.",
      "Desain dirancang untuk tujuan spesifik Anda.",
      "Memperkuat pesan acara atau komunitas.",
      "Lebih fleksibel untuk pengembangan selanjutnya."
    ],
    priceStartingFrom: "Konsultasi Kebutuhan",
    deliveryTime: "Menyesuaikan kebutuhan",
    iconName: "Layers"
  }
];
