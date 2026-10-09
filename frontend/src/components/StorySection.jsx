import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Flame, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function StorySection() {
  const containerRef = useRef(null);

  const pillars = [
    {
      icon: Flame,
      title: 'Reduksi 8 Jam Kayu Bakar',
      desc: 'Rendang tidak dimasak terburu-buru. Butuh waktu minimal 8 jam pengadukan bertahap agar santan mengental hingga bumbu meresap ke serat daging terdalam.'
    },
    {
      icon: Award,
      title: '16 Rempah Asli Bukittinggi',
      desc: 'Mulai dari pala, cengkih, kapulaga, lengkuas merah, hingga asam kandis didatangkan langsung dari dataran tinggi Sumatera Barat demi kemurnian aroma.'
    },
    {
      icon: HeartHandshake,
      title: 'Santan Kelapa Tua Murni',
      desc: 'Kami pantang menggunakan santan instan atau pengawet buatan. Hanya kelapa tua segar yang diparut dan diperas manual setiap subuh hari.'
    },
    {
      icon: ShieldCheck,
      title: 'Jaminan 100% Halal MUI',
      desc: 'Seluruh daging sapi dan ayam memiliki sertifikat potong halal resmi MUI dengan standar kebersihan dapur yang diawasi ketat setiap hari.'
    }
  ];

  useGSAP(() => {
    // Section header reveal
    gsap.from('.gsap-section-label', {
      y: 20, opacity: 0, duration: 0.6,
      scrollTrigger: {
        trigger: '.gsap-section-label',
        start: 'top 88%',
        once: true,
      },
    });

    gsap.from('.gsap-section-heading', {
      y: 30, opacity: 0, duration: 0.75,
      scrollTrigger: {
        trigger: '.gsap-section-heading',
        start: 'top 85%',
        once: true,
      },
    });

    gsap.from('.gsap-section-body', {
      y: 20, opacity: 0, duration: 0.6,
      scrollTrigger: {
        trigger: '.gsap-section-body',
        start: 'top 85%',
        once: true,
      },
    });


    // Quote box
    gsap.from('.gsap-quote-box', {
      y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: {
        trigger: '.gsap-quote-box',
        start: 'top 88%',
        once: true,
      },
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="tentang" className="py-16 md:py-24 px-4 sm:px-8 bg-[#fbf9f5] border-b border-[#eee5d8]">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="gsap-section-label text-xs font-bold uppercase tracking-widest text-[#a61c1c] mb-2">
            Filosofi Dapur Kami
          </div>
          <h2 className="gsap-section-heading font-serif text-3xl sm:text-4xl font-bold text-[#19120e] leading-tight">
            Memasak dengan Rasa Hormat pada <br />
            <span className="text-[#a61c1c] italic">Tradisi Leluhur Minangkabau.</span>
          </h2>
          <p className="gsap-section-body text-sm text-[#5c4e43] mt-3 leading-relaxed">
            Didirikan sejak tahun 2004, Masakan Padang ID memegang teguh kaidah memasak Minang otentik tanpa jalan pintas. Rasa kebanggaan nusantara dihadirkan melalui bahan murni tanpa pengawet buatan.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition duration-200 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#a61c1c] mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-[#19120e] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#5c4e43] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quotation Box: Clean White with Subtle Warm Minang Blend */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-white via-[#fffdfa] to-[#faf5ee] border-l-4 border-l-[#a61c1c] border border-stone-200/90 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-bold uppercase tracking-wider text-[#a61c1c]">
              <Sparkles className="w-3.5 h-3.5 text-[#b47a16]" />
              <span>Komitmen Mutu Nasional</span>
            </div>
            <p className="font-serif text-lg sm:text-xl italic text-slate-800 leading-relaxed font-semibold">
              "Bagi kami, memasak rendang bukan sekadar urusan dapur, melainkan menjaga marwah dan kebanggaan cita rasa Minangkabau agar tetap luhur di panggung nasional."
            </p>
            <div className="text-xs text-slate-500 font-medium">
              — Tim Pengolah Dapur Sentral Masakan Padang ID Sejak 2004
            </div>
          </div>

          <a
            href="#menu"
            className="px-6 py-3.5 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl shrink-0 transition shadow-sm hover:shadow flex items-center gap-2 group cursor-pointer"
          >
            <span>Buktikan Kelezatannya</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </a>
        </div>

      </div>
    </section>
  );
}
