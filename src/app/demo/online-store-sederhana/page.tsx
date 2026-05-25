import Link from "next/link";
import { ArrowLeft, ShoppingBag, ShoppingCart } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

export const metadata = {
  title: "Demo Online Store Sederhana | Digital Carroll Base",
  description: "Demo online store UrbanStep Store dengan katalog produk, preview, cart summary, dan checkout website.",
};

export default function DemoOnlineStoreSederhana() {
  const products = [
    {
      name: "Urban Step Sneakers",
      category: "Sepatu",
      price: "Rp299.000",
      description: "Sneaker casual ringan dengan sol nyaman untuk aktivitas harian.",
      badge: "Best seller"
    },
    {
      name: "Canvas Tote Bag",
      category: "Aksesori",
      price: "Rp89.000",
      description: "Tas kanvas serbaguna cocok untuk jalan, kantor, dan kegiatan kreatif.",
      badge: "Promo"
    },
    {
      name: "Eco Jogger Pants",
      category: "Pakaian",
      price: "Rp179.000",
      description: "Celana jogger bahan adem dengan garis modern untuk tampilan aktif.",
      badge: "Baru"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <div className="sticky top-0 z-50 bg-purple-950 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Demo</span>
          <span>Contoh demo <strong>Online Store Sederhana</strong> untuk UrbanStep Store.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="underline hover:text-purple-200 font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
          <a
            href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin memesan online store sederhana untuk bisnis saya.")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 font-bold px-3 py-1 rounded-full text-[11px] transition-colors"
          >
            Pesan Website Ini
          </a>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-16 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">UrbanStep Store</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">Toko online sederhana yang menampilkan produk, kategori, dan checkout website.</h1>
            <p className="max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed">Desain toko yang bersih dan responsif untuk produk footwear, pakaian, dan aksesori urban dengan alur order yang jelas.</p>
            <div className="flex flex-wrap gap-4">
              <a
                href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin memesan website online store untuk UrbanStep Store.")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-950 hover:bg-purple-900 text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                Diskusi WhatsApp
              </a>
              <a href="#products" className="border border-slate-300 hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-full transition-colors">Lihat Produk</a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[2rem] border border-purple-200 bg-white p-8 shadow-sm">
            <div className="rounded-[1.75rem] bg-purple-950 p-8 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-purple-200">Best seller</p>
              <h2 className="mt-4 text-3xl font-bold">Urban Step Sneakers</h2>
              <p className="mt-4 text-sm leading-relaxed text-purple-200">Sneaker casual dengan kombinasi desain modern dan kenyamanan yang pas untuk aktivitas sehari-hari.</p>
              <div className="mt-6 flex items-center justify-between rounded-3xl bg-white/10 px-4 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-200">Harga</p>
                  <p className="text-2xl font-black">Rp299.000</p>
                </div>
                <button className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400">Tambah Pesanan</button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kategori Produk</p>
              <h2 className="text-3xl font-bold text-slate-900">Filter Kategori</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Sepatu", "Pakaian", "Aksesori", "Promo"].map((category) => (
                <button key={category} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{category}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="products">
            {products.map((product) => (
              <article key={product.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{product.category}</span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">{product.badge}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{product.description}</p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-lg font-bold text-slate-900">{product.price}</p>
                  <a
                    href={getWhatsAppLink(`Halo Digital Carroll Base, saya ingin memesan ${product.name} dari UrbanStep Store.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-purple-950 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-900"
                  >
                    Order
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-3xl bg-slate-100 p-4 text-purple-700">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Preview Produk</p>
                <h2 className="text-2xl font-bold text-slate-900">Detail Produk dan Pilihan Item</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Product</p>
                <h3 className="mt-3 font-semibold text-slate-900">Urban Step Sneakers</h3>
                <p className="mt-2 text-sm text-slate-600">Sepatu lifestyle dengan detail jahitan halus dan sol nyaman.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pilihan</p>
                <h3 className="mt-3 font-semibold text-slate-900">Ukuran & Warna</h3>
                <p className="mt-2 text-sm text-slate-600">Tersedia ukuran 38-43 dengan pilihan abu, hitam, dan cream.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-purple-100 p-3 text-purple-700">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ringkasan Keranjang</p>
                <h3 className="text-xl font-bold text-slate-900">3 Item Siap Checkout</h3>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Urban Step Sneakers</p>
                <p className="text-sm text-slate-600">Rp299.000 x 1</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Canvas Tote Bag</p>
                <p className="text-sm text-slate-600">Rp89.000 x 1</p>
              </div>
            </div>
            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Total Pesanan</span>
                <span className="font-bold text-lg">Rp388.000</span>
              </div>
              <a
                href={getWhatsAppLink("Halo Digital Carroll Base, saya ingin checkout pesanan UrbanStep Store.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400"
              >
                Checkout Website
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-purple-200 bg-purple-950 p-8 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { label: "Banner Promo", detail: "Diskon 20% untuk pembelian pertama." },
              { label: "Pengiriman", detail: "Pilihan antar lokal cepat dalam 1-2 hari." },
              { label: "Support", detail: "Konsultasi dan konfirmasi pesanan tetap mudah." }
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-white/10 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-purple-200">{item.label}</p>
                <p className="mt-4 text-lg font-semibold text-white">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
