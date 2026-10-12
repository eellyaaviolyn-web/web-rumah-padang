import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function FloatingCartBar({ trayItems = [], onOpenTray }) {
  if (!trayItems || trayItems.length === 0) return null;

  const totalQty = trayItems.reduce((acc, item) => acc + (item.jumlah || 1), 0);
  const totalPrice = trayItems.reduce((acc, item) => acc + (item.harga * (item.jumlah || 1)), 0);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg animate-bounce-in">
      <div 
        onClick={onOpenTray}
        className="bg-[#18100c] text-white border-2 border-[#c59837] rounded-2xl shadow-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#221712] transition transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {/* Left: Tray Icon & Count */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-[#a61c1c] text-white rounded-xl flex items-center justify-center shadow shrink-0">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#c59837] text-[#19120e] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#18100c]">
              {totalQty}
            </span>
          </div>

          <div>
            <div className="text-[11px] text-[#f5d796] font-semibold uppercase tracking-wider">
              Keranjang ({totalQty} Porsi)
            </div>
            <div className="font-serif font-black text-base text-white leading-none mt-0.5">
              Rp {totalPrice.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Right: Checkout CTA */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTray();
            }}
            className="bg-gradient-to-r from-[#a61c1c] to-[#871414] hover:from-[#ba2222] hover:to-[#9c1818] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
