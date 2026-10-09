import React from 'react';

export default function MarqueeTicker() {
  const items = [
    { text: 'Rendang Daging Sapi Darek (Karamelisasi 8 Jam)', tag: 'Signature' },
    { text: 'Sertifikasi 100% Halal MUI & BPJPH Resmi', tag: 'Akreditasi' },
    { text: 'Ayam Pop Gurih Sambal Lado Asli Minang', tag: 'Favorit' },
    { text: 'Dendeng Batokok Lado Mudo Kering Gurih', tag: 'Renyah' },
    { text: 'Gulai Kepala Ikan Kakap Kuah Daun Ruku-Ruku', tag: 'Istimewa' },
    { text: 'Standar Dapur Higienis HACCP & Food Grade', tag: 'Kualitas' },
    { text: 'Gulai Tunjang Sapi Empuk Bumbu Kuning', tag: 'Tradisi' },
    { text: 'Siap Nasi Kotak Bento Box Rapat BUMN & Hajatan', tag: 'Katering' },
    { text: 'Telur Dadar Bebek Tebal Berbumbu Daun Kunyit', tag: 'Klasik' },
    { text: 'Sambal Lado Mudo Segar Minyak Kelapa Asli', tag: 'Pedas' },
    { text: 'Teh Talua Kocok Asli Penambah Stamina', tag: 'Minuman' },
  ];

  return (
    <div className="relative bg-gradient-to-r from-[#140e0b] via-[#241610] to-[#140e0b] text-white py-2.5 border-y border-[#d4af37]/30 overflow-hidden flex items-center select-none shadow-inner">
      {/* Golden Badge Label */}
      <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#140e0b] text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full ml-3 sm:ml-6 shrink-0 shadow-md z-10 flex items-center gap-1.5 border border-[#fff2b2]/40">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8a1515] animate-ping" />
        <span>STANDAR NASIONAL</span>
      </div>

      <div className="flex overflow-hidden text-xs font-medium text-[#faebd7] ml-4">
        {/* Track 1 */}
        <div className="animate-marquee items-center gap-8 pr-8 flex whitespace-nowrap">
          {items.map((item, idx) => (
            <span key={`t1-${idx}`} className="flex items-center gap-3">
              <span className="tracking-wide font-normal text-stone-200">{item.text}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8a1515] text-[#f5d796] border border-[#d4af37]/40 shadow-xs uppercase">
                {item.tag}
              </span>
              <span className="text-[#d4af37] font-serif text-sm">✦</span>
            </span>
          ))}
        </div>

        {/* Track 2 (Clone for seamless infinite loop) */}
        <div className="animate-marquee items-center gap-8 pr-8 flex whitespace-nowrap" aria-hidden="true">
          {items.map((item, idx) => (
            <span key={`t2-${idx}`} className="flex items-center gap-3">
              <span className="tracking-wide font-normal text-stone-200">{item.text}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8a1515] text-[#f5d796] border border-[#d4af37]/40 shadow-xs uppercase">
                {item.tag}
              </span>
              <span className="text-[#d4af37] font-serif text-sm">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

