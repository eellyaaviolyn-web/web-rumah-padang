import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, MapPin, Clock, ArrowRight, ShieldCheck, Database, KeyRound } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Footer({ onOpenDatabaseModal, onOpenAdmin }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from('.gsap-footer-col', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 90%',
        once: true,
      },
    });
  }, { scope: containerRef });

  return (
    <footer ref={containerRef} className="bg-[#0f0a07] text-[#e8ded1] pt-16 pb-12 px-4 sm:px-8 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Hospitality Callout Banner */}
        <div className="mb-14 pb-12 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#caa268]">
              Pemesanan Acara & Nasi Kotak
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal mt-1 leading-snug">
              Hadirkan Kelezatan Minang di Setiap Momen Istimewa Anda.
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Menerima pesanan nasi kotak skala kecil hingga ribuan porsi untuk rapat kantor, syukuran, dan acara keluarga.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://wa.me/6285147413866?text=Halo%20Masakan%20Padang%20ID,%20saya%20ingin%20memesan%20katering%20nasi%20kotak."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#b59261] hover:bg-[#a07f50] text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Konsultasi Pesanan</span>
            </a>
            <a
              href="#nasibox"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-full font-semibold text-xs uppercase tracking-wider transition-all duration-300 backdrop-blur-xs"
            >
              Lihat Pilihan Menu
            </a>
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Identity (5 cols) */}
          <div className="gsap-footer-col md:col-span-5 space-y-4">
            <a href="#" className="inline-block group">
              <img 
                src="/logo-horizontal-light.png" 
                alt="Masakan Padang ID" 
                className="h-10 w-auto object-contain transition group-hover:opacity-90" 
              />
            </a>
            
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Menghadirkan keaslian resep masakan Minangkabau secara turun-temurun. Menggunakan 16 racikan rempah Bukit Tinggi dan santan kelapa tua murni, dimasak lambat di atas bara api kayu pilihan.
            </p>

          </div>

          {/* Col 2: Navigasi Menu (2 cols) */}
          <div className="gsap-footer-col md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigasi</h4>
            <nav className="flex flex-col space-y-2.5 text-xs text-stone-400">
              <a href="#beranda" className="hover:text-white transition">Beranda Utama</a>
              <a href="#tentang" className="hover:text-white transition">Dapur & Tradisi</a>
              <a href="#menu" className="hover:text-white transition">Katalog Masakan</a>
              <a href="#nasibox" className="hover:text-white transition">Paket Nasi Kotak</a>
              <a href="#lacak" className="hover:text-white transition">Lacak Pesanan</a>
              <a href="#outlet" className="hover:text-white transition">Cabang Outlet</a>
            </nav>
          </div>

          {/* Col 3: Jam Layanan (2 cols) */}
          <div className="gsap-footer-col md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Jam Buka</h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div>
                <p className="text-white font-medium">Dine-in & Bungkus</p>
                <p className="text-[11px] text-stone-400 mt-0.5">08.00 – 22.00 WIB</p>
                  Setiap Hari Buka
              </div>
              <div className="pt-2">
                <p className="text-white font-medium">Pesanan Nasi Kotak</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Pemesanan disarankan H-1</p>
              </div>
            </div>
          </div>

          {/* Col 4: Kontak & Manajemen (3 cols) */}
          <div className="gsap-footer-col md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kontak & Lokasi</h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <a 
                href="https://wa.me/6285147413866" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#caa268] shrink-0" />
                <span>0851-4741-3866 (Kasir)</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#caa268] shrink-0 mt-0.5" />
                <span>Bandung, Jawa Barat, Indonesia</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Information */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Masakan Padang ID. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span>Pembayaran: Tunai, QRIS, & Transfer Bank</span>
            <span className="hidden sm:inline text-stone-700">•</span>
            <a href="#tentang" className="hover:text-stone-300 transition">Tentang Kami</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
