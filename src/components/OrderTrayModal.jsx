import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, Plus, Minus, Send, CheckCircle2, AlertCircle, 
  ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, 
  QrCode, Banknote, Wallet, Copy, Check, Sparkles, Clock, Timer, 
  CheckCheck, RotateCcw, AlertTriangle, ExternalLink 
} from 'lucide-react';

export default function OrderTrayModal({ 
  isOpen, 
  onClose, 
  trayItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearTray 
}) {
  // Step navigation: 'cart' (Lihat Keranjang) -> 'checkout' (Isi Data & Bayar) -> 'success' (Selesai/Bayar)
  const [step, setStep] = useState('cart');
  
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [serviceType, setServiceType] = useState('Nasi Kotak / Pesan Antar');
  const [paymentMethod, setPaymentMethod] = useState('QRIS Dinamis'); // 'QRIS Dinamis' | 'Transfer Bank BCA' | 'Transfer Bank Mandiri' | 'Tunai / COD di Tempat'
  const [notes, setNotes] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedTotal, setCopiedTotal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Status Pembayaran & Hitung Mundur 10 Menit (600 Detik)
  const [paymentStatus, setPaymentStatus] = useState('waiting'); // 'waiting' | 'paid' | 'expired'
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(600); // 10 menit = 600 detik

  // Reset step & timer when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('cart');
        setOrderSuccess(null);
        setErrorMessage('');
        setPaymentStatus('waiting');
        setPaymentTimeLeft(600);
      }, 300);
    }
  }, [isOpen]);

  // Hitung Mundur Timer 10 Menit saat status menunggu pembayaran
  useEffect(() => {
    let timer = null;
    if (step === 'success' && paymentStatus === 'waiting' && paymentTimeLeft > 0) {
      timer = setInterval(() => {
        setPaymentTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPaymentStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, paymentStatus, paymentTimeLeft]);

  // Suara konfirmasi sukses otomatis (Web Audio API)
  const playSuccessSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio playback fails gracefully if muted
    }
  };

  // Konfirmasi pembayaran selesai (dipicu saat tombol ditekan atau foto QRIS diklik)
  const handleConfirmPaid = async () => {
    playSuccessSound();
    setPaymentStatus('paid');

    if (orderSuccess && orderSuccess.nomor_pesanan) {
      try {
        await fetch(`/api/pesanan/${orderSuccess.nomor_pesanan}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Dibayar' })
        });
      } catch (err) {
        console.error('Gagal memperbarui status pesanan:', err);
      }
    }
  };



  // Deteksi Scan REAL-TIME dari HP (TANPA TIMER DETIK, HANYA SAAT HP BENAR-BENAR MASUK KE SCAN)
  useEffect(() => {
    let pollInterval = null;
    let eventSource = null;

    if (step === 'success' && paymentStatus === 'waiting' && orderSuccess && orderSuccess.nomor_pesanan) {
      const orderNumber = orderSuccess.nomor_pesanan;

      // 1. Polling backend setiap 600ms (mengecek status pesanan saat HP membuka link scan)
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/pesanan/track/${orderNumber}`);
          if (res.ok) {
            const json = await res.json();
            if (json && json.data && (json.data.status === 'Dibayar' || json.data.status === 'Diproses')) {
              playSuccessSound();
              setPaymentStatus('paid');
            }
          }
        } catch (err) {
          // ignore error
        }
      }, 600);

      // 2. Cloud SSE listener untuk deteksi kilat (< 100ms) saat HP memindai
      try {
        eventSource = new EventSource(`https://ntfy.sh/padang_order_${orderNumber}/sse`);
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && (data.event === 'message' || data.message === 'paid' || data.status === 'Dibayar')) {
              playSuccessSound();
              setPaymentStatus('paid');
            }
          } catch (e) {
            playSuccessSound();
            setPaymentStatus('paid');
          }
        };
      } catch (err) {
        // SSE optional
      }
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (eventSource) eventSource.close();
    };
  }, [step, paymentStatus, orderSuccess]);

  if (!isOpen) return null;

  const totalQty = trayItems.reduce((acc, item) => acc + (item.jumlah || 1), 0);
  const totalHarga = trayItems.reduce((acc, item) => acc + (item.harga * (item.jumlah || 1)), 0);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleCopyTotal = (amount) => {
    navigator.clipboard.writeText(amount.toString());
    setCopiedTotal(true);
    setTimeout(() => setCopiedTotal(false), 2000);
  };

  const handleProceedToCheckout = () => {
    if (trayItems.length === 0) return;
    setErrorMessage('');
    setStep('checkout');
  };

  const getPaidWhatsappUrl = () => {
    if (!orderSuccess) return '#';
    const cleanPhone = '6285147413866';
    const total = Number(orderSuccess.total_harga || totalHarga).toLocaleString('id-ID');
    const text = 
      `*KONFIRMASI PEMBAYARAN - MASAKAN PADANG ID*\n` +
      `--------------------------------\n` +
      `No. Pesanan: ${orderSuccess.nomor_pesanan}\n` +
      `Nama: ${customerName || orderSuccess.nama_pelanggan || '-'}\n` +
      `Layanan: ${serviceType}\n` +
      `Metode: ${paymentMethod}\n` +
      `Total: Rp ${total}\n` +
      `Status: SUDAH DIBAYAR (LUNAS) ✓\n` +
      `--------------------------------\n` +
      `Halo Kasir, saya sudah menyelesaikan pembayaran via ${paymentMethod} sebesar Rp ${total}. Mohon segera diverifikasi dan diproses di dapur ya. Terima kasih!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !whatsappNumber.trim()) {
      setErrorMessage('Harap isi Nama Lengkap dan Nomor WhatsApp aktif Anda.');
      return;
    }

    if (trayItems.length === 0) {
      setErrorMessage('Keranjang belanja Anda masih kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_pelanggan: customerName,
          nomor_wa: whatsappNumber,
          tipe_layanan: serviceType,
          catatan: notes ? `${notes} [Metode Bayar: ${paymentMethod}]` : `[Metode Bayar: ${paymentMethod}]`,
          items: trayItems
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan pesanan');
      }

      setOrderSuccess(result.data);
      setPaymentStatus('waiting');
      setPaymentTimeLeft(600); // 10 menit
      setStep('success');
      onClearTray();

      // PENTING: JANGAN langsung buka WhatsApp!
      // Pembeli melihat QRIS dan timer 10 menit terlebih dahulu,
      // sistem otomatis mendeteksi scan QRIS tanpa tombol "Saya Sudah Bayar".

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Koneksi ke backend gagal. Pastikan server aktif.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modern Shopee / TikTok Style Slide-Over Drawer */}
      <div className="relative w-full sm:max-w-md md:max-w-lg h-full bg-[#fcfbf9] text-[#19120e] shadow-2xl flex flex-col z-10 border-l border-stone-200">
        
        <style>{`
          @keyframes scanBeam {
            0% { top: 6%; opacity: 0.3; }
            50% { top: 88%; opacity: 1; }
            100% { top: 6%; opacity: 0.3; }
          }
          .animate-scan-beam {
            animation: scanBeam 2.2s ease-in-out infinite;
          }
        `}</style>

        {/* ================= HEADER ================= */}
        <header className="bg-[#120d0a] text-white px-5 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="p-1 -ml-1 text-stone-400 hover:text-white rounded-lg transition cursor-pointer"
                aria-label="Kembali ke Keranjang"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="w-8 h-8 rounded-lg bg-[#b59261]/20 border border-[#b59261]/40 flex items-center justify-center text-[#e5be82]">
              <ShoppingBag className="w-4 h-4" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-white leading-tight">
                {step === 'cart' && `Keranjang Belanja (${totalQty})`}
                {step === 'checkout' && 'Checkout & Pembayaran'}
                {step === 'success' && (
                  paymentStatus === 'paid'
                    ? 'Pesanan Berhasil!'
                    : paymentStatus === 'expired'
                    ? 'Waktu Pembayaran Habis'
                    : 'Menunggu Pembayaran'
                )}
              </h3>
              <p className="text-[11px] text-[#caa268]">
                {step === 'cart' && 'Masakan Padang ID • Otentik & Higienis'}
                {step === 'checkout' && 'Lengkapi data & pilih cara bayar'}
                {step === 'success' && (
                  paymentStatus === 'paid'
                    ? 'Pembayaran berhasil dikonfirmasi'
                    : paymentStatus === 'expired'
                    ? 'Batas waktu 10 menit berakhir'
                    : `Selesaikan bayar: ${formatCountdown(paymentTimeLeft)}`
                )}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Stepper Indicator (Shopee / TikTok Style) */}
        <div className="bg-[#18110d] px-5 py-2.5 border-b border-white/5 flex items-center justify-between text-[11px] font-semibold text-stone-400 shrink-0">
          <div className={`flex items-center gap-1.5 ${step === 'cart' ? 'text-[#e5be82]' : 'text-stone-300'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'cart' ? 'bg-[#b59261] text-white' : 'bg-emerald-600 text-white'
            }`}>
              {step === 'cart' ? '1' : '✓'}
            </span>
            <span>Keranjang</span>
          </div>

          <div className="h-0.5 w-8 bg-stone-700" />

          <div className={`flex items-center gap-1.5 ${step === 'checkout' ? 'text-[#e5be82]' : step === 'success' ? 'text-stone-300' : 'text-stone-500'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'checkout' ? 'bg-[#b59261] text-white' : step === 'success' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
            }`}>
              {step === 'success' ? '✓' : '2'}
            </span>
            <span>Checkout</span>
          </div>

          <div className="h-0.5 w-8 bg-stone-700" />

          <div className={`flex items-center gap-1.5 ${step === 'success' ? 'text-[#e5be82]' : 'text-stone-500'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 'success' && paymentStatus === 'paid'
                ? 'bg-emerald-600 text-white'
                : step === 'success' && paymentStatus === 'expired'
                ? 'bg-red-600 text-white'
                : step === 'success'
                ? 'bg-[#b59261] text-white animate-pulse'
                : 'bg-stone-800 text-stone-400'
            }`}>
              {paymentStatus === 'paid' ? '✓' : paymentStatus === 'expired' ? '!' : '3'}
            </span>
            <span>{paymentStatus === 'paid' ? 'Selesai' : paymentStatus === 'expired' ? 'Kedaluwarsa' : 'Bayar'}</span>
          </div>
        </div>

        {/* ================= BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* STEP 1: KERANJANG (CART) */}
          {step === 'cart' && (
            <div className="space-y-4">
              
              {/* Promo Banner ala Shopee / TikTok */}
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-[#a61c1c] shrink-0" />
                <div className="leading-tight">
                  <span className="font-bold">Gratis Biaya Pengemasan & Sendok</span>
                  <p className="text-[11px] text-amber-700">Setiap pesanan dijamin higienis food-grade.</p>
                </div>
              </div>

              {/* Items List */}
              {trayItems.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                    <ShoppingBag className="w-8 h-8 opacity-60" />
                  </div>
                  <h4 className="font-bold text-sm text-stone-800">Keranjang Belanja Kosong</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Yuk tambahkan hidangan Minang favorit Anda dari menu atau paket nasi kotak!
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 px-6 py-2.5 bg-[#a61c1c] text-white text-xs font-bold rounded-xl shadow hover:bg-[#881414] transition cursor-pointer"
                  >
                    Jelajahi Menu Makanan ➔
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
                    <span>Daftar Hidangan ({trayItems.length} Jenis)</span>
                    <button
                      type="button"
                      onClick={onClearTray}
                      className="text-red-600 hover:text-red-700 hover:underline text-[11px] cursor-pointer"
                    >
                      Kosongkan Semua
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {trayItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white border border-stone-200/90 rounded-2xl shadow-2xs flex items-center gap-3 group hover:border-[#a61c1c]/40 transition"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          <img
                            src={item.image_url || '/images/menu/rendang.jpg'}
                            alt={item.nama}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/menu/rendang.jpg';
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title & Price */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {item.nama}
                          </h4>
                          <div className="text-xs font-bold text-[#a61c1c] mt-0.5">
                            Rp {(item.harga * (item.jumlah || 1)).toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            @ Rp {item.harga.toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Quantity Counter (Shopee / TikTok style) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, (item.jumlah || 1) - 1)}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition cursor-pointer active:scale-95"
                            aria-label="Kurangi"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="font-bold text-xs w-6 text-center text-stone-900 font-mono">
                            {item.jumlah || 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, (item.jumlah || 1) + 1)}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition cursor-pointer active:scale-95"
                            aria-label="Tambah"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 transition ml-1 cursor-pointer"
                            title="Hapus menu ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 2: CHECKOUT (PENGISIAN DATA & PEMILIHAN PEMBAYARAN) */}
          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Informasi Kontak Pembeli */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-2xs">
                <div className="font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <span>1. Kontak & Pengiriman</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Nama Lengkap Pemesan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian Pratama"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#a61c1c] text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 0812-3456-7890"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#a61c1c] text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tipe Layanan / Pengantaran
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#a61c1c] text-stone-900 font-medium"
                    >
                      <option value="Nasi Kotak / Pesan Antar">Nasi Kotak / Pesan Antar ke Alamat Kantor/Rumah</option>
                      <option value="Bungkus Sendiri (Takeaway)">Bungkus Bawa Pulang (Ambil di Outlet)</option>
                      <option value="Makan di Tempat (Dine-in)">Makan di Tempat (Reservasi Meja)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Catatan Dapur (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Sambal ijo dipisah, kuah gulai dibanyakin"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#a61c1c] text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Pemilihan Metode Pembayaran (Shopee / TikTok Card Selector) */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-800">
                    2. Pilih Metode Pembayaran
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Bebas Biaya Admin
                  </span>
                </div>

                {/* Cards Options */}
                <div className="space-y-2">
                  
                  {/* Option: QRIS */}
                  <label
                    onClick={() => setPaymentMethod('QRIS Dinamis')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      paymentMethod.includes('QRIS')
                        ? 'border-[#a61c1c] bg-red-50/50 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-[#a61c1c] flex items-center justify-center font-bold text-xs">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                          <span>QRIS Nasional (Semua Bank & E-Wallet)</span>
                          <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">REKOMENDASI</span>
                        </div>
                        <p className="text-[11px] text-stone-500">BCA, Mandiri, BRI, GoPay, ShopeePay, DANA</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod.includes('QRIS')}
                      onChange={() => setPaymentMethod('QRIS Dinamis')}
                      className="accent-[#a61c1c]"
                    />
                  </label>

                  {/* Option: Transfer Bank BCA */}
                  <label
                    onClick={() => setPaymentMethod('Transfer Bank BCA')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      paymentMethod === 'Transfer Bank BCA'
                        ? 'border-[#a61c1c] bg-red-50/50 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        BCA
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900">Transfer Bank BCA</div>
                        <p className="text-[11px] text-stone-500 font-mono">No. Rek: 8830-1234-5678</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'Transfer Bank BCA'}
                      onChange={() => setPaymentMethod('Transfer Bank BCA')}
                      className="accent-[#a61c1c]"
                    />
                  </label>

                  {/* Option: Transfer Bank Mandiri */}
                  <label
                    onClick={() => setPaymentMethod('Transfer Bank Mandiri')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      paymentMethod === 'Transfer Bank Mandiri'
                        ? 'border-[#a61c1c] bg-red-50/50 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        MDR
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900">Transfer Bank Mandiri</div>
                        <p className="text-[11px] text-stone-500 font-mono">No. Rek: 137-00-9876543-2</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'Transfer Bank Mandiri'}
                      onChange={() => setPaymentMethod('Transfer Bank Mandiri')}
                      className="accent-[#a61c1c]"
                    />
                  </label>

                  {/* Option: Tunai / COD */}
                  <label
                    onClick={() => setPaymentMethod('Tunai / COD di Tempat')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      paymentMethod.includes('COD') || paymentMethod.includes('Tunai')
                        ? 'border-[#a61c1c] bg-red-50/50 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900">Tunai / Bayar di Tempat (COD)</div>
                        <p className="text-[11px] text-stone-500">Bayar ke kurir saat pesanan sampai atau di kasir</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod.includes('COD') || paymentMethod.includes('Tunai')}
                      onChange={() => setPaymentMethod('Tunai / COD di Tempat')}
                      className="accent-[#a61c1c]"
                    />
                  </label>

                </div>

                {/* Dynamic QRIS Box (Jika memilih QRIS) */}
                {paymentMethod.includes('QRIS') && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-xl flex flex-col sm:flex-row items-center gap-3.5 animate-fadeIn">
                    <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm shrink-0 flex flex-col items-center">
                      <img
                        src="/qris.png"
                        alt="QRIS Resmi Masakan Padang ID"
                        className="w-28 h-28 object-contain"
                      />
                      <span className="text-[9px] font-bold text-stone-700 tracking-wider mt-1">QRIS RESMI</span>
                    </div>

                    <div className="space-y-1 text-center sm:text-left flex-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#a61c1c] bg-red-100 px-2 py-0.5 rounded">
                        ⚡ Scan Sekarang / Nanti
                      </span>
                      <div className="font-bold text-stone-900 pt-0.5">
                        Total Bayar: <span className="text-[#a61c1c]">Rp {totalHarga.toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Anda dapat scan kode QR di atas sekarang atau setelah menekan tombol buat pesanan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Dynamic Bank Box (Jika memilih Transfer Bank) */}
                {paymentMethod.includes('Transfer Bank') && (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1 animate-fadeIn">
                    <div className="font-bold flex items-center justify-between">
                      <span>Rekening Tujuan Transfer:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(paymentMethod.includes('BCA') ? '883012345678' : '1370098765432')}
                        className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
                      >
                        {copiedBank ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBank ? 'Tersalin' : 'Salin Rekening'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-sm font-bold text-blue-950">
                      {paymentMethod.includes('BCA') ? '8830-1234-5678 (BCA)' : '137-00-9876543-2 (Mandiri)'}
                    </div>
                    <p className="text-[10px] text-blue-700">
                      Atas Nama: <strong>PT MASAKAN PADANG ID</strong>
                    </p>
                  </div>
                )}

              </div>

              {/* 3. Ringkasan Pembayaran Akhir */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-2 text-xs shadow-2xs">
                <div className="font-bold text-xs uppercase tracking-wider text-stone-800 mb-1">
                  Ringkasan Biaya
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Subtotal ({totalQty} Porsi):</span>
                  <span>Rp {totalHarga.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Biaya Pengemasan & Layanan:</span>
                  <span className="text-emerald-600 font-bold">GRATIS (Rp 0)</span>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between font-bold text-sm text-stone-900">
                  <span>Total Tagihan:</span>
                  <span className="text-base text-[#a61c1c]">Rp {totalHarga.toLocaleString('id-ID')}</span>
                </div>
              </div>

            </form>
          )}

          {/* STEP 3: SUCCESS / PEMBAYARAN (MENUNGGU BAYAR & TIMER 10 MENIT) */}
          {step === 'success' && orderSuccess && (
            <div className="py-2 space-y-4 text-center animate-fadeIn">
              
              {/* SUB-STATE 1: MENUNGGU PEMBAYARAN (TIMER 10 MENIT BERJALAN) */}
              {paymentStatus === 'waiting' && (
                <div className="space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 font-bold text-xs animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Status: Menunggu Pembayaran</span>
                    </div>

                    <h4 className="font-serif font-bold text-lg sm:text-xl text-stone-900 mt-2">
                      Selesaikan Pembayaran Anda
                    </h4>
                    <div className="mt-1 text-xs font-mono font-bold text-[#a61c1c] bg-red-50 border border-red-200 py-1 px-3 rounded-lg inline-block">
                      NO. PESANAN: {orderSuccess.nomor_pesanan}
                    </div>
                    <p className="text-xs text-stone-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Pesanan telah masuk ke antrean kasir. Harap selesaikan pembayaran dalam 10 menit sebelum diproses dapur.
                    </p>
                  </div>

                  {/* KOTAK COUNTDOWN TIMER 10 MENIT */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-xs max-w-sm mx-auto space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Timer className="w-4 h-4 text-amber-600" />
                        <span>Batas Waktu Pembayaran (10 Menit)</span>
                      </div>
                      <div className={`font-mono font-black text-xl tracking-wider ${
                        paymentTimeLeft <= 120 ? 'text-red-600 animate-pulse' : 'text-[#a61c1c]'
                      }`}>
                        {formatCountdown(paymentTimeLeft)}
                      </div>
                    </div>

                    {/* Progress Bar 10 Menit */}
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          paymentTimeLeft <= 120 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-[#a61c1c]'
                        }`}
                        style={{ width: `${Math.max(0, (paymentTimeLeft / 600) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>Waktu Tersedia: 10 Menit</span>
                      <span className={paymentTimeLeft <= 120 ? 'text-red-600 font-bold' : ''}>
                        {paymentTimeLeft <= 120 ? '⚠️ Waktu hampir habis!' : 'Jangan tutup halaman ini'}
                      </span>
                    </div>
                  </div>

                  {/* TAMPILAN KODE QRIS RESMI (JIKA METODE QRIS) */}
                  {paymentMethod.includes('QRIS') && (
                    <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 shadow-sm max-w-sm mx-auto space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-[#a61c1c]" />
                          <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                            KODE QRIS PEMBAYARAN RESMI
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                          Aktif 10 Mnt
                        </span>
                      </div>

                      {/* Kotak Foto QRIS Asli */}
                      <div 
                        onClick={handleConfirmPaid}
                        className="relative bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col items-center cursor-pointer group overflow-hidden shadow-xs hover:border-emerald-500 hover:shadow-md transition duration-200"
                        title="Klik di sini jika sudah memindai QRIS"
                      >
                        {/* Laser Scanner Line Effect */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_10px_#10b981] animate-scan-beam pointer-events-none z-10" />

                        <img
                          src="/qris.png"
                          alt="Foto QRIS Resmi Masakan Padang ID"
                          className="w-48 h-48 sm:w-52 sm:h-52 object-contain shadow-xs bg-white p-2 rounded-xl border border-stone-100 group-hover:scale-[1.02] transition-transform duration-200"
                        />
                        <div className="text-[11px] font-bold text-stone-700 tracking-wider mt-2.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>NMID: ID1020021155823 • QRIS Nasional</span>
                        </div>
                        <span className="text-[10px] text-stone-400 group-hover:text-emerald-700 mt-0.5 transition font-medium">
                          (Sentuh / klik gambar setelah scan)
                        </span>
                      </div>

                      {/* Total Tagihan */}
                      <div className="bg-red-50/80 p-2.5 rounded-xl border border-red-200 flex items-center justify-between text-left">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Tagihan:</span>
                          <span className="font-bold text-sm sm:text-base text-[#a61c1c]">
                            Rp {Number(orderSuccess.total_harga || totalHarga).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyTotal(orderSuccess.total_harga || totalHarga)}
                          className="text-[11px] bg-white border border-stone-300 hover:border-[#a61c1c] text-stone-700 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedTotal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                          <span>{copiedTotal ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>

                      {/* Tombol Konfirmasi Selesai */}
                      <button
                        type="button"
                        onClick={handleConfirmPaid}
                        className="w-full py-3.5 bg-[#a61c1c] hover:bg-[#881414] active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                        <span>Konfirmasi Pembayaran Selesai ➔</span>
                      </button>

                      <p className="text-[10px] text-stone-500 text-center font-medium">
                        BCA • Mandiri • BRI • GoPay • ShopeePay • DANA • OVO
                      </p>

                      {/* Petunjuk Singkat Pembayaran */}
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] text-stone-600 text-left space-y-1">
                        <div className="font-bold text-stone-800 text-[10px] uppercase">Cara Pembayaran:</div>
                        <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-stone-600">
                          <li>Buka m-Banking atau E-Wallet apa saja di HP Anda.</li>
                          <li>Arahkan kamera ke foto QRIS di atas untuk memindai nominal.</li>
                          <li>Setelah bayar, tekan tombol konfirmasi atau ketuk gambar QRIS.</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* TAMPILAN TRANSFER BANK (JIKA METODE TRANSFER BANK) */}
                  {paymentMethod.includes('Transfer Bank') && (
                    <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 shadow-sm max-w-sm mx-auto space-y-3 text-left">
                      <div className="font-bold text-xs uppercase tracking-wider text-stone-800">
                        Rekening Tujuan Transfer ({paymentMethod}):
                      </div>
                      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
                        <div className="font-bold text-xs text-blue-900 flex justify-between items-center">
                          <span>{paymentMethod.includes('BCA') ? 'Bank BCA' : 'Bank Mandiri'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(paymentMethod.includes('BCA') ? '883012345678' : '1370098765432')}
                            className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
                          >
                            {copiedBank ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedBank ? 'Tersalin' : 'Salin No. Rek'}</span>
                          </button>
                        </div>
                        <div className="font-mono text-base font-bold text-blue-950">
                          {paymentMethod.includes('BCA') ? '8830-1234-5678' : '137-00-9876543-2'}
                        </div>
                        <p className="text-[11px] text-blue-700">Atas Nama: <strong>PT MASAKAN PADANG ID</strong></p>
                        <div className="pt-1 text-xs font-bold text-[#a61c1c]">
                          Total: Rp {Number(orderSuccess.total_harga || totalHarga).toLocaleString('id-ID')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmPaid}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Konfirmasi Sudah Transfer ➔</span>
                      </button>
                    </div>
                  )}

                  {/* TAMPILAN TUNAI / COD */}
                  {(paymentMethod.includes('COD') || paymentMethod.includes('Tunai')) && (
                    <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 shadow-sm max-w-sm mx-auto space-y-3 text-left">
                      <div className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Pembayaran Tunai / Di Tempat</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Silakan siapkan uang pas sebesar <strong className="text-[#a61c1c]">Rp {Number(orderSuccess.total_harga || totalHarga).toLocaleString('id-ID')}</strong> saat kurir mengantarkan pesanan atau saat mengambil di kasir.
                      </p>
                      <button
                        type="button"
                        onClick={handleConfirmPaid}
                        className="w-full py-2.5 bg-[#a61c1c] hover:bg-[#881414] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Konfirmasi Pesanan COD ➔</span>
                      </button>
                    </div>
                  )}

                  {/* AUTO-DETECT STATUS INFO */}
                  <div className="pt-1 space-y-2 max-w-sm mx-auto">
                    <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl flex items-center justify-center gap-2.5 text-xs text-emerald-900 shadow-2xs">
                      <div className="relative flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
                      </div>
                      <span className="font-bold">Mendeteksi Pembayaran Otomatis...</span>
                    </div>

                    <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                      Layar ini akan otomatis berpindah begitu pembayaran diterima atau setelah Anda menekan tombol konfirmasi.
                    </p>

                    <div className="text-center pt-1">
                      <a
                        href={`https://wa.me/6285147413866?text=${encodeURIComponent(
                          `Halo Kasir Masakan Padang ID, saya butuh bantuan perihal pembayaran untuk pesanan #${orderSuccess.nomor_pesanan}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-stone-500 hover:text-emerald-700 inline-flex items-center gap-1 transition underline"
                      >
                        <span>Ada kendala saat membayar? Hubungi Kasir via WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>
              )}

              {/* SUB-STATE 2: SETELAH PEMBELI KLIK "SAYA SUDAH BAYAR" */}
              {paymentStatus === 'paid' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCheck className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                      ✓ Pembayaran Terkonfirmasi
                    </span>
                    <h4 className="font-serif font-bold text-lg sm:text-xl text-stone-900 mt-2">
                      Terima Kasih, Pembayaran Berhasil!
                    </h4>
                    <div className="mt-1 text-xs font-mono font-bold text-[#a61c1c] bg-red-50 border border-red-200 py-1 px-3 rounded-lg inline-block">
                      NO. PESANAN: {orderSuccess.nomor_pesanan}
                    </div>
                    <p className="text-xs text-stone-600 mt-2 max-w-xs mx-auto leading-relaxed">
                      Pesanan Anda telah resmi diverifikasi dan langsung diteruskan ke juru masak dapur kami.
                    </p>
                  </div>

                  {/* Ringkasan Konfirmasi */}
                  <div className="p-3.5 bg-white border border-stone-200 rounded-2xl max-w-sm mx-auto text-left text-xs space-y-1.5 shadow-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Metode Pembayaran:</span>
                      <span className="font-bold text-stone-800">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Total Tagihan:</span>
                      <span className="font-bold text-[#a61c1c]">
                        Rp {Number(orderSuccess.total_harga || totalHarga).toLocaleString('id-ID')} (Lunas ✓)
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Nama Pemesan:</span>
                      <span className="font-bold text-stone-800">{customerName}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Status Dapur:</span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                        Sedang Disiapkan
                      </span>
                    </div>
                  </div>

                  {/* Tombol Aksi WhatsApp & Lacak (BARU DIAKTIFKAN DI SINI) */}
                  <div className="pt-2 space-y-2 max-w-sm mx-auto">
                    <a
                      href={getPaidWhatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim Bukti ke WhatsApp Kasir ➔</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.location.hash = '#lacak';
                      }}
                      className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      Lacak Progres di Website 🔍
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-STATE 3: JIKA WAKTU 10 MENIT HABIS (EXPIRED) */}
              {paymentStatus === 'expired' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-md">
                    <AlertCircle className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-block">
                      Waktu Habis (10 Menit)
                    </span>
                    <h4 className="font-serif font-bold text-lg sm:text-xl text-stone-900 mt-2">
                      Batas Waktu Pembayaran Berakhir
                    </h4>
                    <div className="mt-1 text-xs font-mono font-bold text-stone-600 bg-stone-100 border border-stone-200 py-1 px-3 rounded-lg inline-block">
                      NO. PESANAN: {orderSuccess.nomor_pesanan}
                    </div>
                    <p className="text-xs text-stone-600 mt-2 max-w-xs mx-auto leading-relaxed">
                      Batas waktu 10 menit untuk pembayaran QRIS telah kedaluwarsa demi keamanan transaksi.
                    </p>
                  </div>

                  <div className="pt-3 space-y-2 max-w-sm mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentStatus('waiting');
                        setPaymentTimeLeft(600);
                      }}
                      className="w-full py-3 bg-[#a61c1c] hover:bg-[#881414] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Perpanjang Waktu 10 Menit ↺</span>
                    </button>

                    <a
                      href={`https://wa.me/6285147413866?text=${encodeURIComponent(
                        `Halo Kasir Masakan Padang ID, pesanan saya #${orderSuccess.nomor_pesanan} batas waktunya habis tapi saya sudah transfer. Mohon bantuannya ya.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Sudah Terlanjur Transfer? Chat Kasir</span>
                    </a>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ================= FOOTER / STICKY ACTION BAR ================= */}
        <footer className="bg-white border-t border-stone-200 p-4 shrink-0 shadow-lg">
          
          {/* Cart Step Footer (Shopee style sticky checkout bar) */}
          {step === 'cart' && (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-stone-400 font-semibold uppercase">Total ({totalQty} Porsi):</div>
                <div className="font-bold text-base sm:text-lg text-[#a61c1c] leading-none">
                  Rp {totalHarga.toLocaleString('id-ID')}
                </div>
              </div>

              <button
                type="button"
                disabled={trayItems.length === 0}
                onClick={handleProceedToCheckout}
                className="px-6 py-3 bg-[#a61c1c] hover:bg-[#881414] disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed group"
              >
                <span>Checkout ({totalQty})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Checkout Step Footer */}
          {step === 'checkout' && (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-stone-400 font-semibold uppercase">Total Tagihan:</div>
                <div className="font-bold text-base sm:text-lg text-[#a61c1c] leading-none">
                  Rp {totalHarga.toLocaleString('id-ID')}
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || trayItems.length === 0}
                className="px-6 py-3 bg-[#a61c1c] hover:bg-[#881414] disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <span>Buat Pesanan Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success Step Footer */}
          {step === 'success' && (
            <div>
              {paymentStatus === 'waiting' && (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-stone-400 font-semibold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Sisa Waktu:</span>
                    </div>
                    <div className="font-mono font-bold text-base text-[#a61c1c]">
                      {formatCountdown(paymentTimeLeft)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmPaid}
                    className="px-5 py-2.5 bg-[#a61c1c] hover:bg-[#881414] active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Konfirmasi Selesai ➔</span>
                  </button>
                </div>
              )}

              {paymentStatus === 'paid' && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#120d0a] hover:bg-black text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Tutup & Belanja Lagi
                </button>
              )}

              {paymentStatus === 'expired' && (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStatus('waiting');
                    setPaymentTimeLeft(600);
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Perpanjang Waktu 10 Menit ↺
                </button>
              )}
            </div>
          )}

        </footer>

      </div>
    </div>
  );
}
