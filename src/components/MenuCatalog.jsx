import React, { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Flame, Plus, Check, Filter } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function MenuCatalog({ menuItems, onAddToTray, loading }) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedAnimationId, setAddedAnimationId] = useState(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  const categories = ['Semua', 'Daging', 'Ayam', 'Ikan & Laut', 'Sayuran', 'Pelengkap', 'Minuman'];

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'Semua' || item.kategori === activeCategory;
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (item) => {
    onAddToTray(item);
    setAddedAnimationId(item.id);
    setTimeout(() => setAddedAnimationId(null), 1000);
  };

  // Section header entrance
  useGSAP(() => {
    gsap.from('.gsap-menu-header', {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: {
        trigger: '.gsap-menu-header',
        start: 'top 88%',
        once: true,
      },
    });

    gsap.from('.gsap-cat-tabs', {
      y: 20, opacity: 0, duration: 0.55, ease: 'power2.out',
      scrollTrigger: {
        trigger: '.gsap-cat-tabs',
        start: 'top 88%',
        once: true,
      },
    });
  }, { scope: containerRef });

  // Re-render ensures all cards stay 100% visible without opacity bugs
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.gsap-menu-card');
    gsap.killTweensOf(cards);
    gsap.set(cards, { clearProps: 'all', opacity: 1 });
  }, [activeCategory, searchQuery, filteredItems.length]);

  return (
    <section ref={containerRef} id="menu" className="py-16 md:py-24 px-4 sm:px-8 bg-white border-b border-[#eee5d8]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="gsap-menu-header flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#a61c1c] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a61c1c]" />
              Katalog Hidangan Harian Resmi
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19120e]">
              Daftar Menu & Harga Porsi Terkalibrasi
            </h2>
            <p className="text-xs sm:text-sm text-[#7d7065] mt-1">
              Data terhubung langsung ke Sistem Database MySQL Resto. Standar mutu higienis, porsi tepat, tanpa biaya tersembunyi.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#918175] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari lauk (contoh: Rendang, Pop)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#fbf9f5] border border-[#e8ded2] rounded-xl text-xs text-[#19120e] focus:outline-none focus:border-[#a61c1c] focus:ring-1 focus:ring-[#a61c1c] transition"
            />
          </div>
        </div>

        {/* Category Tabs (Reflow Smooth Touch Horizontal Scroll on Mobile) */}
        <div className="gsap-cat-tabs flex items-center gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none touch-pan-x">
          <span className="text-xs font-bold text-[#918175] mr-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer min-h-[40px] active:scale-95 ${
                activeCategory === cat
                  ? 'bg-[#a61c1c] text-white shadow-md shadow-red-900/20'
                  : 'bg-[#fbf9f5] text-[#5c4e43] border border-[#e8ded2] hover:bg-[#f4efe6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#918175]">
            <div className="w-8 h-8 border-2 border-[#a61c1c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Menyinkronkan daftar hidangan dari server resto...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-[#fbf9f5] rounded-2xl border border-[#eee5d8] p-8">
            <Search className="w-8 h-8 text-[#a61c1c] mx-auto mb-2 opacity-80" />
            <div className="text-sm font-bold text-[#19120e]">Tidak ada hidangan yang cocok</div>
            <p className="text-xs text-[#7d7065] mt-1">Coba kata kunci pencarian lain atau pilih kategori Semua.</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => {
              const isAdded = addedAnimationId === item.id;
              const isOutOfStock = item.stok_status === 'Habis';
              return (
                <div
                  key={item.id}
                  className="gsap-menu-card bg-[#fcfbf9] border border-[#e8ded2] rounded-2xl p-5 hover:border-[#a61c1c] hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Visual Culinary Image Card */}
                    <div className="h-44 rounded-xl overflow-hidden mb-4 relative border border-[#e8dfd3] bg-[#f7f3ec] group-hover:shadow-md transition">
                      <img
                        src={item.image_url || '/images/menu/rendang.jpg'}
                        alt={item.nama}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/menu/rendang.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {item.badge && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#a61c1c] text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow">
                          {item.badge}
                        </span>
                      )}

                      {item.is_spicy === 1 && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-red-300 text-[10px] font-bold rounded-md flex items-center gap-1 border border-red-500/30">
                          <Flame className="w-3 h-3 text-red-400" /> Pedas
                        </span>
                      )}

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow">
                            Habis Hari Ini
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#918175] mb-1">
                      {item.kategori}
                    </div>
                    <h3 className="font-bold text-base text-[#19120e] leading-snug group-hover:text-[#a61c1c] transition">
                      {item.nama}
                    </h3>
                    <p className="text-xs text-[#5c4e43] mt-2 line-clamp-2 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 mt-4 border-t border-[#eee5d8] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#918175] uppercase">Harga / Porsi</div>
                      <div className="text-base font-bold text-[#19120e]">
                        Rp {item.harga.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdd(item)}
                      className={`px-3.5 py-2.5 min-h-[42px] min-w-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#18100c] text-white hover:bg-[#a61c1c]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Masuk!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Nampan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
