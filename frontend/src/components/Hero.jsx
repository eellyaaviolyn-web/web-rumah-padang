import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const bgImageRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Entrance sequence
    tl.from('.gsap-hero-heading', { y: 30, opacity: 0, duration: 0.8 })
      .from('.gsap-hero-body', { y: 20, opacity: 0, duration: 0.6 }, '-=0.45');

    // Subtle Parallax on Background Image when scrolling
    if (bgImageRef.current) {
      gsap.to(bgImageRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }, { scope: containerRef });

  return (
    <div id="beranda" className="relative">
      {/* HERO SECTION WITH RUMAH GADANG BACKGROUND */}
      <section
        ref={containerRef}
        className="relative min-h-[75dvh] sm:min-h-[85vh] flex items-center justify-center text-center px-4 sm:px-8 md:px-12 py-16 sm:py-28 md:py-32 overflow-hidden"
      >
        {/* Rumah Gadang Background with Parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            ref={bgImageRef}
            src="/hero-rumah-gadang-hd.jpg"
            alt="Rumah Gadang Minangkabau"
            className="w-full h-[125%] object-cover object-center scale-105 transform -translate-y-[5%]"
          />
          {/* Cinematic Dark Luxury Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90" />
          <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-black/25 to-black/80" />
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Big Editorial Heading */}
          <h1 className="gsap-hero-heading font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-normal text-white leading-[1.12] sm:leading-[1.08] tracking-tight drop-shadow-xl max-w-4xl break-words">
            Warisan Cita Rasa Minang, <br />
            <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#ffe8b3] via-[#f5d796] to-[#caa268] drop-shadow-md">
              Dihidangkan dengan Kemewahan Tradisi.
            </span>
          </h1>

          {/* Lead Body Paragraph */}
          <p className="gsap-hero-body text-stone-200/90 text-xs sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mt-4 sm:mt-6 font-normal drop-shadow">
            Menghadirkan keaslian kuliner Minangkabau tanpa kompromi. Daging sapi pilihan direduksi perlahan selama 8 jam bersama 16 racikan rempah Bukittinggi dan santan kelapa tua murni, menghadirkan aroma karamelisasi gurih nan legendaris.
          </p>

          {/* Responsive Mobile CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 sm:mt-8 w-full sm:w-auto px-4 sm:px-0">
            <a
              href="#menu"
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#b59261] to-[#997746] hover:from-[#c59e6c] hover:to-[#a9844f] text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Jelajahi Menu Porsi</span>
            </a>
            <a
              href="#nasibox"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-full font-semibold text-xs uppercase tracking-widest backdrop-blur-xs transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Paket Nasi Kotak</span>
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}


