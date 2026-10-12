import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Menu as MenuIcon, X, Phone, ShoppingBag, ShieldCheck, Lock } from 'lucide-react';

export default function Navbar({ trayItems = [], onOpenTray, onOpenAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const totalQty = trayItems.reduce((acc, item) => acc + (item.jumlah || 1), 0);

  useGSAP(() => {
    if (!navRef.current) return;
    gsap.from(navRef.current, {
      y: -60,
      opacity: 0,
      duration: 0.65,
      ease: 'power3.out',
    });
  });

  return (
    <div ref={navRef} className="sticky top-0 z-40 shadow-md">
      {/* MAIN NAVBAR - Luxury Dark Glass Aesthetic */}
      <header className="bg-[#100b08]/90 backdrop-blur-md text-white px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between border-b border-white/10">
        
        {/* Left: Brand Logo */}
        <a href="#" className="flex items-center gap-2 group shrink-0">
          <img 
            src="/logo-horizontal-light.png" 
            alt="Masakan Padang ID - Rumah Makan Khas Padang" 
            className="h-8 sm:h-10 w-auto object-contain transition group-hover:scale-105 drop-shadow" 
          />
        </a>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-6 text-xs font-semibold tracking-wider uppercase">
          {[
            { label: 'Beranda', href: '#beranda' },
            { label: 'Dapur & Tradisi', href: '#tentang' },
            { label: 'Katalog Menu', href: '#menu' },
            { label: 'Paket Nasi Kotak', href: '#nasibox' },
            { label: 'Lacak Pesanan', href: '#lacak' },
            { label: 'Cabang Outlet', href: '#outlet' },
          ].map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-stone-300 hover:text-[#e5be82] transition py-1 relative hover:-translate-y-0.5 transform duration-150"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: CTA Actions (Keranjang + Hubungi Kasir) */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Tombol Keranjang / Nampan Pesanan */}
          <button
            type="button"
            onClick={onOpenTray}
            className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition active:scale-95 cursor-pointer group"
            title="Buka Keranjang / Nampan Pesanan"
            aria-label="Keranjang Pesanan"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#e5be82] group-hover:scale-110 transition-transform" />
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-[#a61c1c] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md animate-pulse">
                  {totalQty}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
              Keranjang {totalQty > 0 ? `(${totalQty})` : ''}
            </span>
          </button>

          {/* Quick WhatsApp Action with Kasir Phone Number */}
          <a
            href="https://wa.me/6285147413866?text=Halo%20Masakan%20Padang%20ID,%20saya%20ingin%20bertanya%20menu%20dan%20pesanan."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 bg-[#b59261] hover:bg-[#a07f50] text-white px-4 sm:px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition whitespace-nowrap active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hubungi Kasir</span>
          </a>

          {/* Mobile Menu Toggle (Target Sentuh Ergonomis 44px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#140e0b]/95 backdrop-blur-md text-white p-5 space-y-4 border-b border-white/10 shadow-2xl animate-fadeIn">
          
          {/* Quick Cart Shortcut on Mobile Drawer */}
          <div className="pb-3 border-b border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTray();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs font-bold text-white transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#e5be82]" />
              <span>Buka Nampan Pesanan {totalQty > 0 ? `(${totalQty} Porsi)` : '(Kosong)'}</span>
            </button>
          </div>

          <nav className="flex flex-col space-y-3 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <a href="#beranda" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#e5be82] text-stone-200">Beranda</a>
            <a href="#tentang" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#e5be82] text-stone-200">Dapur & Tradisi</a>
            <a href="#menu" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#e5be82] text-stone-200">Katalog Menu & Harga</a>
            <a href="#nasibox" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#e5be82] text-stone-200">Paket Nasi Kotak Kantor</a>
            <a href="#lacak" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#e5be82] text-stone-200">Lacak Status Pesanan</a>
            <a href="#outlet" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#e5be82] text-stone-200">Cabang Outlet Terdekat</a>
          </nav>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <a
              href="https://wa.me/6285147413866?text=Halo%20Masakan%20Padang%20ID,%20saya%20ingin%20bertanya%20menu%20dan%20pesanan."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#b59261] hover:bg-[#a07f50] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition"
            >
              <Phone className="w-4 h-4" />
              <span>Hubungi Kasir (0851-4741-3866)</span>
            </a>

            {onOpenAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-[#f5d796] py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk ke Portal Kasir & Admin</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
