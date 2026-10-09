import React, { useState } from 'react';
import { X, QrCode, CreditCard, Wallet, Banknote, Copy, Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function PaymentMethodsModal({ isOpen, onClose, onOpenTray }) {
  const [copiedAccount, setCopiedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('qris'); // 'qris', 'transfer', 'ewallet', 'cod'

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(key);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const bankAccounts = [
    {
      bank: 'Bank Central Asia (BCA)',
      code: 'BCA',
      noRek: '883012345678',
      nama: 'PT MASAKAN PADANG ID',
      badge: 'Verifikasi Otomatis',
      color: 'from-blue-600 to-blue-800'
    },
    {
      bank: 'Bank Mandiri',
      code: 'MANDIRI',
      noRek: '1370098765432',
      nama: 'PT MASAKAN PADANG ID',
      badge: 'Virtual Account & Transfer',
      color: 'from-amber-600 to-amber-800'
    },
    {
      bank: 'Bank Rakyat Indonesia (BRI)',
      code: 'BRI',
      noRek: '012301001234538',
      nama: 'PT MASAKAN PADANG ID',
      badge: 'BRImo & ATM Seluruh RI',
      color: 'from-sky-700 to-sky-900'
    }
  ];

  const ewallets = [
    { nama: 'GoPay', no: '0851-4741-3866', desc: 'Scan QRIS atau Transfer No. HP Kasir' },
    { nama: 'OVO', no: '0851-4741-3866', desc: 'Instant Topup & Pembayaran Kasir' },
    { nama: 'ShopeePay', no: '0851-4741-3866', desc: 'Mendukung QRIS Cashback & SPayLater' },
    { nama: 'DANA', no: '0851-4741-3866', desc: 'Bebas Biaya Transfer Antar Dompet' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#120d0a] text-stone-100 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-white/15">
        
        {/* Header Modal */}
        <div className="bg-[#18100c] px-6 py-4.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#caa268]/20 border border-[#caa268]/40 flex items-center justify-center text-[#e5be82]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-white">Metode Pembayaran Resmi</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  100% Aman
                </span>
              </div>
              <p className="text-xs text-stone-400">Masakan Padang ID • Bebas Biaya Admin & Terverifikasi Otomatis</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-3 px-6 bg-[#0c0806] border-b border-white/10 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'qris', label: 'QRIS Nasional', icon: QrCode, badge: 'Paling Cepat' },
            { id: 'transfer', label: 'Transfer Bank', icon: CreditCard, count: '3 Bank' },
            { id: 'ewallet', label: 'E-Wallet', icon: Wallet, count: '4 Dompet' },
            { id: 'cod', label: 'Tunai & COD', icon: Banknote, badge: 'Di Tempat' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#b59261] text-white shadow-md'
                    : 'bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#caa268]/20 text-[#caa268]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: QRIS */}
          {activeTab === 'qris' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-gradient-to-br from-[#1c140f] to-[#251912] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6">
                
                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center shrink-0 w-48 text-slate-900 border-2 border-stone-300">
                  <div className="flex items-center justify-between w-full pb-2 mb-2 border-b border-stone-200">
                    <span className="font-extrabold text-sm tracking-tight">QRIS</span>
                    <span className="text-[9px] font-mono font-bold text-red-600 uppercase">GPN</span>
                  </div>

                  {/* QRIS Graphic / Code */}
                  <div className="w-36 h-36 bg-white p-1 rounded-xl flex items-center justify-center relative border border-stone-200">
                    <img
                      src="/qris.png"
                      alt="QRIS Resmi Masakan Padang ID"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-center pt-2.5">
                    <div className="font-bold text-[11px] text-slate-800 leading-tight">NMID: ID102008472911</div>
                    <div className="text-[10px] text-slate-500 font-semibold">MASAKAN PADANG ID</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3.5 flex-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#caa268] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#e5be82]" /> Rekomendasi Kasir
                    </span>
                    <h4 className="font-serif font-bold text-lg text-white mt-0.5">
                      QRIS Standar Pembayaran Nasional
                    </h4>
                    <p className="text-stone-300 text-xs mt-1 leading-relaxed">
                      Dapat dipindai langsung dari <strong>seluruh aplikasi mobile banking dan e-wallet Indonesia</strong> tanpa biaya admin tambahan (Rp 0).
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <div className="flex items-start gap-2.5 text-stone-300">
                      <span className="w-5 h-5 rounded-full bg-[#b59261]/30 text-[#e5be82] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                      <span>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, ShopeePay, DANA).</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-stone-300">
                      <span className="w-5 h-5 rounded-full bg-[#b59261]/30 text-[#e5be82] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                      <span>Pilih menu <strong>Scan QRIS</strong> dan arahkan kamera ke kode QR di atas atau kode QR nota pesanan.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-stone-300">
                      <span className="w-5 h-5 rounded-full bg-[#b59261]/30 text-[#e5be82] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                      <span>Periksa nama penerima <strong>MASAKAN PADANG ID</strong> dan konfirmasi nominal pembayaran.</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Verified Badges Strip */}
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-stone-400">
                <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Status: Terhubung Gerbang Pembayaran Nasional (GPN)
                </span>
                <span className="font-mono text-[11px]">Konfirmasi Instan 24 Jam</span>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSFER BANK */}
          {activeTab === 'transfer' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-stone-300 text-xs leading-relaxed">
                Silakan lakukan transfer ke salah satu nomor rekening resmi di bawah ini. Anda dapat menyalin nomor rekening dengan sekali klik.
              </div>

              <div className="space-y-3">
                {bankAccounts.map((b, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gradient-to-r from-[#1c140f] to-[#231913] rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#b59261]/50 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white">{b.bank}</span>
                        <span className="text-[10px] text-[#caa268] bg-[#caa268]/15 px-2 py-0.5 rounded-full font-medium">
                          {b.badge}
                        </span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#e5be82] tracking-wider mt-0.5">
                        {b.noRek}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Atas Nama: <strong className="text-stone-200">{b.nama}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(b.noRek, b.code)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                        copiedAccount === b.code
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                      }`}
                    >
                      {copiedAccount === b.code ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Rekening</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl text-amber-200/90 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e5be82] shrink-0" />
                <span>Setelah transfer, kirimkan bukti transfer via WhatsApp ke Kasir kami untuk cetak struk nota langsung.</span>
              </div>
            </div>
          )}

          {/* TAB 3: E-WALLET */}
          {activeTab === 'ewallet' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-stone-300 text-xs">
                Mendukung transfer instan dan scan QRIS dari semua dompet digital terpopuler di Indonesia:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ewallets.map((ew, i) => (
                  <div key={i} className="p-4 bg-[#1a130e] rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{ew.nama}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-900/60 font-semibold">
                        Online
                      </span>
                    </div>
                    <div className="font-mono text-sm font-bold text-[#e5be82]">
                      {ew.no}
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {ew.desc}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopy(ew.no.replace(/-/g, ''), ew.nama)}
                      className="w-full mt-2 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-stone-200 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedAccount === ew.nama ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Nomor Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Nomor {ew.nama}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TUNAI & COD */}
          {activeTab === 'cod' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Dine-in & Kasir */}
                <div className="p-5 bg-[#1b140f] rounded-2xl border border-white/10 space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/60 text-[#e5be82] border border-amber-800/60 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Tunai di Kasir (Dine-in / Takeaway)</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Pembayaran langsung di meja kasir outlet dengan uang tunai pecahan rupiah resmi. Kasir akan segera mencetak nota fisik struk pembayaran dari sistem database kami.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                    ✓ Kembalian tepat & cetak struk nota instan
                  </div>
                </div>

                {/* COD Nasi Kotak */}
                <div className="p-5 bg-[#1b140f] rounded-2xl border border-white/10 space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">COD / Bayar Saat Tiba (Nasi Kotak)</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Untuk pemesanan nasi kotak acara atau rapat kantor, Anda dapat membayar tunai langsung kepada kurir pengantar saat pesanan diterima dalam kondisi hangat dan tersegel rapi.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                    ✓ Kwitansi & invoice resmi disertakan
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#18100c] px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-stone-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Semua transaksi otomatis tercatat di sistem pembukuan kasir.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-stone-300 hover:text-white rounded-full font-semibold text-xs transition cursor-pointer"
            >
              Tutup
            </button>

            {onOpenTray && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTray();
                }}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#b59261] hover:bg-[#a07f50] text-white rounded-full font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Keranjang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
