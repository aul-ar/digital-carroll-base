export interface Demo {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  thumbnailColor: string; // Tailwind gradient class
  previewUrl: string; // Internal route
}

export const demos: Demo[] = [
  {
    id: "demo-landing-page",
    title: "Carroll Coffee - Landing Page Kedai Kopi",
    slug: "landing-page",
    category: "Food & Beverage / Cafe",
    description: "Contoh landing page modern untuk usaha kuliner/kafe. Dilengkapi menu highlight, galeri suasana, ulasan pelanggan, lokasi Google Maps, dan tombol booking/konsultasi yang jelas.",
    features: [
      "Hero Section Menarik dengan Gambar Kopi Estetik",
      "Menu Favorit Showcase dengan Tag Harga",
      "Social Proof (Testimoni Pelanggan)",
      "Floating Booking dan Contact Button",
      "Peta Lokasi & Jam Operasional Terintegrasi"
    ],
    thumbnailColor: "from-amber-700 via-amber-800 to-yellow-900",
    previewUrl: "/demo/landing-page"
  },
  {
    id: "demo-company-profile",
    title: "Carroll Consulting - Profil Perusahaan Jasa",
    slug: "company-profile",
    category: "Professional Services / Agency",
    description: "Template website profil perusahaan untuk agensi kreatif, konsultan, hukum, atau jasa profesional lainnya. Menampilkan layanan kami, profil tim, portofolio proyek, FAQ, dan form kontak interaktif.",
    features: [
      "Desain Minimalis, Bersih, dan Terpercaya",
      "Statistik Pencapaian (Key Metrics Counter)",
      "Showcase Portfolio dengan Filter Kategori",
      "Accordion FAQ Interaktif",
      "Halaman Kontak Interaktif (Form Kirim ke WA)"
    ],
    thumbnailColor: "from-blue-600 via-indigo-700 to-purple-800",
    previewUrl: "/demo/company-profile"
  },
  {
    id: "demo-katalog-produk",
    title: "Carroll Wear - Katalog Fashion & Hijab",
    slug: "katalog-produk",
    category: "Retail / Fashion / UMKM Toko",
    description: "Contoh katalog produk online interaktif untuk toko fashion, hijab, aksesoris, atau produk fisik lainnya. Memungkinkan pengunjung memfilter kategori, melihat foto detail, dan melanjutkan pemesanan melalui alur yang jelas.",
    features: [
      "Filter Kategori Instan (All, Pakaian, Aksesoris, Tas)",
      "Pencarian Produk Real-time",
      "Badge Promo/Diskon Menarik",
      "Halaman Detail Produk Modal / Pop-up",
      "Keranjang Belanja Ringan untuk Checkout Cepat"
    ],
    thumbnailColor: "from-purple-600 via-pink-600 to-red-500",
    previewUrl: "/demo/katalog-produk"
  },
  {
    id: "demo-website-portfolio",
    title: "Carroll Portfolio - Website Personal Profesional",
    slug: "website-portfolio",
    category: "Personal Branding / Portfolio",
    description: "Demo website portfolio personal yang menampilkan hero profile, skill section, portofolio proyek, pengalaman kerja, dan tombol kontak.",
    features: [
      "Hero profil personal dengan CTA kontak",
      "Section skill & pengalaman kerja",
      "Galeri proyek atau karya unggulan",
      "Testimonial singkat atau rekomendasi",
      "Form kontak langsung"
    ],
    thumbnailColor: "from-sky-600 via-cyan-500 to-blue-700",
    previewUrl: "/demo/website-portfolio"
  },
  {
    id: "demo-online-store-sederhana",
    title: "Carroll Store - Online Store Sederhana",
    slug: "online-store-sederhana",
    category: "Retail / Shop",
    description: "Demo toko online sederhana dengan katalog produk, detail item, ringkasan keranjang, dan checkout langsung melalui website.",
    features: [
      "Katalog produk responsif dan rapi",
      "Detail produk lengkap dengan harga",
      "Ringkasan keranjang pembelian sederhana",
      "Checkout langsung melalui website",
      "Label promo dan produk populer"
    ],
    thumbnailColor: "from-emerald-600 via-lime-600 to-emerald-700",
    previewUrl: "/demo/online-store-sederhana"
  },
  {
    id: "demo-redesign-website",
    title: "Carroll Refresh - Redesign Website Modern",
    slug: "redesign-website",
    category: "UX/UI Refresh",
    description: "Demo perbandingan tampilan sebelum/sesudah yang memperlihatkan website lama berubah menjadi lebih modern, bersih, dan Mobile-Friendly.",
    features: [
      "Before / After style comparison",
      "Peningkatan tata letak visual dan hierarki",
      "Fokus pada CTA yang lebih jelas",
      "Desain responsif untuk perangkat mobile",
      "Penggunaan warna dan tipografi modern"
    ],
    thumbnailColor: "from-violet-600 via-fuchsia-600 to-pink-600",
    previewUrl: "/demo/redesign-website"
  },
  {
    id: "demo-website-sesuai-kebutuhan",
    title: "Carroll Custom - Website Sesuai Kebutuhan",
    slug: "website-sesuai-kebutuhan",
    category: "Custom / Event",
    description: "Demo website fleksibel untuk halaman event, pendaftaran, komunitas, atau promosi kampanye yang bisa disesuaikan dengan kebutuhan Anda.",
    features: [
      "Layout halaman event atau kampanye yang adaptif",
      "Form pendaftaran atau RSVP online",
      "Desain custom sesuai tujuan acara",
      "Call-to-action yang terarah",
      "Kontak langsung untuk konversi cepat"
    ],
    thumbnailColor: "from-amber-600 via-orange-600 to-rose-600",
    previewUrl: "/demo/website-sesuai-kebutuhan"
  }
];

export interface MockProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string; // Placeholder or generated asset
  description: string;
  sizes?: string[];
}

export const mockProducts: MockProduct[] = [
  {
    id: "p1",
    name: "Classic Carroll Overcoat",
    category: "Pakaian",
    price: 349000,
    originalPrice: 499000,
    image: "🧥",
    description: "Mantel overcoat wol klasik dengan bahan premium tebal, sangat cocok untuk gaya kasual formal maupun bepergian saat musim dingin.",
    sizes: ["M", "L", "XL"]
  },
  {
    id: "p2",
    name: "Minimalist Leather Backpack",
    category: "Tas",
    price: 289000,
    image: "🎒",
    description: "Ransel kulit sintetis berkualitas tinggi dengan desain minimalis anti-air, cocok untuk bekerja, kuliah, atau aktivitas harian.",
    sizes: ["Satu Ukuran"]
  },
  {
    id: "p3",
    name: "Premium Linen Shirt",
    category: "Pakaian",
    price: 185000,
    originalPrice: 220000,
    image: "👕",
    description: "Kemeja bahan linen premium yang sejuk, adem, dan menyerap keringat. Potongan rileks yang memberi kesan santai namun rapi.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "p4",
    name: "Aviator Classic Sunglasses",
    category: "Aksesoris",
    price: 125000,
    image: "🕶️",
    description: "Kacamata hitam model aviator dengan pelindung UV400 untuk menjaga mata Anda dari paparan sinar matahari langsung, sangat trendi.",
    sizes: ["Satu Ukuran"]
  },
  {
    id: "p5",
    name: "Urban Canvas Totebag",
    category: "Tas",
    price: 95000,
    originalPrice: 130000,
    image: "👜",
    description: "Tas jinjing kanvas tebal dengan kancing resleting dan sekat bagian dalam untuk menjaga barang bawaan tetap teratur.",
    sizes: ["Satu Ukuran"]
  },
  {
    id: "p6",
    name: "Carroll Signature Beanie Hat",
    category: "Aksesoris",
    price: 69000,
    image: "🧦",
    description: "Topi kupluk rajut elastis yang lembut dan hangat, melengkapi gaya kasual jalanan (streetwear) Anda di cuaca dingin.",
    sizes: ["Satu Ukuran"]
  }
];
