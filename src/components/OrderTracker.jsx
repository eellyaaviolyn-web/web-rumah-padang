import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, CheckCheck, ChefHat, Bike, CheckCircle2, AlertCircle, Phone, Receipt, RefreshCw, Sparkles } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'Menunggu Konfirmasi', label: 'Menunggu Konfirmasi', icon: Clock, desc: 'Pesanan tersimpan di database kasir resto' },
  { key: 'Dibayar', label: 'Pembayaran Lunas', icon: CheckCheck, desc: 'QRIS / transfer terverifikasi lunas secara otomatis' },
  { key: 'Sedang Dimasak', label: 'Sedang Dimasak Dapur', icon: ChefHat, desc: 'Juru masak meracik bumbu dan menyiapkan lauk pilihan' },
  { key: 'Siap Dikirim', label: 'Siap Dikirim / Diambil', icon: Bike, desc: 'Pesanan dikemas rapi & dalam perjalanan kurir' },
  { key: 'Selesai', label: 'Pesanan Selesai', icon: CheckCircle2, desc: 'Pesanan telah diterima dengan selamat & tuntas' },
];

export default function OrderTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastLocalOrder, setLastLocalOrder] = useState(null);
  const pollTimerRef = useRef(null);

  // Ambil pesanan terakhir dari localStorage saat komponen dimuat
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bk_last_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        setLastLocalOrder(parsed);
      }
    } catch {}
  }, []);

  // Dengarkan custom event bk_track_order (dipicu dari tombol "Lacak Progres di Website 🔍")
  useEffect(() => {
    const handleTrackEvent = (e) => {
      const order = e.detail;
      if (order && order.nomor_pesanan) {
        setSearchQuery(order.nomor_pesanan);
        setOrderResult(order);
        setErrorMsg('');
        // Jalankan pencarian live dari database juga
        handleSearch(order.nomor_pesanan);
      }
    };

    window.addEventListener('bk_track_order', handleTrackEvent);
    return () => window.removeEventListener('bk_track_order', handleTrackEvent);
  }, []);

  // Auto-search jika URL hash mengandung query atau ada lastLocalOrder saat user scroll ke #lacak
  useEffect(() => {
    const checkHashAndAutoSearch = () => {
      if (window.location.hash.startsWith('#lacak')) {
        const saved = localStorage.getItem('bk_last_order');
        if (saved && !orderResult) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.nomor_pesanan) {
              setSearchQuery(parsed.nomor_pesanan);
              handleSearch(parsed.nomor_pesanan);
            }
          } catch {}
        }
      }
    };

    checkHashAndAutoSearch();
    window.addEventListener('hashchange', checkHashAndAutoSearch);
    return () => window.removeEventListener('hashchange', checkHashAndAutoSearch);
  }, [orderResult]);

  // Polling otomatis setiap 8 detik jika status pesanan belum selesai
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    if (orderResult && orderResult.status !== 'Selesai' && orderResult.status !== 'Dibatalkan') {
      pollTimerRef.current = setInterval(() => {
        if (orderResult.nomor_pesanan) {
          fetch(`/api/pesanan/track/${encodeURIComponent(orderResult.nomor_pesanan)}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.data) {
                setOrderResult(data.data);
              }
            })
            .catch(() => {});
        }
      }, 8000);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [orderResult]);

  const handleSearch = async (queryToSearch) => {
    const rawQuery = (queryToSearch !== undefined ? queryToSearch : searchQuery) || '';
    const q = rawQuery.trim();
    if (!q) {
      setErrorMsg('Masukkan nomor pesanan atau nomor WhatsApp Anda.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/pesanan/track/${encodeURIComponent(q)}`);
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setOrderResult(data.data);
        setErrorMsg('');
      } else {
        // Fallback: periksa apakah cocok dengan pesanan di localStorage
        let fallbackMatched = null;
        try {
          const saved = localStorage.getItem('bk_last_order');
          if (saved) {
            const parsed = JSON.parse(saved);
            const cleanQ = q.replace(/^[#\s]+/, '').toLowerCase();
            const orderNo = (parsed.nomor_pesanan || '').toLowerCase();
            const orderWa = (parsed.nomor_wa || '').toLowerCase();
            const orderName = (parsed.nama_pelanggan || '').toLowerCase();

            if (orderNo === cleanQ || orderNo === `bk-${cleanQ}` || orderWa === cleanQ || orderName === cleanQ) {
              fallbackMatched = parsed;
            }
          }
        } catch {}

        if (fallbackMatched) {
          setOrderResult(fallbackMatched);
          setErrorMsg('');
        } else {
          setOrderResult(null);
          setErrorMsg(data.message || `Pesanan "${q}" tidak ditemukan di database. Pastikan nomor pesanan benar.`);
        }
      }
    } catch (err) {
      // Fallback offline jika jaringan backend sempat terputus
      let fallbackMatched = null;
      try {
        const saved = localStorage.getItem('bk_last_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          fallbackMatched = parsed;
        }
      } catch {}

      if (fallbackMatched) {
        setOrderResult(fallbackMatched);
        setErrorMsg('');
      } else {
        setErrorMsg('Gagal terhubung ke database server. Pastikan koneksi lancar dan coba beberapa saat lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (statusStr) => {
    const s = (statusStr || '').toLowerCase().trim();
    if (s.includes('menunggu')) return 0;
    if (s === 'dibayar' || s === 'lunas') return 1;
    if (s.includes('masak') || s.includes('proses')) return 2;
    if (s.includes('kirim') || s.includes('ambil') || s.includes('siap')) return 3;
    if (s.includes('selesai') || s.includes('tuntas')) return 4;
    return 0;
  };

  const activeStepIdx = orderResult ? getStepIndex(orderResult.status) : 0;

  return (
    <section id="lacak" className="py-20 bg-[#f7f4ee] border-t border-[#e8dfd5] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#a61c1c] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Pantauan Dapur Real-time</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#19120e] tracking-tight">
            Lacak Status Masakan Anda
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Pantau tahapan penyiapan hidangan Minang Anda dari dapur hingga siap santap langsung dari catatan database kasir.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-md border border-[#e5dcd3] p-5 sm:p-7 mb-8">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Nomor Pesanan (contoh: BK-583161 atau nomor WA)"
                className="w-full pl-11 pr-4 py-3 bg-[#fbfaf8] border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#a61c1c] focus:ring-1 focus:ring-[#a61c1c] text-stone-800 placeholder-stone-400 transition font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#a61c1c] hover:bg-[#8e1717] active:scale-98 text-white font-bold text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Cek Status</span>
                </>
              )}
            </button>
          </form>

          {/* Quick chips tersimpan & demo terdaftar */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            {lastLocalOrder && lastLocalOrder.nomor_pesanan && (
              <div className="flex items-center gap-1.5 mr-1">
                <span className="font-bold text-stone-700">Pesanan Terakhir Anda:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(lastLocalOrder.nomor_pesanan);
                    handleSearch(lastLocalOrder.nomor_pesanan);
                  }}
                  className="font-mono text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition font-bold cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>#{lastLocalOrder.nomor_pesanan}</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">Lacak</span>
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 text-stone-400">
              <span className="text-[11px]">Contoh nomor terdaftar:</span>
              {['BK-583161', 'BK-807164', 'BK-896106', 'BK-733322'].map(no => (
                <button
                  key={no}
                  type="button"
                  onClick={() => {
                    setSearchQuery(no);
                    handleSearch(no);
                  }}
                  className="font-mono text-[#a61c1c] bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-lg transition font-semibold text-[11px] cursor-pointer"
                >
                  {no}
                </button>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="mt-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}
        </div>

        {/* Result Tracking Card */}
        {orderResult && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-[#c59837]/40 p-6 sm:p-8 animate-fadeIn">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-black text-xl text-[#a61c1c]">
                    #{orderResult.nomor_pesanan}
                  </span>
                  <span className="bg-[#c59837]/15 text-[#8f6a1e] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#c59837]/30">
                    {orderResult.tipe_layanan || 'Pesanan Dapur'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ● {orderResult.status}
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-1.5">
                  Atas Nama: <strong className="text-stone-800">{orderResult.nama_pelanggan}</strong> {orderResult.nomor_wa && `• No. WA: ${orderResult.nomor_wa}`}
                </div>
              </div>

              <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                <div>
                  <div className="text-xs text-stone-500">Total Pembayaran</div>
                  <div className="font-serif font-black text-xl text-[#19120e]">
                    Rp {Number(orderResult.total_harga || 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSearch(orderResult.nomor_pesanan)}
                  disabled={loading}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  title="Segarkan status pesanan terkini dari database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#a61c1c]' : ''}`} />
                  <span>Segarkan</span>
                </button>
              </div>
            </div>

            {/* Stepper Visualizer */}
            <div className="py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx < activeStepIdx;
                  const isCurrent = idx === activeStepIdx;
                  const isPending = idx > activeStepIdx;

                  return (
                    <div 
                      key={step.key} 
                      className={`relative rounded-xl p-4 border transition ${
                        isCurrent 
                          ? 'bg-[#fffaf0] border-[#c59837] shadow-md ring-2 ring-[#c59837]/30' 
                          : isDone 
                          ? 'bg-emerald-50/70 border-emerald-200' 
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrent 
                            ? 'bg-[#c59837] text-white shadow animate-pulse' 
                            : isDone 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-stone-200 text-stone-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${
                            isCurrent ? 'text-[#8f6a1e]' : isDone ? 'text-emerald-800' : 'text-stone-600'
                          }`}>
                            Tahap {idx + 1}
                          </div>
                          <div className="text-xs font-semibold text-stone-900 leading-tight">
                            {step.label}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items List */}
            {orderResult.items && orderResult.items.length > 0 && (
              <div className="bg-[#faf8f5] rounded-xl p-4 border border-stone-200 mb-6">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                  Rincian Hidangan Dalam Nampan:
                </h4>
                <div className="divide-y divide-stone-200 text-xs">
                  {orderResult.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="font-medium text-stone-800">
                        {item.nama || item.nama_item} <span className="text-stone-500 font-normal">x {item.jumlah}</span>
                      </div>
                      <div className="font-semibold text-stone-900 font-mono">
                        Rp {Number(item.subtotal || (item.harga * item.jumlah) || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
                {orderResult.catatan && orderResult.catatan !== '-' && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200 text-xs text-stone-600">
                    <span className="font-bold text-stone-700">Catatan Khusus:</span> {orderResult.catatan}
                  </div>
                )}
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pembaruan otomatis tersinkronisasi dengan dapur kasir (eellyaa).</span>
              </span>
              <a
                href={`https://wa.me/6285147413866?text=Halo%20Kasir%20Bundo%20Kanduang,%20saya%20ingin%20menanyakan%20status%20pesanan%20nomor%20${orderResult.nomor_pesanan}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Konfirmasi via WhatsApp Kasir</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
