import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Clock, Car, ExternalLink } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function OutletLocator({ outlets }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Header
    gsap.from('.gsap-outlet-header', {
      y: 30, opacity: 0, duration: 0.7,
      scrollTrigger: { trigger: '.gsap-outlet-header', start: 'top 88%', once: true },
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="outlet" className="py-16 md:py-24 px-4 sm:px-8 bg-white border-b border-[#eee5d8]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="gsap-outlet-header max-w-2xl mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-[#a61c1c] mb-2">
            Jaringan Cabang Resmi
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19120e]">
            Temukan Outlet Terdekat Anda
          </h2>
          <p className="text-sm text-[#5c4e43] mt-2 leading-relaxed">
            Semua cabang Masakan Padang ID didesain untuk kenyamanan bersantap keluarga maupun jamuan rekan bisnis dengan ruang ber-AC, musala bersih, dan fasilitas parkir luas.
          </p>
        </div>

        {/* Outlets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outlets.map((item) => (
            <div
              key={item.id}
              className="gsap-outlet-card bg-[#fcfbf9] rounded-2xl p-6 border border-[#e8ded2] shadow-sm hover:border-[#a61c1c] hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                    {item.tipe || 'Cabang Resmi'}
                  </span>
                  <span className="text-xs font-bold text-[#a61c1c]">
                    {item.kota}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#19120e]">
                  {item.nama_cabang}
                </h3>

                <div className="space-y-2.5 text-xs text-[#5c4e43] pt-2 border-t border-[#eee5d8]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#a61c1c] shrink-0 mt-0.5" />
                    <span>{item.alamat}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#c59837] shrink-0" />
                    <span>Buka: <strong className="text-[#19120e]">{item.jam_buka}</strong></span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#a61c1c] shrink-0" />
                    <span>Telepon: <strong className="text-[#19120e] font-mono">{item.telepon}</strong></span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[11px] text-[#7d7065] pt-1">
                    <Car className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.kapasitas}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 border-t border-[#eee5d8]">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(item.nama_cabang + ' ' + item.alamat)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-white hover:bg-[#a61c1c] text-[#19120e] hover:text-white border border-[#d6cbbe] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Buka Peta Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
