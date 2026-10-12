import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, Printer, 
  Check, Phone, CheckCircle2, Clock, Wallet, Users, 
  UtensilsCrossed, ArrowRight, ShieldAlert, Sparkles, 
  DollarSign, Receipt, CreditCard, QrCode, AlertCircle, RefreshCw
} from 'lucide-react';

export default function KasirView({
  activeTab,
  menuItems,
  orders,
  activeOperator,
  onSelectReceipt,
  onAdvanceOrderStatus,
  onToggleStock,
  onNewOrderCreated,
  playChime
}) {
  // ================= 1. STATE TERMINAL POS =================
  const [posCart, setPosCart] = useState([]);
  const [posCategoryFilter, setPosCategoryFilter] = useState('Semua');
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posCustomer, setPosCustomer] = useState({
    nama: 'Pelanggan Walk-In',
    nomor_wa: '0812000000',
    tipe_layanan: 'Makan di Tempat (Dine-in)',
    catatan: '',
    memberType: 'Umum'
  });
  const [posDiscountType, setPosDiscountType] = useState('none'); // 'none' | 'persen' | 'nominal'
  const [posDiscountValue, setPosDiscountValue] = useState(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState('Tunai');
  const [posCashGiven, setPosCashGiven] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // ================= 2. STATE CASH DRAWER (BUKA / TUTUP KASIR) =================
  const [cashDrawer, setCashDrawer] = useState(() => {
    const saved = localStorage.getItem('bk_cash_drawer_session');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      status: 'Terbuka',
      shift: 'Pagi (08.00 - 16.00)',
      waktuBuka: '08:00 WIB',
      modalAwal: 250000,
      kasirNama: activeOperator?.nama || 'Rian Hendra (Kasir 1)'
    };
  });
  const [cashDrawerPhysicalInput, setCashDrawerPhysicalInput] = useState('');
  const [drawerHistory, setDrawerHistory] = useState([
    {
      id: 1,
      tanggal: '2026-10-11',
      shift: 'Pagi (08.00 - 16.00)',
      kasir: 'Rian Hendra',
      modalAwal: 250000,
      penjualanTunai: 1650000,
      uangFisik: 1900000,
      selisih: 0,
      status: 'Seimbang (Tutup Shift)'
    }
  ]);

  // ================= 3. STATE MEMBER & PELANGGAN =================
  const [customerMembers, setCustomerMembers] = useState([
    { id: 1, nama: 'Bpk. Hendra Gunawan', no_telp: '081298765432', tier: 'Gold Member', diskon: 10, poin: 350, totalTransaksi: 1250000 },
    { id: 2, nama: 'Ibu Siti Rahmawati', no_telp: '081311223344', tier: 'Silver Member', diskon: 5, poin: 180, totalTransaksi: 720000 },
    { id: 3, nama: 'Sdr. Dimas Prasetyo', no_telp: '085744556677', tier: 'Silver Member', diskon: 5, poin: 95, totalTransaksi: 380000 },
    { id: 4, nama: 'dr. Andi Pratama', no_telp: '081122334455', tier: 'VIP Platinum', diskon: 15, poin: 620, totalTransaksi: 2450000 }
  ]);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [newMemberForm, setNewMemberForm] = useState({
    nama: '',
    no_telp: '',
    tier: 'Silver Member'
  });
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // ================= POS CALCULATIONS =================
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = posCategoryFilter === 'Semua' || item.kategori === posCategoryFilter;
      if (!matchCat) return false;
      if (!posSearchQuery.trim()) return true;
      const q = posSearchQuery.toLowerCase();
      return (item.nama || '').toLowerCase().includes(q) || (item.kategori || '').toLowerCase().includes(q);
    });
  }, [menuItems, posCategoryFilter, posSearchQuery]);

  const posSubtotal = useMemo(() => {
    return posCart.reduce((acc, i) => acc + (Number(i.harga) * Number(i.jumlah)), 0);
  }, [posCart]);

  const posDiscountAmount = useMemo(() => {
    if (posDiscountType === 'persen') {
      return Math.round((posSubtotal * Number(posDiscountValue || 0)) / 100);
    }
    if (posDiscountType === 'nominal') {
      return Math.min(posSubtotal, Number(posDiscountValue || 0));
    }
    return 0;
  }, [posSubtotal, posDiscountType, posDiscountValue]);

  const posGrandTotal = Math.max(0, posSubtotal - posDiscountAmount);
  const posCashNum = Number(posCashGiven || 0);
  const posChangeAmount = posPaymentMethod === 'Tunai' && posCashNum >= posGrandTotal ? posCashNum - posGrandTotal : 0;

  // Add Item to Cart
  const handleAddToCart = (dish) => {
    if (dish.stok_status === 'Habis') {
      alert(`Mohon maaf, hidangan "${dish.nama}" sedang habis.`);
      return;
    }
    if (playChime) playChime();
    setPosCart(prev => {
      const existing = prev.find(i => i.id === dish.id);
      if (existing) {
        return prev.map(i => i.id === dish.id ? { ...i, jumlah: i.jumlah + 1 } : i);
      }
      return [...prev, { ...dish, jumlah: 1 }];
    });
  };

  // Modify Item Qty
  const handleUpdateQty = (dishId, delta) => {
    setPosCart(prev => {
      return prev.map(i => {
        if (i.id === dishId) {
          const next = i.jumlah + delta;
          return next > 0 ? { ...i, jumlah: next } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  // Select Member into Customer Form
  const handleApplyMember = (member) => {
    setPosCustomer(prev => ({
      ...prev,
      nama: member.nama,
      nomor_wa: member.no_telp,
      memberType: member.tier
    }));
    setPosDiscountType('persen');
    setPosDiscountValue(member.diskon);
    alert(`Member "${member.nama}" aktif! Diskon ${member.diskon}% diterapkan otomatis.`);
  };

  // POS Checkout Execution
  const handleProcessCheckout = async (e) => {
    if (e) e.preventDefault();
    if (posCart.length === 0) {
      alert('Nampan pesanan kasir masih kosong. Silakan pilih hidangan menu.');
      return;
    }

    if (posPaymentMethod === 'Tunai' && posCashNum < posGrandTotal && posCashGiven !== '') {
      alert(`Uang tunai kurang! Total belanja: Rp ${posGrandTotal.toLocaleString('id-ID')}, Uang diterima: Rp ${posCashNum.toLocaleString('id-ID')}`);
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderPayload = {
        nama_pelanggan: posCustomer.nama.trim() || 'Pelanggan Walk-In',
        nomor_wa: posCustomer.nomor_wa.trim() || '0812000000',
        tipe_layanan: posCustomer.tipe_layanan,
        catatan: `[KASIR POS: ${activeOperator?.nama || 'Kasir 1'}] Metode: ${posPaymentMethod} | Diskon: Rp ${posDiscountAmount.toLocaleString('id-ID')} | Bayar: Rp ${posCashNum || posGrandTotal} | Kembali: Rp ${posChangeAmount} | Catatan: ${posCustomer.catatan || '-'}`,
        items: posCart.map(item => ({
          nama: item.nama,
          harga: item.harga,
          jumlah: item.jumlah
        }))
      };

      const res = await fetch('/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (playChime) playChime();

        // Refresh database orders di parent
        if (typeof onNewOrderCreated === 'function') {
          onNewOrderCreated();
        }

        // Siapkan receipt object untuk langsung cetak struk
        const newReceipt = {
          id: data.data?.id || Date.now(),
          nomor_pesanan: data.data?.nomor_pesanan || ('BK-' + Date.now().toString().slice(-6)),
          nama_pelanggan: orderPayload.nama_pelanggan,
          nomor_wa: orderPayload.nomor_wa,
          tipe_layanan: orderPayload.tipe_layanan,
          total_harga: posGrandTotal,
          status: 'Dibayar',
          created_at: new Date().toISOString(),
          items: orderPayload.items
        };

        // Reset POS Form
        setPosCart([]);
        setPosCashGiven('');
        setPosDiscountType('none');
        setPosDiscountValue(0);
        setPosCustomer({
          nama: 'Pelanggan Walk-In',
          nomor_wa: '0812000000',
          tipe_layanan: 'Makan di Tempat (Dine-in)',
          catatan: '',
          memberType: 'Umum'
        });

        // Buka modal cetak struk
        if (typeof onSelectReceipt === 'function') {
          onSelectReceipt(newReceipt);
        }
      } else {
        alert(data.error || 'Gagal memproses transaksi kasir.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat memproses pesanan: ' + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Cash Drawer Close Action
  const handleCloseCashDrawer = () => {
    if (!cashDrawerPhysicalInput) {
      alert('Masukkan jumlah uang fisik tunai yang dihitung dari laci kasir.');
      return;
    }
    const fisik = Number(cashDrawerPhysicalInput);
    // Hitung total penjualan tunai dari orders hari ini
    const totalTunaiHariIni = orders.reduce((sum, o) => {
      const isTunai = (o.catatan || '').includes('Tunai') || (o.status === 'Dibayar' || o.status === 'Selesai');
      return isTunai ? sum + Number(o.total_harga || 0) : sum;
    }, 0);

    const ekspektasi = cashDrawer.modalAwal + totalTunaiHariIni;
    const selisih = fisik - ekspektasi;

    const newRecord = {
      id: Date.now(),
      tanggal: new Date().toISOString().split('T')[0],
      shift: cashDrawer.shift,
      kasir: cashDrawer.kasirNama,
      modalAwal: cashDrawer.modalAwal,
      penjualanTunai: totalTunaiHariIni,
      uangFisik: fisik,
      selisih: selisih,
      status: selisih === 0 ? 'Seimbang (Tutup Shift)' : selisih > 0 ? `Surplus +Rp ${selisih.toLocaleString('id-ID')}` : `Minus Rp ${selisih.toLocaleString('id-ID')}`
    };

    setDrawerHistory(prev => [newRecord, ...prev]);
    setCashDrawer(prev => ({
      ...prev,
      status: 'Tutup Shift'
    }));
    alert(`Rekap Tutup Shift Berhasil!\nEkspektasi: Rp ${ekspektasi.toLocaleString('id-ID')}\nFisik: Rp ${fisik.toLocaleString('id-ID')}\nSelisih: Rp ${selisih.toLocaleString('id-ID')}`);
  };

  // Re-open Cash Drawer
  const handleOpenCashDrawer = () => {
    const modal = prompt('Masukkan modal awal uang kembalian (Cash In):', '250000');
    if (!modal) return;
    const modalNum = Number(modal.replace(/\D/g, '')) || 250000;
    const updated = {
      status: 'Terbuka',
      shift: 'Pagi (08.00 - 16.00)',
      waktuBuka: new Date().toLocaleTimeString('id-ID'),
      modalAwal: modalNum,
      kasirNama: activeOperator?.nama || 'Rian Hendra'
    };
    setCashDrawer(updated);
    setCashDrawerPhysicalInput('');
    localStorage.setItem('bk_cash_drawer_session', JSON.stringify(updated));
    alert(`Laci Kasir Berhasil Dibuka!\nModal Awal: Rp ${modalNum.toLocaleString('id-ID')}`);
  };

  // Filter Orders for Shift Kasir
  const shiftOrders = useMemo(() => {
    return orders; // Kasir dapat melihat seluruh antrean transaksi hariannya
  }, [orders]);

  return (
    <div className="space-y-6">

      {/* ================= TAB 1: TERMINAL POS & TRANSAKSI BARU ================= */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fadeIn">
          
          {/* LEFT COLUMN: KATALOG MENU CEPAT (LG: 7 COLS) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            
            {/* Search & Category Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={posSearchQuery}
                    onChange={(e) => setPosSearchQuery(e.target.value)}
                    placeholder="Ketik nama hidangan / scan barcode cepat..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:border-[#a61c1c] outline-none transition"
                  />
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Kasir Aktif: {activeOperator?.nama || 'Rian Hendra'}</span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {['Semua', 'Daging', 'Ayam', 'Ikan & Laut', 'Sayuran', 'Pelengkap', 'Minuman'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPosCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                      posCategoryFilter === cat
                        ? 'bg-[#18100c] text-white shadow-xs'
                        : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredMenuItems.map(dish => {
                const inCart = posCart.find(i => i.id === dish.id);
                const isHabis = dish.stok_status === 'Habis';

                return (
                  <div
                    key={dish.id}
                    onClick={() => !isHabis && handleAddToCart(dish)}
                    className={`bg-white rounded-2xl border p-3 flex flex-col justify-between transition cursor-pointer select-none group relative overflow-hidden ${
                      isHabis 
                        ? 'opacity-60 border-stone-200 bg-stone-50 cursor-not-allowed'
                        : inCart 
                        ? 'border-[#a61c1c] ring-2 ring-red-100 shadow-sm' 
                        : 'border-stone-200/90 hover:border-[#a61c1c]/50 hover:shadow-sm'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#a61c1c] text-white font-black text-xs flex items-center justify-center shadow">
                        {inCart.jumlah}
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 relative">
                        <img
                          src={dish.image_url || '/images/menu/rendang.jpg'}
                          alt={dish.nama}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/hero-rumah-gadang.jpg';
                          }}
                        />
                        {isHabis && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-bold">
                            Habis
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-xs text-stone-900 line-clamp-1">{dish.nama}</div>
                        <div className="text-[10px] text-stone-500">{dish.kategori}</div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between mt-2 border-t border-stone-100">
                      <div className="font-mono font-bold text-xs text-[#a61c1c]">
                        Rp {Number(dish.harga).toLocaleString('id-ID')}
                      </div>
                      <button
                        type="button"
                        disabled={isHabis}
                        className="p-1 rounded-lg bg-stone-100 group-hover:bg-[#a61c1c] group-hover:text-white transition text-stone-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: NAMPAN KASIR & PEMBAYARAN (LG: 5 COLS) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 flex flex-col justify-between space-y-4">
            
            {/* Header Nampan */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#a61c1c]" />
                  <h3 className="font-serif font-black text-base text-stone-900">Nampan Kasir POS</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPosCart([])}
                  className="text-[11px] text-stone-400 hover:text-red-600 font-bold transition cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>

              {/* Form Ringan Data Pelanggan */}
              <div className="pt-3 pb-2 space-y-2 border-b border-stone-100 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Pelanggan</label>
                    <input
                      type="text"
                      value={posCustomer.nama}
                      onChange={(e) => setPosCustomer(prev => ({ ...prev, nama: e.target.value }))}
                      placeholder="Nama pelanggan..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-xs outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase">WhatsApp</label>
                    <input
                      type="text"
                      value={posCustomer.nomor_wa}
                      onChange={(e) => setPosCustomer(prev => ({ ...prev, nomor_wa: e.target.value }))}
                      placeholder="0812..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-xs outline-none focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={posCustomer.tipe_layanan}
                    onChange={(e) => setPosCustomer(prev => ({ ...prev, tipe_layanan: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-xs outline-none"
                  >
                    <option value="Makan di Tempat (Dine-in)">Makan di Tempat (Dine-in)</option>
                    <option value="Bungkus Nasi Kotak">Bungkus Nasi Kotak</option>
                    <option value="Pesan Antar (Delivery)">Pesan Antar (Delivery)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(true)}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer"
                  >
                    + Member
                  </button>
                </div>
              </div>

              {/* Item List di Nampan */}
              <div className="py-2 space-y-2 max-h-56 overflow-y-auto divide-y divide-stone-100 pr-1">
                {posCart.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 space-y-1">
                    <ShoppingCart className="w-8 h-8 mx-auto opacity-30 text-stone-400" />
                    <p className="text-xs">Nampan kasir masih kosong</p>
                    <p className="text-[10px] text-stone-400">Klik menu di samping untuk menambahkan</p>
                  </div>
                ) : (
                  posCart.map(item => (
                    <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-stone-900 truncate">{item.nama}</div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          Rp {Number(item.harga).toLocaleString('id-ID')} x {item.jumlah}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="p-1 text-stone-600 hover:text-red-700 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold font-mono text-xs">{item.jumlah}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="p-1 text-stone-600 hover:text-emerald-700 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-stone-900 w-16 text-right">
                          Rp {(item.harga * item.jumlah).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bagian Perhitungan & Pembayaran */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              
              {/* Diskon Panel */}
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-stone-700 text-[11px]">
                  <span>Diskon / Potongan Kasir:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setPosDiscountType('none'); setPosDiscountValue(0); }}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${posDiscountType === 'none' ? 'bg-[#18100c] text-white' : 'bg-white border'}`}
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPosDiscountType('persen'); setPosDiscountValue(5); }}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${posDiscountType === 'persen' && posDiscountValue === 5 ? 'bg-[#a61c1c] text-white' : 'bg-white border'}`}
                    >
                      5%
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPosDiscountType('persen'); setPosDiscountValue(10); }}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${posDiscountType === 'persen' && posDiscountValue === 10 ? 'bg-[#a61c1c] text-white' : 'bg-white border'}`}
                    >
                      10%
                    </button>
                  </div>
                </div>

                {posDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold text-xs pt-1">
                    <span>Hemat Diskon:</span>
                    <span>-Rp {posDiscountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {/* Rincian Angka Subtotal & Grand Total */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal Porsi:</span>
                  <span className="font-mono">Rp {posSubtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-100">
                  <span>TOTAL BELANJA:</span>
                  <span className="text-[#a61c1c] font-mono">Rp {posGrandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Pilihan Metode Bayar (Tunai / QRIS) */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('Tunai')}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      posPaymentMethod === 'Tunai'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Uang Tunai (Cash)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPosPaymentMethod('QRIS');
                      setPosCashGiven(String(posGrandTotal));
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      posPaymentMethod === 'QRIS'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-500'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QRIS Statis/Scan</span>
                  </button>
                </div>

                {/* Input Tunai Diterima & Kembalian */}
                {posPaymentMethod === 'Tunai' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={posCashGiven}
                        onChange={(e) => setPosCashGiven(e.target.value)}
                        placeholder="Uang diterima (Rp)..."
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-mono outline-none focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setPosCashGiven(String(posGrandTotal))}
                        className="px-2 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Uang Pas
                      </button>
                    </div>

                    {posCashNum >= posGrandTotal && posCashGiven !== '' && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 font-bold">
                        <span>KEMBALIAN:</span>
                        <span className="font-mono text-sm">Rp {posChangeAmount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tombol Eksekusi Transaksi & Cetak Struk */}
              <button
                type="button"
                onClick={handleProcessCheckout}
                disabled={submittingOrder || posCart.length === 0}
                className="w-full py-3.5 px-4 bg-[#a61c1c] hover:bg-[#881414] active:scale-98 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingOrder ? (
                  <span>Memproses Transaksi...</span>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Proses & Cetak Struk POS ➔</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2: RIWAYAT TRANSAKSI SHIFT SAYA ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg text-stone-900">
                Riwayat Transaksi Shift Kasir Hari Ini
              </h3>
              <p className="text-xs text-stone-500">
                Daftar pesanan yang diproses kasir selama jam kerja. Kasir hanya dapat memperbarui status & cetak ulang struk.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold">
                {shiftOrders.length} Transaksi Tercatat
              </span>
            </div>
          </div>

          {/* Tabel Pesanan Shift */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-stone-50 text-stone-500 font-mono border-b border-stone-200">
                <tr>
                  <th className="p-3.5">No. Pesanan</th>
                  <th className="p-3.5">Pelanggan</th>
                  <th className="p-3.5">Layanan</th>
                  <th className="p-3.5">Detail Nampan</th>
                  <th className="p-3.5">Total Bayar</th>
                  <th className="p-3.5">Status Dapur</th>
                  <th className="p-3.5 text-right">Aksi Kasir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {shiftOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400 italic">
                      Belum ada pesanan yang diproses di shift ini. Buka tab POS untuk membuat transaksi baru.
                    </td>
                  </tr>
                ) : (
                  shiftOrders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50 transition">
                      <td className="p-3.5 font-mono font-bold text-[#a61c1c]">
                        #{order.nomor_pesanan}
                        <div className="text-[10px] text-stone-400 font-normal">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString('id-ID') : '-'}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{order.nama_pelanggan}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{order.nomor_wa}</div>
                      </td>
                      <td className="p-3.5 text-stone-600">{order.tipe_layanan}</td>
                      <td className="p-3.5 max-w-[200px] truncate text-stone-700">
                        {(order.items || []).map(i => `${i.nama || i.nama_item} (${i.jumlah}x)`).join(', ') || '-'}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-stone-900 text-sm">
                        Rp {Number(order.total_harga || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          order.status === 'Selesai' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          order.status === 'Sedang Dimasak' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          order.status === 'Dibayar' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          'bg-stone-100 text-stone-700 border-stone-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status !== 'Selesai' && (
                            <button
                              type="button"
                              onClick={() => onAdvanceOrderStatus && onAdvanceOrderStatus(order)}
                              className="px-2.5 py-1.5 bg-[#a61c1c] hover:bg-[#881414] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              title="Lanjut status pengerjaan"
                            >
                              ➔ Majukan
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectReceipt && onSelectReceipt(order)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition cursor-pointer"
                            title="Cetak struk nota belanja"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/${(order.nomor_wa || '').replace(/^0/, '62').replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(order.nama_pelanggan)},%20pesanan%20nomor%20${order.nomor_pesanan}%20di%20Masakan%20Padang%20ID%20statusnya:%20${encodeURIComponent(order.status)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                            title="Hubungi pelanggan"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ================= TAB 3: BUKA / TUTUP KASIR (CASH DRAWER) ================= */}
      {activeTab === 'cash_drawer' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Card Status Laci Kasir */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                <Wallet className="w-3 h-3 text-emerald-600" />
                <span>Status Laci: {cashDrawer.status}</span>
              </div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Pencatatan Kasir & Uang Laci (Cash In & Out)
              </h3>
              <p className="text-xs text-stone-500">
                Kelola modal awal uang kembalian dan cocokkan uang fisik saat tutup shift dengan rekap penjualan sistem.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {cashDrawer.status === 'Tutup Shift' ? (
                <button
                  type="button"
                  onClick={handleOpenCashDrawer}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  + Buka Sesi Kasir Baru (Cash In)
                </button>
              ) : (
                <span className="text-xs font-mono font-bold text-stone-500">
                  Waktu Buka: {cashDrawer.waktuBuka}
                </span>
              )}
            </div>
          </div>

          {/* 3 Metric Cards Rekap Kasir Saat Ini */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Modal Awal Laci (Cash In)</span>
              <div className="font-mono font-black text-xl text-stone-900">
                Rp {cashDrawer.modalAwal.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-stone-400">Uang receh/pecahan untuk kembalian pelanggan</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Penjualan Tunai Sistem</span>
              <div className="font-mono font-black text-xl text-emerald-700">
                Rp {orders.reduce((sum, o) => sum + Number(o.total_harga || 0), 0).toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-stone-400">Total transaksi tunai shift hari ini</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Ekspektasi Uang Laci</span>
              <div className="font-mono font-black text-xl text-[#a61c1c]">
                Rp {(cashDrawer.modalAwal + orders.reduce((sum, o) => sum + Number(o.total_harga || 0), 0)).toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-stone-400">Modal Awal + Penjualan Tunai</p>
            </div>
          </div>

          {/* Form Tutup Shift & Rekonsiliasi Uang Fisik */}
          {cashDrawer.status === 'Terbuka' && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
              <h4 className="font-serif font-black text-sm text-stone-900">
                Form Rekap Tutup Shift (Cash Out)
              </h4>
              <p className="text-xs text-stone-500">
                Hitung seluruh uang fisik kertas & koin di laci kasir Anda, kemudian masukkan nominalnya di bawah ini:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase">Uang Fisik di Laci (Rp)</label>
                  <input
                    type="number"
                    value={cashDrawerPhysicalInput}
                    onChange={(e) => setCashDrawerPhysicalInput(e.target.value)}
                    placeholder="Contoh: 1850000"
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-mono outline-none focus:bg-white focus:border-[#a61c1c]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleCloseCashDrawer}
                    className="w-full py-2.5 px-4 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                  >
                    Rekap & Tutup Shift Sekarang ➔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Riwayat Sesi Cash Drawer */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-x-auto shadow-sm p-4 space-y-3">
            <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
              Riwayat Sesi Tutup Kasir Sebelumnya
            </h4>

            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 font-mono border-b border-stone-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Shift & Kasir</th>
                  <th className="p-3">Modal Awal</th>
                  <th className="p-3">Penjualan Tunai</th>
                  <th className="p-3">Uang Fisik</th>
                  <th className="p-3">Selisih</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {drawerHistory.map(row => (
                  <tr key={row.id}>
                    <td className="p-3 font-mono">{row.tanggal}</td>
                    <td className="p-3 font-bold">{row.kasir} ({row.shift})</td>
                    <td className="p-3 font-mono">Rp {row.modalAwal.toLocaleString('id-ID')}</td>
                    <td className="p-3 font-mono">Rp {row.penjualanTunai.toLocaleString('id-ID')}</td>
                    <td className="p-3 font-mono">Rp {row.uangFisik.toLocaleString('id-ID')}</td>
                    <td className={`p-3 font-mono font-bold ${row.selisih === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {row.selisih === 0 ? 'Rp 0 (Pas)' : `Rp ${row.selisih.toLocaleString('id-ID')}`}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ================= TAB 4: MEMBER & PELANGGAN (RINGAN) ================= */}
      {activeTab === 'customers_light' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Manajemen Pelanggan & Member Loyalitas
              </h3>
              <p className="text-xs text-stone-500">
                Cari data member pelanggan untuk memberikan diskon otomatis atau tambahkan pelanggan baru.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Daftarkan Member Baru</span>
            </button>
          </div>

          {/* Search Member Bar */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200/90 shadow-2xs">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                placeholder="Cari berdasarkan nama member atau nomor telepon..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Grid Member Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerMembers
              .filter(m => {
                if (!searchMemberQuery.trim()) return true;
                const q = searchMemberQuery.toLowerCase();
                return m.nama.toLowerCase().includes(q) || m.no_telp.includes(q);
              })
              .map(member => (
                <div key={member.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                        {member.tier}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {member.poin} Poin
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 pt-1">{member.nama}</h4>
                    <p className="text-xs text-stone-500 font-mono">{member.no_telp}</p>
                    <p className="text-[11px] text-stone-600">Diskon Member: <strong>{member.diskon}%</strong></p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyMember(member)}
                    className="w-full py-1.5 bg-[#18100c] hover:bg-[#a61c1c] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Pilih Member ke POS ➔
                  </button>
                </div>
              ))}
          </div>

          {/* Modal Tambah Member */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-stone-200">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-serif font-black text-sm text-stone-900">Pendaftaran Member Baru</h4>
                  <button onClick={() => setShowAddMemberModal(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={newMemberForm.nama}
                      onChange={(e) => setNewMemberForm(p => ({ ...p, nama: e.target.value }))}
                      placeholder="Contoh: Bpk. Rahmat Hidayat"
                      className="w-full border p-2 rounded-lg bg-stone-50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Nomor WhatsApp</label>
                    <input
                      type="text"
                      value={newMemberForm.no_telp}
                      onChange={(e) => setNewMemberForm(p => ({ ...p, no_telp: e.target.value }))}
                      placeholder="0812..."
                      className="w-full border p-2 rounded-lg bg-stone-50 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Tingkatan Member</label>
                    <select
                      value={newMemberForm.tier}
                      onChange={(e) => setNewMemberForm(p => ({ ...p, tier: e.target.value }))}
                      className="w-full border p-2 rounded-lg bg-stone-50 outline-none"
                    >
                      <option value="Silver Member">Silver Member (Diskon 5%)</option>
                      <option value="Gold Member">Gold Member (Diskon 10%)</option>
                      <option value="VIP Platinum">VIP Platinum (Diskon 15%)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMemberForm.nama.trim() || !newMemberForm.no_telp.trim()) {
                        alert('Harap lengkapi nama dan nomor WhatsApp.');
                        return;
                      }
                      const diskonVal = newMemberForm.tier.includes('15%') ? 15 : newMemberForm.tier.includes('10%') ? 10 : 5;
                      const newObj = {
                        id: Date.now(),
                        nama: newMemberForm.nama,
                        no_telp: newMemberForm.no_telp,
                        tier: newMemberForm.tier,
                        diskon: diskonVal,
                        poin: 50,
                        totalTransaksi: 0
                      };
                      setCustomerMembers(p => [newObj, ...p]);
                      setShowAddMemberModal(false);
                      setNewMemberForm({ nama: '', no_telp: '', tier: 'Silver Member' });
                      alert('Member berhasil didaftarkan dengan bonus 50 poin!');
                    }}
                    className="px-3.5 py-1.5 bg-[#a61c1c] text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Simpan Member
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 5: KATALOG & STOK LAUK (KASIR HANYA ATUR STOK) ================= */}
      {activeTab === 'menu_stock' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg text-stone-900">
                Katalog & Ketersediaan Stok Lauk (Kasir)
              </h3>
              <p className="text-xs text-stone-500">
                Kasir hanya memiliki wewenang untuk mengubah status ketersediaan lauk (Tersedia / Habis). Tidak dapat mengubah harga atau menghapus hidangan.
              </p>
            </div>

            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              Total {menuItems.length} Porsi Menu Terdaftar
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {menuItems.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-2">
                <div className="space-y-1.5">
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100">
                    <img
                      src={item.image_url || '/images/menu/rendang.jpg'}
                      alt={item.nama}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/hero-rumah-gadang.jpg';
                      }}
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{item.nama}</h4>
                    <p className="text-[10px] text-stone-500">{item.kategori}</p>
                    <p className="font-mono font-bold text-xs text-[#a61c1c] pt-0.5">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Tombol Toggle Stok Kasir */}
                <button
                  type="button"
                  onClick={() => onToggleStock && onToggleStock(item.id, item.stok_status)}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    item.stok_status === 'Tersedia'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-900 border border-red-300 hover:bg-red-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.stok_status === 'Tersedia' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                  <span>{item.stok_status}</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
