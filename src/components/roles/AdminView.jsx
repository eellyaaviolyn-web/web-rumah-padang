import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, UtensilsCrossed, Layers, Tag, Users, FileText, 
  Database, Plus, Trash2, Edit3, Search, AlertCircle, CheckCircle2, 
  TrendingUp, ExternalLink, Download, Clock, DollarSign, Package,
  ArrowUpRight, Sparkles, Filter, RefreshCw, ShieldCheck, Check,
  Phone, ShoppingBag, Eye, Lock, ArrowRight, Printer, AlertTriangle,
  ChevronRight, UserCheck, ChefHat, Bike
} from 'lucide-react';

export default function AdminView({
  activeTab,
  setActiveTab,
  menuItems,
  orders,
  staffList,
  dbInfo,
  schemas,
  onOpenAddMenu,
  onOpenEditPrice,
  onDeleteMenu,
  onToggleStock,
  handleExportCSV,
  adminUser,
  activeOperator,
  onUpdateOrderStatus,
  onAdvanceStatus,
  onSelectReceipt,
  onOpenAddStaff,
  onEditStaff
}) {
  // ================= 1. STATE INVENTARIS & STOK MASUK SUPPLIER =================
  const [inventoryList, setInventoryList] = useState([
    { id: 1, nama: 'Daging Sapi Segar Darek', satuan: 'Kg', stokSistem: 28, stokFisik: 28, minStok: 15, modalKg: 130000, supplier: 'PD. Daging Berkah Senen', supplier_telp: '0812-4433-2211', status: 'Aman' },
    { id: 2, nama: 'Ayam Pejantan Pilihan', satuan: 'Ekor', stokSistem: 45, stokFisik: 42, minStok: 20, modalKg: 18000, supplier: 'Unggas Mandiri Raya', supplier_telp: '0813-7788-9900', status: 'Aman' },
    { id: 3, nama: 'Beras Solok Bareh Asli', satuan: 'Karung (25kg)', stokSistem: 8, stokFisik: 8, minStok: 5, modalKg: 340000, supplier: 'Koperasi Tani Solok', supplier_telp: '0852-1122-3344', status: 'Aman' },
    { id: 4, nama: 'Kelapa Santan Murni', satuan: 'Butir', stokSistem: 60, stokFisik: 58, minStok: 30, modalKg: 7000, supplier: 'Kelapa Sawahlunto', supplier_telp: '0878-9900-1122', status: 'Aman' },
    { id: 5, nama: 'Cabai Merah Keriting Bukittinggi', satuan: 'Kg', stokSistem: 7, stokFisik: 6, minStok: 10, modalKg: 50000, supplier: 'Sayur Alahan Panjang', supplier_telp: '0878-9900-1122', status: 'Menipis (Alert!)' },
    { id: 6, nama: 'Minyak Goreng Kelapa Sawit', satuan: 'Liter', stokSistem: 35, stokFisik: 35, minStok: 15, modalKg: 17500, supplier: 'Distributor Sembako Jaya', supplier_telp: '0812-4433-2211', status: 'Aman' }
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
  const [dashboardOrderFilter, setDashboardOrderFilter] = useState('Semua'); // 'Semua' | 'Dalam Proses' | 'Selesai'

  // Perhitungan Metrik Operasional Harian
  const operatorName = activeOperator?.nama || adminUser?.nama || 'Vinzkie';
  const operatorPhone = adminUser?.no_telp || activeOperator?.no_telp || '0851-4741-3866';

  const totalOmzetHarian = useMemo(() => {
    return orders
      .filter(o => o.status !== 'Dibatalkan')
      .reduce((sum, o) => sum + Number(o.total_harga || 0), 0);
  }, [orders]);

  const activeCookingOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Sedang Dimasak' || o.status === 'Dibayar' || o.status === 'Menunggu Konfirmasi');
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Selesai');
  }, [orders]);

  const criticalInventory = useMemo(() => {
    return inventoryList.filter(i => i.status.includes('Alert'));
  }, [inventoryList]);

  const availableMenuCount = useMemo(() => {
    return menuItems.filter(m => m.stok_status === 'Tersedia').length;
  }, [menuItems]);

  const outOfStockMenuCount = useMemo(() => {
    return menuItems.filter(m => m.stok_status === 'Habis').length;
  }, [menuItems]);

  const filteredMenus = menuItems.filter(m => {
    const matchCat = categoryFilter === 'Semua' || m.kategori === categoryFilter;
    if (!matchCat) return false;
    if (!searchMenuQuery.trim()) return true;
    const q = searchMenuQuery.toLowerCase();
    return (m.nama || '').toLowerCase().includes(q) || (m.deskripsi || '').toLowerCase().includes(q);
  });

  const filteredDashboardOrders = useMemo(() => {
    if (dashboardOrderFilter === 'Dalam Proses') {
      return orders.filter(o => o.status === 'Sedang Dimasak' || o.status === 'Dibayar' || o.status === 'Menunggu Konfirmasi');
    }
    if (dashboardOrderFilter === 'Selesai') {
      return orders.filter(o => o.status === 'Selesai');
    }
    return orders;
  }, [orders, dashboardOrderFilter]);

  // Fungsi helper status order badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Dibayar':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Sedang Dimasak':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
      case 'Siap Dikirim':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= TAB 1: DASHBOARD OPERASIONAL UTAMA ADMIN ================= */}
      {activeTab === 'dashboard_ops' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* 1. HERO OPERATIONAL GREETING & RBAC BANNER */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#18100c] via-[#24140e] to-[#3a1a12] text-white p-6 sm:p-7 rounded-3xl border border-stone-800 shadow-xl">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-10 bottom-0 opacity-10 pointer-events-none hidden md:block">
              <ChefHat className="w-48 h-48 text-amber-200" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pusat Kendali Operasional Restoran & Dapur</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <h2 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide">
                  Selamat Bertugas, <span className="text-[#f5d796]">{operatorName}</span>
                </h2>
                
                <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                  Dashboard terpadu untuk pengawasan 5 pilar operasional: katalog menu & harga, ketersediaan stok bahan baku, promo diskon, jaringan rekanan supplier, dan pantauan pesanan harian.
                </p>

                {/* Badge Hak Akses RBAC & Proteksi */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5 text-[11px]">
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 text-stone-200 border border-white/10 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Kontak: <strong>{operatorPhone}</strong></span>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Akses Penuh Operasional & Gudang</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-500/30 flex items-center gap-1.5" title="Kebijakan keamanan sistem: Laba bersih & dividen hanya untuk Owner">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Laba Bersih & P&L Terproteksi Khusus Owner</span>
                  </span>
                </div>
              </div>

              {/* Box Quick Stat Hari Ini */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex md:flex-col justify-between items-center md:items-end gap-3 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-stone-300 font-bold block">
                    Total Pesanan Masuk
                  </span>
                  <div className="font-mono font-black text-3xl text-[#f5d796]">
                    {orders.length}
                  </div>
                  <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 md:justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{activeCookingOrders.length} dalam proses aktif</span>
                  </span>
                </div>

                <div className="text-left md:text-right border-l md:border-l-0 md:border-t border-white/15 pl-4 md:pl-0 md:pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-stone-300 font-bold block">
                    Omzet Kasir Hari Ini
                  </span>
                  <div className="font-mono font-bold text-lg sm:text-xl text-white">
                    Rp {totalOmzetHarian.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-stone-300">Penjualan kotor kasir</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BILAH AKSI CEPAT ADMIN (QUICK OPERATIONS TOOLBAR) */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a61c1c]" />
                <h4 className="font-serif font-black text-xs uppercase tracking-wider text-stone-800">
                  Aksi Cepat Pengelolaan Operasional:
                </h4>
              </div>
              <span className="text-[11px] text-stone-400">Pintasan tugas harian Admin</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button
                type="button"
                onClick={onOpenAddMenu}
                className="p-3 bg-red-50 hover:bg-red-100/80 text-[#a61c1c] border border-red-200/70 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group shadow-2xs"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition shrink-0" />
                <span>+ Menu Baru</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRestockModal(true)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/70 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group shadow-2xs"
              >
                <Package className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition shrink-0" />
                <span>+ Restock Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOpnameModal(true)}
                className="p-3 bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-200/70 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group shadow-2xs"
              >
                <Layers className="w-4 h-4 text-blue-700 group-hover:scale-110 transition shrink-0" />
                <span>Stock Opname</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddPromoModal(true)}
                className="p-3 bg-purple-50 hover:bg-purple-100/80 text-purple-800 border border-purple-200/70 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group shadow-2xs"
              >
                <Tag className="w-4 h-4 text-purple-700 group-hover:scale-110 transition shrink-0" />
                <span>+ Buat Promo</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group shadow-2xs"
              >
                <Download className="w-4 h-4 text-stone-600 group-hover:scale-110 transition shrink-0" />
                <span>Ekspor CSV</span>
              </button>

              <a
                href="http://localhost/phpmyadmin"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 text-center shadow-2xs"
              >
                <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>phpMyAdmin ➔</span>
              </a>
            </div>
          </div>

          {/* 3. 6 KARTU INTERAKTIF: 5 PILAR OPERASIONAL + BASIS DATA */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-sm text-stone-900 tracking-wide">
                Status 5 Pilar Operasional & Kendali Sistem
              </h3>
              <span className="text-[11px] text-stone-400">Klik kartu untuk beralih ke modul detail</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* PILAR 1: PRODUK & KATALOG MENU */}
              <div 
                onClick={() => setActiveTab && setActiveTab('menu_admin')}
                className="bg-white p-5 rounded-2xl border border-stone-200/90 hover:border-[#a61c1c]/50 hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#a61c1c] flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>1. Produk & Harga</span>
                    </span>
                    <span className="p-1 rounded-lg bg-red-50 text-[#a61c1c] group-hover:translate-x-1 transition">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="font-mono font-black text-2xl text-stone-900 mt-2">
                    {menuItems.length} <span className="text-xs font-sans text-stone-500 font-normal">Menu Terdaftar</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {availableMenuCount} hidangan tersedia siap saji, {outOfStockMenuCount} porsi habis sementara.
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#a61c1c] font-bold">
                  <span>Kelola Menu & Harga Jual</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* PILAR 2: STOK & INVENTARIS BAHAN */}
              <div 
                onClick={() => setActiveTab && setActiveTab('inventory')}
                className={`bg-white p-5 rounded-2xl border transition cursor-pointer group flex flex-col justify-between space-y-4 ${
                  criticalInventory.length > 0 
                    ? 'border-amber-300 bg-amber-50/15 hover:border-amber-400 hover:shadow-md' 
                    : 'border-stone-200/90 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      criticalInventory.length > 0 ? 'text-amber-800' : 'text-emerald-800'
                    }`}>
                      <Layers className="w-3.5 h-3.5" />
                      <span>2. Stok & Bahan Dapur</span>
                    </span>
                    <span className={`p-1 rounded-lg group-hover:translate-x-1 transition ${
                      criticalInventory.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="font-mono font-black text-2xl text-stone-900 mt-2">
                    {inventoryList.length} <span className="text-xs font-sans text-stone-500 font-normal">Komoditas Bahan</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {criticalInventory.length > 0 ? (
                      <strong className="text-amber-700">{criticalInventory.length} bahan menipis perlu restock!</strong>
                    ) : (
                      <span className="text-emerald-700 font-semibold">Semua pasokan bahan dalam batas aman.</span>
                    )}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 group-hover:text-amber-800">
                  <span>Catat Restock & Stock Opname</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* PILAR 3: DISKON & PROMO KUPOON */}
              <div 
                onClick={() => setActiveTab && setActiveTab('promo')}
                className="bg-white p-5 rounded-2xl border border-stone-200/90 hover:border-purple-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>3. Diskon & Promo Kupon</span>
                    </span>
                    <span className="p-1 rounded-lg bg-purple-50 text-purple-800 group-hover:translate-x-1 transition">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="font-mono font-black text-2xl text-stone-900 mt-2">
                    {promoList.length} <span className="text-xs font-sans text-stone-500 font-normal">Kupon Aktif</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Program diskon reguler, voucher VIP member, dan kupon potongan nominal kasir.
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-purple-800 font-bold">
                  <span>Atur Diskon & Jadwal Promo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* PILAR 4: PELANGGAN & SUPPLIER */}
              <div 
                onClick={() => setActiveTab && setActiveTab('partners')}
                className="bg-white p-5 rounded-2xl border border-stone-200/90 hover:border-blue-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>4. Pelanggan & Supplier</span>
                    </span>
                    <span className="p-1 rounded-lg bg-blue-50 text-blue-800 group-hover:translate-x-1 transition">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="font-mono font-black text-2xl text-stone-900 mt-2">
                    {supplierList.length} <span className="text-xs font-sans text-stone-500 font-normal">Supplier</span> • {customerDatabase.length} <span className="text-xs font-sans text-stone-500 font-normal">Pelanggan</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Mitra pasokan Senen, Kramat Jati, Solok, serta database loyalitas pelanggan.
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-blue-800 font-bold">
                  <span>Buka Direktori Mitra Resto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* PILAR 5: LAPORAN OPERASIONAL HARIAN */}
              <div 
                onClick={() => setActiveTab && setActiveTab('daily_report')}
                className="bg-white p-5 rounded-2xl border border-stone-200/90 hover:border-emerald-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>5. Laporan Harian Kasir</span>
                    </span>
                    <span className="p-1 rounded-lg bg-emerald-50 text-emerald-800 group-hover:translate-x-1 transition">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="font-mono font-black text-2xl text-stone-900 mt-2">
                    {completedOrders.length} / {orders.length} <span className="text-xs font-sans text-stone-500 font-normal">Pesanan Lunas</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Rekapitulasi penjualan shift kasir, pergerakan barang keluar, dan log transaksi.
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span>Lihat Rekap Penjualan Harian</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* DUKUNGAN BASIS DATA: MYSQL & PHPMYADMIN */}
              <div 
                onClick={() => setActiveTab && setActiveTab('database')}
                className="bg-white p-5 rounded-2xl border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Relasional Database MySQL</span>
                    </span>
                    <span className="p-1 rounded-lg bg-stone-100 text-stone-700 group-hover:translate-x-1 transition">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="font-mono font-black text-2xl text-stone-900 mt-2">
                    6 <span className="text-xs font-sans text-stone-500 font-normal">Tabel Skema Terhubung</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 font-mono">
                    {dbInfo.database} ({dbInfo.engine})
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-800 font-bold">
                  <span>Inspeksi Skema & phpMyAdmin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          </div>

          {/* 4. ALERT BAHAN MENIPIS & TOMBOL RESTOCK SUPPLIER CEPAT */}
          {criticalInventory.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="font-serif font-black text-sm text-amber-900">
                      Peringatan Rantai Pasok: {criticalInventory.length} Bahan Baku Mendekati Batas Kritis!
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Segera koordinasikan pengiriman bahan baku ke supplier untuk menghindari kekurangan hidangan di dapur siang ini.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const firstCrit = criticalInventory[0];
                    setRestockForm({
                      bahanId: firstCrit.id,
                      jumlah: String(firstCrit.minStok),
                      supplier: firstCrit.supplier,
                      totalBiaya: ''
                    });
                    setShowRestockModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Restock Cepat Sekarang</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {criticalInventory.map(crit => (
                  <div key={crit.id} className="p-3 bg-white/80 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-stone-900">{crit.nama}</div>
                      <div className="text-[11px] text-stone-600 font-mono">
                        Sisa Fisik: <strong className="text-red-700">{crit.stokFisik} {crit.satuan}</strong> (Batas Min: {crit.minStok} {crit.satuan})
                      </div>
                      <div className="text-[10px] text-stone-500">Supplier: {crit.supplier}</div>
                    </div>

                    <a
                      href={`https://wa.me/62${(crit.supplier_telp || '0851-4741-3866').replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent(`Halo ${crit.supplier}, kami dari Warung Padang Bundo Kanduang ingin memesan restock bahan: ${crit.nama}. Mohon konfirmasi ketersediaan.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Order WA</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. LIVE PANTAUAN ANTRIAN DAPUR & PESANAN HARI INI */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-[#a61c1c] text-[10px] font-bold mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Real-time Kitchen & POS Feed</span>
                </div>
                <h3 className="font-serif font-black text-base text-stone-900">
                  Antrean Pesanan Kasir & Pantauan Dapur Hari Ini
                </h3>
              </div>

              {/* Filter Tabs Antrean */}
              <div className="flex items-center gap-1.5 text-xs bg-stone-100 p-1 rounded-xl">
                {['Semua', 'Dalam Proses', 'Selesai'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setDashboardOrderFilter(f)}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      dashboardOrderFilter === f 
                        ? 'bg-white text-stone-900 shadow-2xs' 
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabel Antrean Pesanan */}
            {filteredDashboardOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Tidak ada pesanan untuk filter "{dashboardOrderFilter}" saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[720px]">
                  <thead className="bg-stone-50 text-stone-500 font-mono border-b border-stone-200">
                    <tr>
                      <th className="p-3">No. Pesanan</th>
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Tamu & Meja</th>
                      <th className="p-3">Layanan</th>
                      <th className="p-3">Rincian Hidangan</th>
                      <th className="p-3">Total Belanja</th>
                      <th className="p-3">Status Dapur</th>
                      <th className="p-3 text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredDashboardOrders.slice(0, 8).map(o => (
                      <tr key={o.id} className="hover:bg-stone-50 transition">
                        <td className="p-3 font-mono font-bold text-[#a61c1c]">
                          #{o.nomor_pesanan}
                        </td>
                        <td className="p-3 text-stone-500 font-mono text-[11px]">
                          {o.created_at ? new Date(o.created_at).toLocaleTimeString('id-ID') : '-'}
                        </td>
                        <td className="p-3 font-bold text-stone-900">
                          {o.nama_pelanggan}
                          {o.nomor_meja && <span className="block text-[10px] text-stone-400 font-normal">Meja {o.nomor_meja}</span>}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                            {o.tipe_layanan}
                          </span>
                        </td>
                        <td className="p-3 max-w-[220px] truncate text-stone-700" title={(o.items || []).map(i => `${i.nama || i.nama_item} (${i.jumlah}x)`).join(', ')}>
                          {(o.items || []).map(i => `${i.nama || i.nama_item} (${i.jumlah}x)`).join(', ')}
                        </td>
                        <td className="p-3 font-mono font-bold text-stone-900">
                          Rp {Number(o.total_harga || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusBadge(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onSelectReceipt && (
                              <button
                                type="button"
                                onClick={() => onSelectReceipt(o)}
                                className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer"
                                title="Cetak struk pesanan"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {onAdvanceStatus && o.status !== 'Selesai' && o.status !== 'Dibatalkan' && (
                              <button
                                type="button"
                                onClick={() => onAdvanceStatus(o)}
                                className="px-2.5 py-1 bg-[#a61c1c] hover:bg-[#881414] text-white rounded-lg font-bold text-[10px] transition cursor-pointer shadow-2xs"
                                title="Lanjutkan status dapur"
                              >
                                {o.status === 'Menunggu Konfirmasi' ? 'Konfirmasi' : o.status === 'Dibayar' ? 'Masak' : o.status === 'Sedang Dimasak' ? 'Sajikan' : 'Selesai'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredDashboardOrders.length > 8 && (
              <div className="pt-2 text-center border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('daily_report')}
                  className="text-xs font-bold text-[#a61c1c] hover:underline cursor-pointer"
                >
                  Lihat Seluruh {orders.length} Transaksi di Laporan Harian ➔
                </button>
              </div>
            )}
          </div>

          {/* 6. REKAP KRU RESTORAN & PEMBAGIAN SHIFT HARI INI */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-black text-sm text-stone-900">
                  Kru Restoran & Pembagian Shift Kerja
                </h4>
                <p className="text-[11px] text-stone-500">
                  Personel bertugas di meja kasir POS, dapur utama, dan pramusaji hari ini.
                </p>
              </div>

              {onOpenAddStaff && (
                <button
                  type="button"
                  onClick={onOpenAddStaff}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  + Tambah Kru
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {staffList.map(st => (
                <div key={st.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-stone-900">{st.nama}</div>
                    <div className="text-[10px] text-stone-500">{st.role} • {st.shift}</div>
                    <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-stone-400" />
                      <span>{st.no_telp || '0851-4741-3866'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-600'}`}>
                      {st.status}
                    </span>
                    {onEditStaff && (
                      <button
                        type="button"
                        onClick={() => onEditStaff(st)}
                        className="text-[10px] text-stone-500 hover:text-[#a61c1c] underline cursor-pointer"
                      >
                        Edit Kru
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. BANNER KEBIJAKAN HAK AKSES SISTEM (SECURITY COMPLIANCE) */}
          <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
            <Lock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-stone-800">Kebijakan Hak Akses & Privasi Keuangan Restoran:</span>
              <p className="text-[11px] leading-relaxed text-stone-500">
                Sebagai <strong>Admin Pengelola Operasional (Vinzkie)</strong>, Anda memiliki hak penuh mengelola produk menu, menetapkan harga jual & harga modal, mengatur inventaris bahan masuk/keluar, kupon diskon, direktori supplier, serta memantau pesanan operasional kasir harian. Untuk menjaga tata kelola usaha, laporan laba bersih akumulatif (P&L dividen) dan pengaturan sistem finansial tingkat lanjut secara otomatis dilindungi di portal <strong>Owner Resto</strong>.
              </p>
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
