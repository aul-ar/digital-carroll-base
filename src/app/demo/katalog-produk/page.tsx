"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Check, 
  X,
  ExternalLink
} from "lucide-react";
import { mockProducts, MockProduct } from "@/data/demos";
import { getWhatsAppLink } from "@/utils/whatsapp";

interface CartItem extends MockProduct {
  quantity: number;
}

export default function DemoKatalogProduk() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // Filter products based on search and category
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart function
  const addToCart = (product: MockProduct) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    // Alert simulation
    setAddedItemName(product.name);
    setTimeout(() => setAddedItemName(null), 2500);
  };

  // Remove from cart
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Clear cart
  const clearCart = () => setCart([]);

  // Calculate totals
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Generate checkout confirmation link
  const getCheckoutLink = () => {
    if (cart.length === 0) return "#";
    
    let message = "Halo Carroll Wear, saya ingin memesan beberapa produk dari katalog online:\n\n";
    cart.forEach((item, idx) => {
      message += `${idx + 1}. *${item.name}* (Qty: ${item.quantity}) - Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n`;
    });
    message += `\n*Total Belanja:* Rp ${totalPrice.toLocaleString("id-ID")}\n\nMohon informasi ongkir dan rekening pembayaran. Terima kasih!`;
    return getWhatsAppLink(message);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative">
      
      {/* 1. Header Alert Banner */}
      <div className="sticky top-0 z-30 bg-purple-900 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-purple-650 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Demo</span>
          <span>Ini adalah contoh web <strong>Katalog Produk Toko Online</strong> hasil karya Digital Carroll Base.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="underline hover:text-purple-200 font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
          <a
            href={getWhatsAppLink("Halo Digital Carroll Base, saya melihat demo Katalog Produk Carroll Wear dan ingin memesan website seperti itu.")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 font-bold px-3 py-1 rounded-full text-[11px] transition-colors"
          >
            Pesan Website Ini
          </a>
        </div>
      </div>

      {/* Alert Pop-up on adding item */}
      {addedItemName && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-md flex items-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{addedItemName} berhasil ditambahkan ke keranjang</span>
        </div>
      )}

      {/* Boutique Navbar */}
      <nav className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between border-b border-slate-200/80 bg-white shadow-sm sm:rounded-b-2xl">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-purple-900 rounded-full flex items-center justify-center text-white">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-serif font-black text-xl tracking-tight text-slate-900">Carroll Wear</span>
        </div>

        {/* Search Input Desktop */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pakaian, tas, aksesoris..."
            className="bg-transparent text-xs w-full focus:outline-none"
          />
        </div>

        {/* Shopping Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 bg-purple-955 text-white hover:bg-purple-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors relative cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Keranjang Pemesanan</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {totalItems}
            </span>
          )}
        </button>
      </nav>

      {/* Mobile Search input */}
      <div className="md:hidden max-w-6xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl">
          <Search className="w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pakaian, tas, aksesoris..."
            className="bg-transparent text-sm w-full focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Banner Promotion */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Promo Spesial Awal Musim</span>
            <h2 className="text-2xl font-serif font-black">Diskon Hingga 30% All Items</h2>
            <p className="text-slate-200 text-xs max-w-md">Katalog fashion terkini dengan kualitas benang premium standar ekspor.</p>
          </div>
          <button 
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="bg-white text-purple-900 hover:bg-slate-100 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Lihat Koleksi
          </button>
        </div>

        {/* Category Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide text-xs font-semibold">
          {["All", "Pakaian", "Tas", "Aksesoris"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-purple-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {category === "All" ? "Semua Produk" : category}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
            <span className="text-4xl block">🔍</span>
            <h3 className="font-bold text-base mt-4 text-slate-800">Produk tidak ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">Coba masukkan kata kunci pencarian atau kategori lainnya.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white border border-slate-250/60 rounded-3xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Visual placeholder representing product image */}
                <div className="h-44 bg-slate-100 flex items-center justify-center text-6xl relative select-none">
                  {product.image}
                  {product.originalPrice && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                      Sale
                    </span>
                  )}
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full capitalize">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-slate-550 line-clamp-2 leading-relaxed min-h-8">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    {/* Prices */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-black text-slate-900 text-base">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-slate-400 text-xs line-through">
                          Rp {product.originalPrice.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={getWhatsAppLink(`Halo Carroll Wear, saya tertarik memesan produk "${product.name}" seharga Rp ${product.price.toLocaleString("id-ID")}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 border border-slate-250 hover:bg-slate-50 font-bold text-xs py-2.5 rounded-xl text-slate-700 transition-colors"
                      >
                        Beli Langsung
                      </a>
                      <button
                        onClick={() => addToCart(product)}
                        className="flex items-center justify-center gap-1.5 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        + Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Shopping Cart Drawer Side-panel Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end">
          {/* Drawer Body */}
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl relative animate-slide-in">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-900" />
                <h3 className="font-bold text-base">Keranjang Belanja</h3>
                <span className="text-xs bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full font-bold">
                  {totalItems} barang
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-450 space-y-2">
                  <div className="text-5xl">🛒</div>
                  <h4 className="font-bold text-slate-800">Keranjang masih kosong</h4>
                  <p className="text-xs text-slate-400">Silakan tambahkan beberapa produk fashion favorit Anda.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-slate-100 pb-4 justify-between">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl select-none shrink-0">
                        {item.image}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>Qty: {item.quantity}</span>
                          <span>&bull;</span>
                          <span>Rp {item.price.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <span className="text-sm font-extrabold text-slate-900">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer calculations & checkout */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal Belanja:</span>
                <span className="text-base font-extrabold text-slate-900">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="col-span-1 border border-slate-200 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-150 font-bold text-xs py-3 rounded-lg text-slate-650 transition-colors cursor-pointer text-center"
                >
                  Reset
                </button>
                <a
                  href={getCheckoutLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cart.length > 0 && setIsCartOpen(false)}
                  className={`col-span-2 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-lg shadow-sm transition-colors text-center ${
                    cart.length === 0 ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <span>Konfirmasi Pesanan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Pemesanan Anda akan dirangkum rapi untuk validasi pesanan dan detail ongkir.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Fake Boutique Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-xs border-t border-slate-800 mt-16">
        <p>&copy; {new Date().getFullYear()} Carroll Wear. Powered by <strong>Digital Carroll Base</strong>.</p>
      </footer>
      
    </div>
  );
}
