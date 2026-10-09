import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('id-ID');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#d6cbbe] flex flex-col max-h-[95vh]">
        
        {/* Modal Top Bar (not printed) */}
        <div className="bg-[#18100c] text-white p-3.5 px-5 flex items-center justify-between border-b border-[#3b271d] print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#c59837]" />
            <span className="font-semibold text-xs tracking-wide">Pratinjau Struk Kasir / Nota Dapur</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-[#a61c1c] hover:bg-[#881414] text-white rounded text-xs font-bold transition flex items-center gap-1 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Nota</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#918175] hover:text-white rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div className="p-6 overflow-y-auto bg-[#faf8f5] flex justify-center">
          <div className="w-full max-w-[340px] bg-white p-6 shadow-sm border border-[#e5decb] font-mono text-[11px] text-[#221711] leading-relaxed select-text">
            
            {/* Header */}
            <div className="text-center space-y-1 mb-4">
              <img src="/logo-icon.png" alt="Logo" className="w-9 h-9 object-contain mx-auto mb-1.5" />
              <div className="font-bold text-sm tracking-wider uppercase font-sans text-[#18100c]">
                MASAKAN PADANG ID
              </div>
              <div className="text-[10px] text-[#5c4e43]">
                Rumah Makan Khas Padang
              </div>
              <div className="text-[10px] text-[#7d6c5e]">
                Jl. Pintu Air Raya No. 18, Pasar Baru
              </div>
              <div className="text-[10px] text-[#7d6c5e]">
                Telp / WA: +62 851-4741-3866
              </div>
            </div>

            <div className="border-t border-dashed border-[#8c7a6b] my-3" />

            {/* Meta Order Info */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>No. Pesanan:</span>
                <span className="font-bold text-[#a61c1c]">{order.nomor_pesanan}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu Transaksi:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir / Dapur:</span>
                <span>Kasir 01 (POS Utama)</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold">{order.nama_pelanggan}</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp:</span>
                <span>{order.nomor_wa}</span>
              </div>
              <div className="flex justify-between">
                <span>Layanan:</span>
                <span>{order.tipe_layanan}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#8c7a6b] my-3" />

            {/* Items Table */}
            <div className="space-y-2 mb-3">
              <div className="font-bold text-[10px] text-[#5c4e43] uppercase pb-1 border-b border-dotted border-[#baa998] flex justify-between">
                <span>Menu & Kuantitas</span>
                <span>Subtotal</span>
              </div>

              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="pr-2">
                    <div className="font-semibold">{item.nama}</div>
                    <div className="text-[10px] text-[#7d6c5e]">
                      {item.jumlah} x Rp {item.harga ? item.harga.toLocaleString('id-ID') : (item.harga_satuan ? item.harga_satuan.toLocaleString('id-ID') : '0')}
                    </div>
                  </div>
                  <div className="font-bold shrink-0">
                    Rp {(item.subtotal || item.harga * item.jumlah).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-[#8c7a6b] my-3" />

            {/* Totals */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-sm text-[#18100c] pt-1">
                <span>TOTAL AKHIR:</span>
                <span className="text-[#a61c1c]">Rp {order.total_harga.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#7d6c5e]">
                <span>Status Pesanan:</span>
                <span className="font-bold text-emerald-700">{order.status}</span>
              </div>
              {order.catatan && order.catatan !== '-' && (
                <div className="text-[10px] text-[#7d6c5e] pt-1">
                  Catatan: <em>{order.catatan}</em>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-[#8c7a6b] my-4" />

            {/* Footer Nota */}
            <div className="text-center space-y-1 text-[10px] text-[#5c4e43]">
              <div className="font-semibold text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Halal MUI ID32110000492810</span>
              </div>
              <div>Terima kasih atas pesanan Anda.</div>
              <div className="text-[9px] text-[#8c7a6b]">
                Harum Rempah Alami Minangkabau Tanpa Pengawet
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
