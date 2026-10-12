import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PackageCheck, Clock, FileText, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CateringSection({ onAddPackage }) {
  const containerRef = useRef(null);

  const packages = [
    {
      id: 'pkg-1',
      nama: 'Paket Nasi Kotak Singgalang (Paling Favorit)',
      harga: 35000,
      badge: 'Best Seller Kantor',
      image_url: '/images/menu/nasi-kotak-singgalang.jpg',
      items: [
        'Nasi Putih Beras Solok Pulen',
        'Rendang Daging Sapi 8 Jam (1 Potong)',
        'Gulai Daun Singkong & Teri',
        'Sambal Lado Mudo Segar',
        'Kerupuk Kulit Gurih',
        'Air Mineral Cup & Sendok Higienis'
      ]
    },
    {
      id: 'pkg-2',
      nama: 'Paket Nasi Kotak Marapi (Ayam Pop)',
      harga: 32000,
      badge: 'Favorit Rapat',
      image_url: '/images/menu/nasi-kotak-marapi.jpg',
      items: [
        'Nasi Putih Beras Solok Pulen',
        'Ayam Pop Gurih Asli (1 Potong)',
        'Telur Balado / Dadar Padang',
        'Sayur Nangka Kapau Kental',
        'Saus Lado Merah Khas Bukittinggi',
        'Air Mineral Cup & Sendok Higienis'
      ]
    },
    {
      id: 'pkg-3',
      nama: 'Paket Nasi Kotak Sianok (Istimewa Kakap)',
      harga: 42000,
      badge: 'Spesial VIP Acara',
      image_url: '/images/menu/nasi-kotak-sianok.jpg',
      items: [
        'Nasi Putih Beras Solok Pulen',
        'Gulai Ikan Kakap Kuning Gurih',
        'Perkedel Kentang Daging Gurih',
        'Gulai Daun Singkong Renyah',
        'Sambalado Hijau & Merah',
        'Air Mineral Botol & Buah Pisang'
      ]
    }
  ];

  useGSAP(() => {
    // Header reveal
    gsap.from('.gsap-catering-header', {
      y: 30, opacity: 0, duration: 0.7,
      scrollTrigger: { trigger: '.gsap-catering-header', start: 'top 88%', once: true },
    });

    // Benefits strip stagger
    gsap.from('.gsap-benefit-item', {
      x: -20, opacity: 0, duration: 0.5, stagger: 0.12,
      scrollTrigger: { trigger: '.gsap-benefit-item', start: 'top 88%', once: true },
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="nasibox" className="py-16 md:py-24 px-4 sm:px-8 bg-[#fbf9f5] border-b border-[#eee5d8]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="gsap-catering-header max-w-2xl mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-[#a61c1c] mb-2">
            Layanan Korporat & Hajatan
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19120e]">
            Paket Nasi Kotak Kantor & Prasmanan
          </h2>
          <p className="text-sm text-[#5c4e43] mt-2 leading-relaxed">
            Pilihan praktis untuk rapat instansi, seminar kampus, pengajian keluarga, maupun syukuran hajatan dengan kemasan kotak bersekat eksklusif & higienis.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: PackageCheck, title: 'Bento Box 5 Sekat Tebal', desc: 'Kemasan food grade anti tumpah & saus sambal terpisah aman.' },
            { icon: Clock, title: 'Garansi Hangat & Tepat Waktu', desc: 'Armada pengantaran khusus dengan tas termal pengatur suhu.' },
            { icon: FileText, title: 'Faktur Pajak & SPJ Resmi', desc: 'Dokumentasi legal lengkap NPWP, e-Faktur, & kwitansi instansi/BUMN.' },
            { icon: CheckCircle2, title: 'Kapasitas 50 - 3.500 Kotak', desc: 'Dapur sentral siap melayani rapat direksi hingga akbar nasional.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="gsap-benefit-item p-4 bg-white rounded-xl border border-[#e8ded2] flex items-center gap-3 shadow-xs">
              <Icon className="w-6 h-6 text-[#a61c1c] shrink-0" />
              <div className="text-xs">
                <strong className="block text-[#19120e]">{title}</strong>
                <span className="text-[#7d7065]">{desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 3 Packages Card with Authentic Photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="gsap-pkg-card bg-white rounded-2xl p-5 border border-[#e8ded2] shadow-sm hover:border-[#a61c1c] transition flex flex-col justify-between group"
            >
              <div>
                {/* Visual Package Culinary Photo */}
                <div className="h-44 rounded-xl overflow-hidden mb-4 relative border border-[#e8dfd3] bg-[#f7f3ec] group-hover:shadow-md transition">
                  <img
                    src={pkg.image_url}
                    alt={pkg.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-[#a61c1c] text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow">
                    {pkg.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-[#918175]">Per Box Eksklusif</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Bento Higienis
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#19120e] mb-1">
                  {pkg.nama}
                </h3>

                <div className="text-2xl font-bold text-[#a61c1c] mb-4">
                  Rp {pkg.harga.toLocaleString('id-ID')}
                </div>

                <div className="space-y-2 pt-2 border-t border-[#eee5d8]">
                  <div className="text-[11px] font-semibold text-[#7d7065] uppercase">Komposisi Menu:</div>
                  {pkg.items.map((it, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#4a3e35]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#eee5d8] space-y-2">
                <button
                  onClick={() => onAddPackage(pkg)}
                  className="w-full py-3 min-h-[44px] bg-[#18100c] hover:bg-[#a61c1c] active:scale-98 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>+ Tambah Paket ke Nampan</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Corporate VIP Banner */}
        <div className="mt-10 bg-white border border-[#e8ded2] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#a61c1c] mb-1">
              Khusus Instansi, BUMN, & Hajatan Skala Besar
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#19120e]">
              Butuh Penawaran Custom atau Pembayaran Termin SPJ?
            </h4>
            <p className="text-xs text-[#5c4e43] mt-1 max-w-2xl">
              Tim Corporate Relationship kami siap menerbitkan Surat Penawaran Resmi, Invoice bertempo, dan menyusun menu sesuai batas anggaran per pax kantor Anda.
            </p>
          </div>
          <a
            href="https://wa.me/6285147413866?text=Halo%20Bundo%20Kanduang,%20saya%20dari%20instansi/kantor%20ingin%20konsultasi%20paket%20nasi%20kotak%20skala%20besar."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#a61c1c] hover:bg-[#8e1717] text-white text-xs font-bold rounded-xl shadow transition shrink-0 flex items-center gap-2"
          >
            <span>Konsultasi Divisi Katering</span>
            <span>➔</span>
          </a>
        </div>

      </div>
    </section>
  );
}

