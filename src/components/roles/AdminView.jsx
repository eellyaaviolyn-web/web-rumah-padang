import React, { useState } from 'react';
import { 
  LayoutDashboard, UtensilsCrossed, Layers, Tag, Users, FileText, 
  Database, Plus, Trash2, Edit3, Search, AlertCircle, CheckCircle2, 
  TrendingUp, ExternalLink, Download, Clock, DollarSign, Package,
  ArrowUpRight, Sparkles, Filter, RefreshCw
} from 'lucide-react';

export default function AdminView({
  activeTab,
  menuItems,
  orders,
  staffList,
  dbInfo,
  schemas,
  onOpenAddMenu,
  onOpenEditPrice,
  onDeleteMenu,
  onToggleStock,
  handleExportCSV
}) {
  // ================= 1. STATE INVENTARIS & STOK MASUK SUPPLIER =================
  const [inventoryList, setInventoryList] = useState([
    { id: 1, nama: 'Daging Sapi Segar Darek', satuan: 'Kg', stokSistem: 28, stokFisik: 28, minStok: 15, modalKg: 130000, supplier: 'PD. Daging Berkah Senen', status: 'Aman' },
    { id: 2, nama: 'Ayam Pejantan Pilihan', satuan: 'Ekor', stokSistem: 45, stokFisik: 42, minStok: 20, modalKg: 18000, supplier: 'Unggas Mandiri Raya', status: 'Aman' },
    { id: 3, nama: 'Beras Solok Bareh Asli', satuan: 'Karung (25kg)', stokSistem: 8, stokFisik: 8, minStok: 5, modalKg: 340000, supplier: 'Koperasi Tani Solok', status: 'Aman' },
    { id: 4, nama: 'Kelapa Santan Murni', satuan: 'Butir', stokSistem: 60, stokFisik: 58, minStok: 30, modalKg: 7000, supplier: 'Kelapa Sawahlunto', status: 'Aman' },
    { id: 5, nama: 'Cabai Merah Keriting Bukittinggi', satuan: 'Kg', stokSistem: 7, stokFisik: 6, minStok: 10, modalKg: 50000, supplier: 'Sayur Alahan Panjang', status: 'Menipis (Alert!)' },
    { id: 6, nama: 'Minyak Goreng Kelapa Sawit', satuan: 'Liter', stokSistem: 35, stokFisik: 35, minStok: 15, modalKg: 17500, supplier: 'Distributor Sembako Jaya', status: 'Aman' }
  ]);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({
    bahanId: 1,
    jumlah: '',
    supplier: 'PD. Daging Berkah Senen',
    totalBiaya: ''
  });
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [opnameForm, setOpnameForm] = useState({
    bahanId: 1,
    stokFisikAktual: '',
    catatanSelisih: ''
  });

  // ================= 2. STATE PROMO & KUPON DISKON =================
  const [promoList, setPromoList] = useState([
    { id: 1, kode: 'PADANG10', judul: 'Diskon 10% Semua Menu', tipe: 'Persen', nilai: 10, minBelanja: 50000, status: 'Aktif', berlaku: '31 Des 2026' },
    { id: 2, kode: 'HEMAT5K', judul: 'Potongan Rp 5.000 Nasi Kotak', tipe: 'Nominal', nilai: 5000, minBelanja: 35000, status: 'Aktif', berlaku: '30 Nov 2026' },
    { id: 3, kode: 'MEMBERVIP', judul: 'Diskon Spesial Member VIP', tipe: 'Persen', nilai: 15, minBelanja: 100000, status: 'Aktif', berlaku: '31 Des 2026' },
    { id: 4, kode: 'JUMATBERKAH', judul: 'Gratis Teh Talua / Minuman', tipe: 'Nominal', nilai: 18000, minBelanja: 80000, status: 'Aktif', berlaku: 'Setiap Jumat' }
  ]);
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [newPromoForm, setNewPromoForm] = useState({
    kode: '',
    judul: '',
    tipe: 'Persen',
    nilai: '',
    minBelanja: '',
    berlaku: '31 Des 2026'
  });

  // ================= 3. STATE PELANGGAN & SUPPLIER =================
  const [partnersTab, setPartnersTab] = useState('suppliers'); // 'customers' | 'suppliers'
  const [supplierList, setSupplierList] = useState([
    { id: 1, nama: 'PD. Daging Berkah Senen', kontak: 'H. Syamsul', no_telp: '0812-4433-2211', produk: 'Daging Sapi Darek & Sandung Lamur', alamat: 'Pasar Senen Blok III Lt. 1, Jakarta Pusat' },
    { id: 2, nama: 'Unggas Mandiri Raya', kontak: 'Pak Joko', no_telp: '0813-7788-9900', produk: 'Ayam Pejantan Segar & Telur Bebek', alamat: 'Jl. Rawa Belong No. 8, Jakarta Barat' },
    { id: 3, nama: 'Koperasi Tani Solok', kontak: 'Uni Nur', no_telp: '0852-1122-3344', produk: 'Beras Solok Bareh Cantik Asli', alamat: 'Jl. Ahmad Yani, Kota Solok, Sumatera Barat' },
    { id: 4, nama: 'Sayur Alahan Panjang', kontak: 'Mak Buyung', no_telp: '0878-9900-1122', produk: 'Cabai Merah, Daun Singkong & Rempah', alamat: 'Pasar Induk Kramat Jati, Jakarta Timur' }
  ]);
  const [customerDatabase] = useState([
    { id: 1, nama: 'Bpk. Hendra Gunawan', no_telp: '0812-9876-5432', totalKunjungan: 18, totalOmzet: 1250000, tier: 'Gold' },
    { id: 2, nama: 'Ibu Siti Rahmawati', no_telp: '0813-1122-3344', totalKunjungan: 9, totalOmzet: 720000, tier: 'Silver' },
    { id: 3, nama: 'dr. Andi Pratama', no_telp: '0811-2233-4455', totalKunjungan: 24, totalOmzet: 2450000, tier: 'VIP Platinum' },
    { id: 4, nama: 'Sdr. Dimas Prasetyo', no_telp: '0857-4455-6677', totalKunjungan: 6, totalOmzet: 380000, tier: 'Silver' }
  ]);

  // Search & Filter
  const [searchMenuQuery, setSearchMenuQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  const filteredMenus = menuItems.filter(m => {
    const matchCat = categoryFilter === 'Semua' || m.kategori === categoryFilter;
    if (!matchCat) return false;
    if (!searchMenuQuery.trim()) return true;
    const q = searchMenuQuery.toLowerCase();
    return (m.nama || '').toLowerCase().includes(q) || (m.deskripsi || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">

      {/* ================= TAB 1: DASHBOARD OPERASIONAL HARIAN ================= */}
      {activeTab === 'dashboard_ops' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold mb-1">
                <span>Manajemen Operasional Restoran</span>
              </div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Dashboard Operasional & Pantauan Dapur
              </h3>
              <p className="text-xs text-stone-500">
                Monitoring pesanan aktif, ketersediaan bahan dapur, dan kinerja kru per shift hari ini.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-mono font-bold text-stone-700">
                {orders.length} Total Pesanan Masuk
              </span>
            </div>
          </div>

          {/* 4 Cards Ringkasan Operasional */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Pesanan Dalam Proses</span>
              <div className="font-mono font-black text-2xl text-blue-700 mt-1">
                {orders.filter(o => o.status === 'Sedang Dimasak' || o.status === 'Dibayar').length}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Sedang dimasak / disiapkan di nampan</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Pesanan Selesai</span>
              <div className="font-mono font-black text-2xl text-emerald-700 mt-1">
                {orders.filter(o => o.status === 'Selesai').length}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Sudah lunas & disajikan ke tamu</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Porsi Terdaftar</span>
              <div className="font-mono font-black text-2xl text-[#a61c1c] mt-1">
                {menuItems.length}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Katalog hidangan aktif di sistem</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Alert Stok Menipis</span>
              <div className="font-mono font-black text-2xl text-amber-700 mt-1">
                {inventoryList.filter(i => i.status.includes('Alert')).length} Bahan
              </div>
              <p className="text-[10px] text-amber-800 mt-0.5">Segera lakukan pemesanan ke supplier</p>
            </div>
          </div>

          {/* Alert Box Bahan Menipis */}
          {inventoryList.filter(i => i.status.includes('Alert')).length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-amber-900">Peringatan Stok Minimum Bahan Baku:</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Bahan <strong>Cabai Merah Keriting Bukittinggi</strong> tersisa 6 Kg (batas minimum: 10 Kg). Hubungi supplier <strong>Sayur Alahan Panjang</strong> untuk pengiriman segera.
                </p>
              </div>
            </div>
          )}

          {/* Rekap Kinerja Kasir & Kru Bertugas */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
            <h4 className="font-serif font-black text-sm text-stone-900">
              Kru Restoran & Pembagian Shift Kerja
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {staffList.map(st => (
                <div key={st.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-stone-900">{st.nama}</div>
                    <div className="text-[10px] text-stone-500">{st.role} • {st.shift}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                    {st.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: MANAJEMEN PRODUK & HARGA (LENGKAP CRUD) ================= */}
      {activeTab === 'menu_admin' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Manajemen Produk & Harga Hidangan
              </h3>
              <p className="text-xs text-stone-500">
                Admin berwenang menambah, mengubah harga jual, mengedit rincian, dan menghapus menu hidangan dari database.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAddMenu}
              className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Hidangan Baru</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchMenuQuery}
                onChange={(e) => setSearchMenuQuery(e.target.value)}
                placeholder="Cari hidangan menu..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
              {['Semua', 'Daging', 'Ayam', 'Ikan & Laut', 'Sayuran', 'Pelengkap', 'Minuman'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat ? 'bg-[#18100c] text-white' : 'bg-stone-50 text-stone-600 border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table List CRUD Menu */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-stone-50 text-stone-500 font-mono border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Foto & Nama Menu</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Harga Jual</th>
                  <th className="p-3.5">Status Stok</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMenus.map(dish => (
                  <tr key={dish.id} className="hover:bg-stone-50 transition">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={dish.image_url || '/images/menu/rendang.jpg'}
                        alt={dish.nama}
                        className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/hero-rumah-gadang.jpg';
                        }}
                      />
                      <div>
                        <div className="font-bold text-stone-900">{dish.nama}</div>
                        <div className="text-[10px] text-stone-400 line-clamp-1">{dish.deskripsi}</div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 border rounded font-semibold text-[11px]">
                        {dish.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-stone-900">
                      Rp {Number(dish.harga).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => onToggleStock && onToggleStock(dish.id, dish.stok_status)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          dish.stok_status === 'Tersedia'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-red-100 text-red-900 border border-red-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${dish.stok_status === 'Tersedia' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <span>{dish.stok_status}</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenEditPrice && onOpenEditPrice(dish)}
                          className="p-1.5 text-stone-600 hover:text-[#a61c1c] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                          title="Edit harga hidangan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMenu && onDeleteMenu(dish.id, dish.nama)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus hidangan dari database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ================= TAB 3: STOK & INVENTARIS BAHAN (RESTOCK & STOCK OPNAME) ================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Manajemen Stok & Inventaris Bahan Dapur
              </h3>
              <p className="text-xs text-stone-500">
                Catat barang masuk dari supplier (restock), lakukan stock opname fisik vs sistem, dan pantau stok minimum.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOpnameModal(true)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                ⚖️ Stock Opname Fisik
              </button>
              <button
                type="button"
                onClick={() => setShowRestockModal(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Barang Masuk (Restock)</span>
              </button>
            </div>
          </div>

          {/* Table Inventaris Bahan */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-stone-50 text-stone-500 font-mono border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Nama Bahan Baku</th>
                  <th className="p-3.5">Stok Sistem</th>
                  <th className="p-3.5">Stok Fisik Aktual</th>
                  <th className="p-3.5">Batas Minimum</th>
                  <th className="p-3.5">Supplier Utama</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inventoryList.map(item => (
                  <tr key={item.id} className="hover:bg-stone-50 transition">
                    <td className="p-3.5 font-bold text-stone-900">{item.nama}</td>
                    <td className="p-3.5 font-mono">{item.stokSistem} {item.satuan}</td>
                    <td className="p-3.5 font-mono font-bold text-stone-900">{item.stokFisik} {item.satuan}</td>
                    <td className="p-3.5 font-mono text-stone-500">{item.minStok} {item.satuan}</td>
                    <td className="p-3.5 text-stone-600">{item.supplier}</td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status.includes('Alert') 
                          ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Restock Barang Masuk */}
          {showRestockModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-serif font-black text-sm text-stone-900">Catat Barang Masuk dari Supplier</h4>
                  <button onClick={() => setShowRestockModal(false)} className="text-stone-400">✕</button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Pilih Bahan Baku</label>
                    <select
                      value={restockForm.bahanId}
                      onChange={(e) => setRestockForm(p => ({ ...p, bahanId: Number(e.target.value) }))}
                      className="w-full border p-2 rounded-lg bg-stone-50"
                    >
                      {inventoryList.map(i => <option key={i.id} value={i.id}>{i.nama} ({i.satuan})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Jumlah Masuk</label>
                    <input
                      type="number"
                      value={restockForm.jumlah}
                      onChange={(e) => setRestockForm(p => ({ ...p, jumlah: e.target.value }))}
                      placeholder="Contoh: 15"
                      className="w-full border p-2 rounded-lg bg-stone-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Nama Supplier</label>
                    <input
                      type="text"
                      value={restockForm.supplier}
                      onChange={(e) => setRestockForm(p => ({ ...p, supplier: e.target.value }))}
                      className="w-full border p-2 rounded-lg bg-stone-50"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowRestockModal(false)} className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs">Batal</button>
                  <button
                    onClick={() => {
                      if (!restockForm.jumlah) return alert('Masukkan jumlah barang masuk.');
                      setInventoryList(prev => prev.map(i => {
                        if (i.id === restockForm.bahanId) {
                          const next = i.stokSistem + Number(restockForm.jumlah);
                          return { ...i, stokSistem: next, stokFisik: next, status: 'Aman' };
                        }
                        return i;
                      }));
                      setShowRestockModal(false);
                      alert('Barang masuk berhasil dicatat ke inventaris!');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 text-white font-bold rounded-lg text-xs"
                  >
                    Simpan Stok Masuk
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Stock Opname */}
          {showOpnameModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-serif font-black text-sm text-stone-900">Penyesuaian Fisik (Stock Opname)</h4>
                  <button onClick={() => setShowOpnameModal(false)} className="text-stone-400">✕</button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Pilih Bahan</label>
                    <select
                      value={opnameForm.bahanId}
                      onChange={(e) => setOpnameForm(p => ({ ...p, bahanId: Number(e.target.value) }))}
                      className="w-full border p-2 rounded-lg bg-stone-50"
                    >
                      {inventoryList.map(i => <option key={i.id} value={i.id}>{i.nama} (Sistem: {i.stokSistem} {i.satuan})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Hasil Hitung Fisik Aktual</label>
                    <input
                      type="number"
                      value={opnameForm.stokFisikAktual}
                      onChange={(e) => setOpnameForm(p => ({ ...p, stokFisikAktual: e.target.value }))}
                      placeholder="Masukkan stok fisik di gudang..."
                      className="w-full border p-2 rounded-lg bg-stone-50 font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowOpnameModal(false)} className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs">Batal</button>
                  <button
                    onClick={() => {
                      if (!opnameForm.stokFisikAktual) return alert('Masukkan hasil hitung fisik.');
                      const val = Number(opnameForm.stokFisikAktual);
                      setInventoryList(prev => prev.map(i => {
                        if (i.id === opnameForm.bahanId) {
                          const statusNext = val < i.minStok ? 'Menipis (Alert!)' : 'Aman';
                          return { ...i, stokFisik: val, stokSistem: val, status: statusNext };
                        }
                        return i;
                      }));
                      setShowOpnameModal(false);
                      alert('Stock opname berhasil diperbarui!');
                    }}
                    className="px-3.5 py-1.5 bg-[#a61c1c] text-white font-bold rounded-lg text-xs"
                  >
                    Simpan Penyesuaian
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 4: DISKON & PROMO KUPON ================= */}
      {activeTab === 'promo' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Manajemen Diskon, Kupon & Promo Penjualan
              </h3>
              <p className="text-xs text-stone-500">
                Atur jadwal promo khusus, kupon diskon persentase / potongan nominal, dan minimal belanja pelanggan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPromoModal(true)}
              className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Kupon Promo Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {promoList.map(pr => (
              <div key={pr.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs px-2.5 py-1 bg-red-50 text-[#a61c1c] border border-red-200 rounded-lg">
                      {pr.kode}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {pr.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-stone-900 pt-1">{pr.judul}</h4>
                  <p className="text-xs text-stone-500">
                    Nilai Diskon: <strong className="text-stone-900">{pr.tipe === 'Persen' ? `${pr.nilai}%` : `Rp ${pr.nilai.toLocaleString('id-ID')}`}</strong>
                  </p>
                  <p className="text-[11px] text-stone-400">Min. Belanja: Rp {pr.minBelanja.toLocaleString('id-ID')}</p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Berlaku s/d: {pr.berlaku}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoList(prev => prev.filter(p => p.id !== pr.id));
                    }}
                    className="text-stone-400 hover:text-red-600 cursor-pointer"
                    title="Hapus promo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Tambah Promo */}
          {showAddPromoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-serif font-black text-sm text-stone-900">Buat Kode Promo Baru</h4>
                  <button onClick={() => setShowAddPromoModal(false)} className="text-stone-400">✕</button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Kode Promo (Huruf Kapital)</label>
                    <input
                      type="text"
                      value={newPromoForm.kode}
                      onChange={(e) => setNewPromoForm(p => ({ ...p, kode: e.target.value.toUpperCase() }))}
                      placeholder="CONTOH: PADANG20"
                      className="w-full border p-2 rounded-lg bg-stone-50 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-600 block mb-1">Judul / Keterangan Promo</label>
                    <input
                      type="text"
                      value={newPromoForm.judul}
                      onChange={(e) => setNewPromoForm(p => ({ ...p, judul: e.target.value }))}
                      placeholder="Contoh: Diskon 20% Hari Kemerdekaan"
                      className="w-full border p-2 rounded-lg bg-stone-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-stone-600 block mb-1">Tipe</label>
                      <select
                        value={newPromoForm.tipe}
                        onChange={(e) => setNewPromoForm(p => ({ ...p, tipe: e.target.value }))}
                        className="w-full border p-2 rounded-lg bg-stone-50"
                      >
                        <option value="Persen">Persentase (%)</option>
                        <option value="Nominal">Nominal (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-stone-600 block mb-1">Besaran Nilai</label>
                      <input
                        type="number"
                        value={newPromoForm.nilai}
                        onChange={(e) => setNewPromoForm(p => ({ ...p, nilai: e.target.value }))}
                        placeholder={newPromoForm.tipe === 'Persen' ? 'Contoh: 10' : '10000'}
                        className="w-full border p-2 rounded-lg bg-stone-50 font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddPromoModal(false)} className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs">Batal</button>
                  <button
                    onClick={() => {
                      if (!newPromoForm.kode || !newPromoForm.nilai) return alert('Lengkapi data promo.');
                      const itemObj = {
                        id: Date.now(),
                        kode: newPromoForm.kode,
                        judul: newPromoForm.judul || newPromoForm.kode,
                        tipe: newPromoForm.tipe,
                        nilai: Number(newPromoForm.nilai),
                        minBelanja: 50000,
                        status: 'Aktif',
                        berlaku: newPromoForm.berlaku
                      };
                      setPromoList(p => [itemObj, ...p]);
                      setShowAddPromoModal(false);
                      alert('Kode promo baru berhasil diaktifkan!');
                    }}
                    className="px-3.5 py-1.5 bg-[#a61c1c] text-white font-bold rounded-lg text-xs"
                  >
                    Simpan Promo
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 5: DATABASE PELANGGAN & SUPPLIER ================= */}
      {activeTab === 'partners' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Database Pelanggan & Rekanan Supplier
              </h3>
              <p className="text-xs text-stone-500">
                Kelola kontak supplier bahan baku untuk pasokan dapur serta direktori pelanggan tetap restoran.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPartnersTab('suppliers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  partnersTab === 'suppliers' ? 'bg-[#18100c] text-white shadow' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Daftar Supplier ({supplierList.length})
              </button>
              <button
                type="button"
                onClick={() => setPartnersTab('customers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  partnersTab === 'customers' ? 'bg-[#18100c] text-white shadow' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Database Pelanggan ({customerDatabase.length})
              </button>
            </div>
          </div>

          {partnersTab === 'suppliers' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplierList.map(sup => (
                <div key={sup.id} className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#a61c1c]">Supplier Resmi</span>
                    <span className="text-xs font-mono font-bold text-stone-600">{sup.no_telp}</span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">{sup.nama}</h4>
                  <p className="text-xs text-stone-600">Kontak Person: <strong>{sup.kontak}</strong></p>
                  <p className="text-xs text-stone-500">Komoditas: {sup.produk}</p>
                  <p className="text-[11px] text-stone-400 border-t pt-2">{sup.alamat}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/90 overflow-x-auto shadow-sm">
              <table className="w-full text-xs text-left min-w-[650px]">
                <thead className="bg-stone-50 text-stone-500 font-mono border-b">
                  <tr>
                    <th className="p-3.5">Nama Pelanggan</th>
                    <th className="p-3.5">No. Telepon / WA</th>
                    <th className="p-3.5">Total Kunjungan</th>
                    <th className="p-3.5">Total Belanja</th>
                    <th className="p-3.5 text-right">Tingkatan Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customerDatabase.map(c => (
                    <tr key={c.id}>
                      <td className="p-3.5 font-bold text-stone-900">{c.nama}</td>
                      <td className="p-3.5 font-mono text-stone-600">{c.no_telp}</td>
                      <td className="p-3.5">{c.totalKunjungan} Transaksi</td>
                      <td className="p-3.5 font-mono font-bold text-stone-900">Rp {c.totalOmzet.toLocaleString('id-ID')}</td>
                      <td className="p-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          {c.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 6: LAPORAN OPERASIONAL HARIAN ================= */}
      {activeTab === 'daily_report' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Laporan Operasional Harian & Rekap Shift Kasir
              </h3>
              <p className="text-xs text-stone-500">
                Laporan rekapitulasi penjualan harian, pergerakan barang, dan performa transaksi per kasir.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Rekap Harian (CSV)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-stone-50 text-stone-500 font-mono border-b">
                <tr>
                  <th className="p-3.5">No. Pesanan</th>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Pelanggan</th>
                  <th className="p-3.5">Tipe Layanan</th>
                  <th className="p-3.5">Rincian Menu</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Total Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 15).map(o => (
                  <tr key={o.id}>
                    <td className="p-3.5 font-mono font-bold text-[#a61c1c]">#{o.nomor_pesanan}</td>
                    <td className="p-3.5 text-stone-500 font-mono">{o.created_at ? new Date(o.created_at).toLocaleTimeString('id-ID') : '-'}</td>
                    <td className="p-3.5 font-bold text-stone-900">{o.nama_pelanggan}</td>
                    <td className="p-3.5 text-stone-600">{o.tipe_layanan}</td>
                    <td className="p-3.5 max-w-[200px] truncate text-stone-700">
                      {(o.items || []).map(i => `${i.nama || i.nama_item} (${i.jumlah}x)`).join(', ')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-stone-900">
                      Rp {Number(o.total_harga || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ================= TAB 7: DATABASE & PHPMYADMIN (TUGAS SMK) ================= */}
      {activeTab === 'database' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Arsitektur Database Relasional MySQL (6 Tabel)</h3>
              <p className="text-xs text-stone-500">
                Engine: <strong className="text-emerald-700 font-mono">{dbInfo.engine}</strong> • Database: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-[#a61c1c]">{dbInfo.database}</code>
              </p>
            </div>

            <a
              href="http://localhost/phpmyadmin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Panel phpMyAdmin ➔</span>
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'menu', count: menuItems.length, desc: 'Daftar Menu' },
              { name: 'outlet', count: 3, desc: 'Cabang Outlet' },
              { name: 'pesanan', count: orders.length, desc: 'Header Pesanan' },
              { name: 'pesanan_items', count: orders.reduce((sum, o) => sum + (o.items?.length || 0), 0), desc: 'Detail Nampan' },
              { name: 'pengeluaran', count: 5, desc: 'Beban Biaya' },
              { name: 'staf', count: staffList.length, desc: 'Akun Kru Kasir' },
            ].map((tbl, i) => (
              <div key={i} className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">{tbl.name}</span>
                <div className="font-mono font-black text-xl text-[#a61c1c]">{tbl.count}</div>
                <div className="text-[10px] text-stone-500 truncate">{tbl.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemas.map((s, idx) => (
              <div key={idx} className="bg-[#111827] text-stone-200 rounded-2xl border border-stone-800 overflow-hidden shadow">
                <div className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#f5d796]">Tabel: {s.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">{dbInfo.engine}</span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-stone-300 overflow-x-auto leading-relaxed max-h-64">
                  {s.sql}
                </pre>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
