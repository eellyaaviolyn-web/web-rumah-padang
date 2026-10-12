import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Receipt, UtensilsCrossed, Wallet, Users, FileText, 
  Database, Search, Plus, Trash2, Edit3, Printer, Phone, 
  ExternalLink, LogOut, CheckCircle2, Clock, Flame, 
  ChefHat, Bike, X, ChevronRight, Menu as MenuIcon, 
  RefreshCw, DollarSign, TrendingUp, TrendingDown, ShieldCheck, Check,
  Sparkles, Download, Volume2, VolumeX, Filter, Grid, List, 
  ArrowUpRight, PieChart, Layers, AlertCircle
} from 'lucide-react';
import ReceiptModal from './ReceiptModal';

export default function AdminPortal({ onBackToStore, onLogout, adminUser }) {
  // Navigation: 'dashboard' | 'orders' | 'menu' | 'finance' | 'staff' | 'reports' | 'database'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // View Layout Toggles
  const [ordersViewMode, setOrdersViewMode] = useState('cards'); // 'cards' | 'table'
  const [menuViewMode, setMenuViewMode] = useState('cards'); // 'cards' | 'table'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Data States
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState(null);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('Semua');
  const [searchMenuQuery, setSearchMenuQuery] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('Semua');
  const [searchExpenseQuery, setSearchExpenseQuery] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('Semua');

  // Modals
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [editingPriceItem, setEditingPriceItem] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);

  // Modal: Tambah Menu
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenu, setNewMenu] = useState({
    nama: '',
    kategori: 'Daging',
    harga: '',
    deskripsi: '',
    image_url: '',
    badge: 'Favorit',
    is_spicy: 1,
    stok_status: 'Tersedia'
  });
  const [submittingMenu, setSubmittingMenu] = useState(false);

  // Modal: Tambah Pengeluaran
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    judul: '',
    kategori: 'Bahan Baku',
    jumlah: '',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: ''
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Modal: Tambah Staf
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    nama: '',
    role: 'Kasir Utama',
    no_telp: '',
    status: 'Aktif',
    shift: 'Pagi (08.00 - 16.00)'
  });
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Modal: Edit Staf
  const [editingStaffItem, setEditingStaffItem] = useState(null);
  const [savingStaff, setSavingStaff] = useState(false);

  // Engine info
  const [dbInfo, setDbInfo] = useState({
    engine: 'MySQL (phpMyAdmin)',
    database: 'db_warung_padang',
    server: 'Node.js Express'
  });

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID'));
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Chime Sound
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch {}
  };

  // Helper Request API Terautentikasi (Sertakan Token Pengelola & Proteksi Manipulasi Klien)
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('bk_admin_token') || '';
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      console.warn('⚠️ Sesi tidak sah atau token dimanipulasi di Application/LocalStorage. Mengeluarkan sesi.');
      localStorage.removeItem('bk_admin_token');
      localStorage.removeItem('bk_admin_user');
      localStorage.removeItem('bk_admin_auth');
      if (typeof onLogout === 'function') {
        onLogout();
      }
      throw new Error('Sesi tidak sah');
    }
    return res;
  };

  // Fetch all admin data dengan proteksi token resmi
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [resOrders, resMenu, resStats, resSchema, resHealth, resExpenses, resStaff] = await Promise.all([
        authFetch('/api/pesanan').then(r => r.json()).catch(() => null),
        authFetch('/api/menu').then(r => r.json()).catch(() => null),
        authFetch('/api/stats').then(r => r.json()).catch(() => null),
        authFetch('/api/schema').then(r => r.json()).catch(() => null),
        authFetch('/api/health').then(r => r.json()).catch(() => null),
        authFetch('/api/pengeluaran').then(r => r.json()).catch(() => null),
        authFetch('/api/staf').then(r => r.json()).catch(() => null)
      ]);

      if (resOrders && resOrders.success) setOrders(resOrders.data || []);
      if (resMenu && resMenu.success) setMenuItems(resMenu.data || []);
      if (resStats && resStats.success) setStats(resStats.data);
      if (resSchema && resSchema.success) setSchemas(resSchema.data || []);
      if (resExpenses && resExpenses.success) setExpenses(resExpenses.data || []);
      if (resStaff && resStaff.success) setStaffList(resStaff.data || []);
      if (resHealth && resHealth.engine) {
        setDbInfo({
          engine: resHealth.engine,
          database: resHealth.database || 'db_warung_padang',
          server: resHealth.server
        });
      }
    } catch (err) {
      console.error('Gagal mengambil data admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // Auto-refresh interval 10 detik agar sinkron real-time
    const interval = setInterval(loadAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await authFetch(`/api/pesanan/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        playChime();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        loadAdminData();
      }
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  // Quick Advance Status Stepper
  const handleAdvanceStatus = (order) => {
    if (order.status === 'Menunggu Konfirmasi') {
      handleUpdateOrderStatus(order.id, 'Dibayar');
    } else if (order.status === 'Dibayar') {
      handleUpdateOrderStatus(order.id, 'Sedang Dimasak');
    } else if (order.status === 'Sedang Dimasak') {
      handleUpdateOrderStatus(order.id, 'Siap Dikirim');
    } else if (order.status === 'Siap Dikirim') {
      handleUpdateOrderStatus(order.id, 'Selesai');
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Hapus transaksi #${orderId} secara permanen dari database?`)) return;
    try {
      const res = await authFetch(`/api/pesanan/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        loadAdminData();
      }
    } catch (err) {
      alert('Gagal menghapus pesanan: ' + err.message);
    }
  };

  // Toggle Stok Menu
  const handleToggleStok = async (menuId, currentStok) => {
    const nextStok = currentStok === 'Tersedia' ? 'Habis' : 'Tersedia';
    try {
      const res = await authFetch(`/api/menu/${menuId}/stok`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stok_status: nextStok })
      });
      const data = await res.json();
      if (data.success) {
        playChime();
        setMenuItems(prev => prev.map(m => m.id === menuId ? { ...m, stok_status: nextStok } : m));
      }
    } catch (err) {
      alert('Gagal mengubah stok: ' + err.message);
    }
  };

  // Quick Price Update
  const handleSavePrice = async () => {
    if (!editingPriceItem || !tempPrice) return;
    const parsed = parseInt(tempPrice);
    if (isNaN(parsed) || parsed < 500) {
      alert('Masukkan harga yang valid.');
      return;
    }

    setSavingPrice(true);
    try {
      const res = await authFetch(`/api/menu/${editingPriceItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingPriceItem, harga: parsed })
      });
      const data = await res.json();
      if (data.success) {
        playChime();
        setMenuItems(prev => prev.map(m => m.id === editingPriceItem.id ? { ...m, harga: parsed } : m));
        setEditingPriceItem(null);
      }
    } catch (err) {
      alert('Gagal memperbarui harga: ' + err.message);
    } finally {
      setSavingPrice(false);
    }
  };

  // Delete Menu
  const handleDeleteMenu = async (menuId, namaMenu) => {
    if (!window.confirm(`Hapus hidangan "${namaMenu}" dari database?`)) return;
    try {
      const res = await authFetch(`/api/menu/${menuId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMenuItems(prev => prev.filter(m => m.id !== menuId));
        loadAdminData();
      }
    } catch (err) {
      alert('Gagal menghapus menu: ' + err.message);
    }
  };

  // Submit Add Menu
  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!newMenu.nama || !newMenu.harga) return;
    setSubmittingMenu(true);
    try {
      const res = await authFetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMenu)
      });
      const data = await res.json();
      if (data.success) {
        playChime();
        setShowAddMenuModal(false);
        setNewMenu({
          nama: '',
          kategori: 'Daging',
          harga: '',
          deskripsi: '',
          image_url: '',
          badge: 'Favorit',
          is_spicy: 1,
          stok_status: 'Tersedia'
        });
        loadAdminData();
      }
    } catch (err) {
      alert('Gagal menambah menu: ' + err.message);
    } finally {
      setSubmittingMenu(false);
    }
  };

  // Submit Add Expense
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.judul || !newExpense.jumlah) return;
    setSubmittingExpense(true);
    try {
      const res = await authFetch('/api/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      const data = await res.json();
      if (data.success) {
        playChime();
        setShowAddExpenseModal(false);
        setNewExpense({
          judul: '',
          kategori: 'Bahan Baku',
          jumlah: '',
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: ''
        });
        loadAdminData();
      }
    } catch (err) {
      alert('Gagal mencatat pengeluaran: ' + err.message);
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id, judul) => {
    if (!window.confirm(`Hapus catatan pengeluaran "${judul}"?`)) return;
    try {
      const res = await authFetch(`/api/pengeluaran/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setExpenses(prev => prev.filter(x => x.id !== id));
        loadAdminData();
      }
    } catch (err) {
      alert('Gagal menghapus pengeluaran: ' + err.message);
    }
  };

  // Submit Add Staff
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.nama || !newStaff.role || !newStaff.no_telp) return;
    setSubmittingStaff(true);
    try {
      const res = await authFetch('/api/staf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      const data = await res.json();
      if (data.success) {
        playChime();
        setShowAddStaffModal(false);
        setNewStaff({
          nama: '',
          role: 'Kasir Utama',
          no_telp: '',
          status: 'Aktif',
          shift: 'Pagi (08.00 - 16.00)'
        });
        loadAdminData();
      }
    } catch (err) {
      alert('Gagal menambah staf: ' + err.message);
    } finally {
      setSubmittingStaff(false);
    }
  };

  // Toggle Staff Status (Aktif / Cuti)
  const handleToggleStaffStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Aktif' ? 'Cuti' : 'Aktif';
    try {
      const res = await authFetch(`/api/staf/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        playChime();
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
      }
    } catch (err) {
      alert('Gagal mengubah status staf: ' + err.message);
    }
  };

  // Delete Staff
  const handleDeleteStaff = async (id, nama) => {
    if (!window.confirm(`Hapus akun kru "${nama}"?`)) return;
    try {
      const res = await authFetch(`/api/staf/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStaffList(prev => prev.filter(s => s.id !== id));
        loadAdminData();
      }
    } catch (err) {
      alert('Gagal menghapus staf: ' + err.message);
    }
  };

  // Save Edit Staff
  const handleSaveStaffEdit = async (e) => {
    e.preventDefault();
    if (!editingStaffItem || !editingStaffItem.nama) return;
    setSavingStaff(true);
    try {
      const res = await authFetch(`/api/staf/${editingStaffItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStaffItem)
      });
      const data = await res.json();
      if (data.success) {
        playChime();
        setStaffList(prev => prev.map(s => s.id === editingStaffItem.id ? editingStaffItem : s));
        setEditingStaffItem(null);
      } else {
        alert(data.error || 'Gagal menyimpan perubahan akun staf.');
      }
    } catch (err) {
      alert('Gagal mengedit data staf: ' + err.message);
    } finally {
      setSavingStaff(false);
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Belum ada data transaksi untuk diekspor.');
      return;
    }
    const headers = ['Nomor Pesanan', 'Tanggal Transaksi', 'Nama Pelanggan', 'No WA', 'Tipe Layanan', 'Status Dapur', 'Total Harga (Rp)', 'Catatan', 'Rincian Menu'];
    const rows = orders.map(o => [
      o.nomor_pesanan,
      o.created_at || '',
      `"${(o.nama_pelanggan || '').replace(/"/g, '""')}"`,
      o.nomor_wa,
      o.tipe_layanan,
      o.status,
      o.total_harga,
      `"${(o.catatan || '').replace(/"/g, '""')}"`,
      `"${(o.items || []).map(i => `${i.nama || i.nama_item} (${i.jumlah}x)`).join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_penjualan_padang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations & Financials
  const pendingOrdersCount = orders.filter(o => o.status === 'Menunggu Konfirmasi').length;
  const cookingOrdersCount = orders.filter(o => o.status === 'Sedang Dimasak' || o.status === 'Dibayar').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Selesai').length;
  const totalOmzet = stats ? Number(stats.total_omzet || 0) : orders.reduce((sum, o) => sum + Number(o.total_harga || 0), 0);
  const totalPengeluaran = stats ? Number(stats.total_pengeluaran || 0) : expenses.reduce((sum, e) => sum + Number(e.jumlah || 0), 0);
  const labaBersih = totalOmzet - totalPengeluaran;
  const profitMargin = totalOmzet > 0 ? Math.round((labaBersih / totalOmzet) * 100) : 0;
  const avgOrderValue = orders.length > 0 ? Math.round(totalOmzet / orders.length) : 0;

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = orderFilterStatus === 'Semua' || o.status === orderFilterStatus;
      if (!matchesStatus) return false;
      if (!searchOrderQuery.trim()) return true;
      const q = searchOrderQuery.toLowerCase();
      return (o.nama_pelanggan || '').toLowerCase().includes(q) ||
             (o.nomor_pesanan || '').toLowerCase().includes(q) ||
             (o.nomor_wa || '').toLowerCase().includes(q);
    });
  }, [orders, orderFilterStatus, searchOrderQuery]);

  // Filter Menu
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(m => {
      const matchesCat = menuCategoryFilter === 'Semua' || m.kategori === menuCategoryFilter;
      if (!matchesCat) return false;
      if (!searchMenuQuery.trim()) return true;
      const q = searchMenuQuery.toLowerCase();
      return (m.nama || '').toLowerCase().includes(q) || (m.deskripsi || '').toLowerCase().includes(q);
    });
  }, [menuItems, menuCategoryFilter, searchMenuQuery]);

  // Filter Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesCat = expenseCategoryFilter === 'Semua' || e.kategori === expenseCategoryFilter;
      if (!matchesCat) return false;
      if (!searchExpenseQuery.trim()) return true;
      const q = searchExpenseQuery.toLowerCase();
      return (e.judul || '').toLowerCase().includes(q) || (e.kategori || '').toLowerCase().includes(q);
    });
  }, [expenses, expenseCategoryFilter, searchExpenseQuery]);

  // Top Selling Dishes Leaderboard (Calculated dynamically from real order items)
  const topSellingMenus = useMemo(() => {
    const itemMap = {};
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = item.nama || item.nama_item;
          if (!name) return;
          if (!itemMap[name]) {
            itemMap[name] = {
              name,
              qty: 0,
              revenue: 0,
              harga: item.harga || item.harga_satuan || 0
            };
          }
          itemMap[name].qty += (item.jumlah || 1);
          itemMap[name].revenue += (item.subtotal || (item.harga || 0) * (item.jumlah || 1));
        });
      }
    });
    return Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  // Operator Profile (Diambil dari token terverifikasi atau database staf)
  const activeOperator = adminUser || staffList.find(s => 
    s.role && (s.role.toLowerCase().includes('kasir utama') || s.role.toLowerCase().includes('admin') || s.role.toLowerCase().includes('supervisor'))
  ) || staffList[0] || {
    id: 1,
    nama: 'Vinzkie',
    role: 'Kasir Utama & Supervisor POS'
  };

  const getInitials = (nama) => {
    if (!nama) return 'SA';
    const parts = nama.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return 'bg-amber-500/10 text-amber-700 border-amber-300 ring-1 ring-amber-400/30';
      case 'Dibayar':
        return 'bg-emerald-500/10 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30';
      case 'Sedang Dimasak':
        return 'bg-blue-500/10 text-blue-800 border-blue-300 ring-1 ring-blue-400/30';
      case 'Siap Dikirim':
        return 'bg-purple-500/10 text-purple-800 border-purple-300 ring-1 ring-purple-400/30';
      case 'Selesai':
        return 'bg-emerald-600/10 text-emerald-900 border-emerald-400 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, badge: null },
    { id: 'orders', label: 'Antrean Pesanan & POS', icon: Receipt, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Baru` : null },
    { id: 'menu', label: 'Katalog Menu & Stok', icon: UtensilsCrossed, badge: `${menuItems.length}` },
    { id: 'finance', label: 'Arus Kas & Keuangan', icon: Wallet, badge: null },
    { id: 'staff', label: 'Akun Staf & Kru', icon: Users, badge: `${staffList.length}` },
    { id: 'reports', label: 'Laporan & Ekspor', icon: FileText, badge: null },
    { id: 'database', label: 'Database & phpMyAdmin', icon: Database, badge: 'MySQL' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-stone-800 flex font-sans antialiased selection:bg-[#a61c1c] selection:text-white">
      
      {/* ================= LEFT SIDEBAR (CLEAN WHITE COHESIVE THEME) ================= */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs animate-fadeIn"
        />
      )}

      <aside className={`fixed lg:sticky top-0 h-screen w-64 xl:w-72 bg-white text-stone-700 z-50 flex flex-col justify-between border-r border-slate-200 shadow-xs transition-transform duration-200 ease-in-out shrink-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top: Logo & Resto Identity */}
        <div>
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a61c1c] to-[#781212] p-1.5 flex items-center justify-center shadow-xs border border-red-100 shrink-0">
                <img 
                  src="/logo-icon.png" 
                  alt="Logo Padang" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-serif font-black text-sm text-slate-900 tracking-wide truncate">
                  MASAKAN PADANG ID
                </h2>
                <div className="text-[10px] text-[#a61c1c] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate">Portal Kasir & Database</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#a61c1c] text-white shadow-xs shadow-red-950/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : item.badge.includes('Baru') 
                        ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                        : item.badge === 'MySQL' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Operator Profile & Action Buttons */}
        <div className="p-3.5 border-t border-slate-200 space-y-2.5 bg-slate-50/70">
          
          {/* User Operator Card */}
          <div 
            onClick={() => {
              if (activeOperator) setEditingStaffItem({ ...activeOperator });
            }}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-2xs transition cursor-pointer group"
            title="Klik untuk edit profil operator"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#18100c] text-[#f5d796] font-bold flex items-center justify-center text-xs shrink-0 shadow-xs group-hover:scale-105 transition">
                {getInitials(activeOperator?.nama)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#a61c1c] transition">
                  {activeOperator?.nama || 'Vinzkie'}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{activeOperator?.role || 'Super Admin'}</span>
                </div>
              </div>
            </div>
            <div className="p-1 rounded text-slate-400 group-hover:text-red-700 transition shrink-0">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>Keluar / Logout</span>
          </button>
        </div>

      </aside>

      {/* ================= RIGHT MAIN LAYOUT ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER BAR */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
          <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            
            {/* Mobile Toggle & Section Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                <MenuIcon className="w-5 h-5" />
              </button>

              <div>
                <h1 className="font-serif font-black text-lg sm:text-xl text-stone-900 leading-tight">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h1>
                <div className="text-[11px] text-stone-500 hidden sm:block">
                  Sistem Informasi & Manajemen Operasional Warung Padang Bundo Kanduang
                </div>
              </div>
            </div>

            {/* Right Controls: Audio Bell, Clock, Quick phpMyAdmin, Refresh */}
            <div className="flex items-center gap-2.5">
              
              {/* Sound Notification Bell Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playChime();
                }}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  soundEnabled 
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                    : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                }`}
                title={soundEnabled ? 'Notifikasi Suara: Aktif' : 'Notifikasi Suara: Senyap'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden md:inline">{soundEnabled ? 'Audio On' : 'Mute'}</span>
              </button>

              {/* Realtime Clock */}
              <div className="hidden md:flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-700">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>{currentTime} WIB</span>
              </div>

              {/* phpMyAdmin Link */}
              <a
                href="http://localhost/phpmyadmin"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-2xs"
                title="Buka panel database phpMyAdmin di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>phpMyAdmin</span>
              </a>

              {/* Refresh Data Button */}
              <button
                onClick={() => {
                  playChime();
                  loadAdminData();
                }}
                disabled={loading}
                className="p-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 rounded-xl border border-stone-200 transition cursor-pointer"
                title="Sinkronkan data database MySQL sekarang"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#a61c1c]' : ''}`} />
              </button>
            </div>

          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="p-3 sm:p-6 md:p-8 pb-24 lg:pb-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">

          {/* ================= TAB 1: DASHBOARD UTAMA (EXECUTIVE OVERVIEW) ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* 4 Hero KPI Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Pemasukan / Omzet */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Pemasukan</span>
                    <div className="font-serif font-black text-2xl text-stone-900 mt-1">
                      Rp {totalOmzet.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{orders.length} Transaksi Tercatat</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                {/* 2. Total Pengeluaran */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pengeluaran Dapur</span>
                    <div className="font-serif font-black text-2xl text-stone-900 mt-1">
                      Rp {totalPengeluaran.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>{expenses.length} Pos Pembelanjaan</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>

                {/* 3. Laba Bersih & Margin */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Estimasi Laba Bersih</span>
                    <div className={`font-serif font-black text-2xl mt-1 ${labaBersih >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      Rp {labaBersih.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium mt-1">
                      Margin Keuntungan: <strong className={profitMargin >= 30 ? 'text-emerald-700 font-bold' : 'text-stone-700'}>{profitMargin}%</strong>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                    <Receipt className="w-6 h-6" />
                  </div>
                </div>

                {/* 4. Antrean Dapur & Transaksi Aktif */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Antrean Dapur</span>
                    <div className="font-serif font-black text-2xl text-amber-600 mt-1 flex items-center gap-2">
                      <span>{pendingOrdersCount} Baru</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      {cookingOrdersCount} sedang dimasak
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                    <ChefHat className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Profit & Order Status Gauge */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-[#a61c1c]" />
                      <span>Ringkasan Aliran Dana & Status Pesanan Hari Ini</span>
                    </h3>
                    <p className="text-xs text-stone-500">Visualisasi rasio profitabilitas dan tahapan pengerjaan di dapur Minang.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-stone-100 px-3 py-1 rounded-xl text-stone-700">
                      Rata-rata Order (AOV): Rp {avgOrderValue.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Visual Bar: Rasio Omzet vs Biaya */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-700">Laba Bersih: Rp {labaBersih.toLocaleString('id-ID')} ({profitMargin}%)</span>
                    <span className="text-red-700">Pengeluaran: Rp {totalPengeluaran.toLocaleString('id-ID')} ({100 - profitMargin}%)</span>
                  </div>
                  <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-700" 
                      style={{ width: `${Math.max(5, Math.min(100, profitMargin))}%` }}
                      title={`Laba: ${profitMargin}%`}
                    />
                    <div 
                      className="h-full bg-red-500 transition-all duration-700" 
                      style={{ width: `${Math.max(0, 100 - profitMargin)}%` }}
                      title={`Biaya: ${100 - profitMargin}%`}
                    />
                  </div>
                </div>

                {/* Status Badges Distribution */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center text-xs">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="block text-[10px] text-amber-700 font-bold uppercase">Menunggu</span>
                    <span className="font-black text-lg text-amber-900">{orders.filter(o => o.status === 'Menunggu Konfirmasi').length}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="block text-[10px] text-emerald-700 font-bold uppercase">Dibayar</span>
                    <span className="font-black text-lg text-emerald-900">{orders.filter(o => o.status === 'Dibayar').length}</span>
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="block text-[10px] text-blue-700 font-bold uppercase">Dimasak</span>
                    <span className="font-black text-lg text-blue-900">{orders.filter(o => o.status === 'Sedang Dimasak').length}</span>
                  </div>
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
                    <span className="block text-[10px] text-purple-700 font-bold uppercase">Siap Antar</span>
                    <span className="font-black text-lg text-purple-900">{orders.filter(o => o.status === 'Siap Dikirim').length}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl col-span-2 sm:col-span-1">
                    <span className="block text-[10px] text-emerald-800 font-bold uppercase">Selesai Lunas</span>
                    <span className="font-black text-lg text-emerald-950">{completedOrdersCount}</span>
                  </div>
                </div>
              </div>


              {/* 2-Column Split: Top 5 Best Sellers & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Orders (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900">Pesanan Dapur Masuk Terbaru</h4>
                      <p className="text-xs text-stone-500">Antrean masuk dari nampan pesanan pelanggan.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#a61c1c] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Kelola Semua ({orders.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-xs text-stone-400">
                      Belum ada transaksi pesanan yang tersimpan di database.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 text-xs">
                      {orders.slice(0, 6).map(o => (
                        <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-stone-50/60 rounded-xl px-2 transition">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-[#a61c1c]">#{o.nomor_pesanan}</span>
                              <span className="font-bold text-stone-900">{o.nama_pelanggan}</span>
                              <span className="text-[10px] text-stone-500 font-medium">({o.tipe_layanan})</span>
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {o.items?.length || 0} menu • WA: <span className="font-mono">{o.nomor_wa}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <div className="text-left sm:text-right">
                              <div className="font-bold text-stone-900">
                                Rp {Number(o.total_harga || 0).toLocaleString('id-ID')}
                              </div>
                              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${getStatusBadge(o.status)}`}>
                                {o.status}
                              </span>
                            </div>

                            <button
                              onClick={() => setSelectedReceiptOrder(o)}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition cursor-pointer"
                              title="Cetak Struk POS"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Selling Menus Leaderboard (1 col) */}
                <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900">Top 5 Menu Paling Laris</h4>
                      <p className="text-xs text-stone-500">Peringkat berdasarkan jumlah porsi terjual.</p>
                    </div>
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>

                  {topSellingMenus.length === 0 ? (
                    <div className="py-10 text-center text-xs text-stone-400">
                      Data penjualan menu belum mencukupi.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topSellingMenus.map((dish, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                                idx === 0 ? 'bg-amber-400 text-stone-900' :
                                idx === 1 ? 'bg-stone-300 text-stone-900' :
                                idx === 2 ? 'bg-amber-700 text-white' :
                                'bg-stone-200 text-stone-700'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="font-bold text-xs text-stone-900 truncate max-w-[140px]">{dish.name}</span>
                            </div>
                            <span className="font-bold text-xs text-[#a61c1c]">{dish.qty} Porsi</span>
                          </div>
                          
                          <div className="flex justify-between text-[10px] text-stone-500">
                            <span>Omzet: Rp {dish.revenue.toLocaleString('id-ID')}</span>
                            <span>@ Rp {dish.harga.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ================= TAB 2: ANTREAN PESANAN & POS ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Filter & View Toggle */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 md:pb-0">
                    {['Semua', 'Menunggu Konfirmasi', 'Dibayar', 'Sedang Dimasak', 'Siap Dikirim', 'Selesai'].map(st => {
                      const count = st === 'Semua' ? orders.length : orders.filter(o => o.status === st).length;
                      return (
                        <button
                          key={st}
                          onClick={() => setOrderFilterStatus(st)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                            orderFilterStatus === st
                              ? 'bg-[#a61c1c] text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          <span>{st}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${orderFilterStatus === st ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-800'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Controls: Search & View Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={searchOrderQuery}
                        onChange={e => setSearchOrderQuery(e.target.value)}
                        placeholder="Cari nama, no pesanan, WA..."
                        className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#a61c1c] focus:bg-white transition"
                      />
                    </div>

                    {/* View Switcher: Grid vs Table */}
                    <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
                      <button
                        onClick={() => setOrdersViewMode('cards')}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${ordersViewMode === 'cards' ? 'bg-white shadow-xs text-[#a61c1c]' : 'text-stone-500 hover:text-stone-800'}`}
                        title="Tampilan Kartu POS"
                      >
                        <Grid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setOrdersViewMode('table')}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${ordersViewMode === 'table' ? 'bg-white shadow-xs text-[#a61c1c]' : 'text-stone-500 hover:text-stone-800'}`}
                        title="Tampilan Tabel Kasir"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Orders Content */}
              {loading ? (
                <div className="py-24 text-center text-xs text-stone-400">
                  <div className="w-8 h-8 border-2 border-[#a61c1c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Memuat data transaksi dari database MySQL...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-sm text-stone-500">
                  <Receipt className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <div className="font-bold text-stone-800">Tidak ada pesanan yang sesuai filter</div>
                  <p className="text-xs text-stone-400 mt-1">Coba ubah kata kunci atau status pencarian Anda.</p>
                </div>
              ) : ordersViewMode === 'cards' ? (
                
                /* CARDS GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Header Order */}
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                          <div>
                            <span className="font-mono font-bold text-sm text-[#a61c1c]">
                              #{order.nomor_pesanan}
                            </span>
                            <div className="text-[10px] text-stone-400 font-mono">
                              {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-1 text-xs mb-3">
                          <div className="font-bold text-stone-900 flex items-center justify-between">
                            <span>{order.nama_pelanggan}</span>
                            <span className="text-[10px] font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{order.tipe_layanan}</span>
                          </div>
                          <div className="text-[11px] text-stone-600 flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{order.nomor_wa}</span>
                          </div>
                          {order.catatan && order.catatan !== '-' && (
                            <div className="text-[11px] bg-stone-50 p-2 rounded-lg text-stone-600 border border-stone-100 italic mt-1.5">
                              "{order.catatan}"
                            </div>
                          )}
                        </div>

                        {/* Order Items Breakdown */}
                        <div className="pt-2 border-t border-stone-100 space-y-1 mb-4">
                          <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1.5">
                            Rincian Nampan:
                          </div>
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-stone-800">
                              <span>• {item.nama || item.nama_item} <strong className="text-[#a61c1c]">({item.jumlah}x)</strong></span>
                              <span className="font-mono text-[11px]">
                                Rp {(item.subtotal || item.harga * item.jumlah).toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Total & Actions */}
                      <div className="pt-3 border-t border-stone-100 space-y-3">
                        <div className="flex justify-between items-center font-bold text-sm">
                          <span className="text-stone-500 text-xs">Total Pembayaran:</span>
                          <span className="text-[#a61c1c] text-base">Rp {Number(order.total_harga || 0).toLocaleString('id-ID')}</span>
                        </div>

                        {/* Quick Action Stepper Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {order.status !== 'Dibayar' && order.status === 'Menunggu Konfirmasi' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'Dibayar')}
                              className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-semibold transition flex items-center justify-center gap-1 cursor-pointer col-span-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Konfirmasi Lunas ➔</span>
                            </button>
                          )}
                          {order.status !== 'Sedang Dimasak' && order.status !== 'Selesai' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'Sedang Dimasak')}
                              className="py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                              <span>Mulai Masak</span>
                            </button>
                          )}
                          {order.status !== 'Siap Dikirim' && order.status !== 'Selesai' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'Siap Dikirim')}
                              className="py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Bike className="w-3.5 h-3.5 text-purple-600" />
                              <span>Siap Antar</span>
                            </button>
                          )}
                          {order.status !== 'Selesai' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'Selesai')}
                              className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-semibold transition col-span-2 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Selesaikan Pesanan ✓</span>
                            </button>
                          )}
                        </div>

                        {/* Secondary Actions: Print Struk, WA, Hapus */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="flex-1 py-1.5 bg-[#18100c] hover:bg-[#2d1e16] text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            title="Cetak struk thermal POS"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#caa268]" />
                            <span>Cetak Struk</span>
                          </button>

                          <a
                            href={`https://wa.me/${(order.nomor_wa || '').replace(/^0/, '62').replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(order.nama_pelanggan)},%20pesanan%20nomor%20${order.nomor_pesanan}%20di%20Masakan%20Padang%20ID%20statusnya:%20${encodeURIComponent(order.status)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer"
                            title="Kirim pesan WhatsApp ke pelanggan"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition cursor-pointer"
                            title="Hapus transaksi dari database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              ) : (

                /* TABLE LIST VIEW (RESPONSIF DENGAN HORIZONTAL SCROLL) */
                <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto shadow-sm">
                  <table className="w-full min-w-[720px] text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 font-mono border-b border-stone-200">
                      <tr>
                        <th className="p-3.5">No. Pesanan</th>
                        <th className="p-3.5">Pelanggan</th>
                        <th className="p-3.5">Layanan</th>
                        <th className="p-3.5">Item Nampan</th>
                        <th className="p-3.5">Total Harga</th>
                        <th className="p-3.5">Status Dapur</th>
                        <th className="p-3.5 text-right">Aksi Kasir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-stone-50 transition">
                          <td className="p-3.5 font-mono font-bold text-[#a61c1c]">
                            #{order.nomor_pesanan}
                            <div className="text-[10px] text-stone-400 font-normal">
                              {new Date(order.created_at).toLocaleDateString('id-ID')}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-stone-900">{order.nama_pelanggan}</div>
                            <div className="text-[11px] text-stone-500 font-mono">{order.nomor_wa}</div>
                          </td>
                          <td className="p-3.5 text-stone-600">
                            {order.tipe_layanan}
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-stone-800">
                              {order.items?.length || 0} menu
                            </span>
                            <div className="text-[10px] text-stone-500 truncate max-w-[180px]">
                              {(order.items || []).map(i => i.nama || i.nama_item).join(', ')}
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-stone-900 text-sm">
                            Rp {Number(order.total_harga || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleAdvanceStatus(order)}
                                className="px-2.5 py-1.5 bg-[#a61c1c] hover:bg-[#881414] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                title="Lanjut status pengerjaan"
                              >
                                ➔ Majukan
                              </button>
                              <button
                                onClick={() => setSelectedReceiptOrder(order)}
                                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition cursor-pointer"
                                title="Cetak struk"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                                title="Hapus transaksi"
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

              )}

            </div>
          )}

          {/* ================= TAB 3: KATALOG MENU & STOK ================= */}
          {activeTab === 'menu' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Katalog Hidangan & Stok Harian</h3>
                  <p className="text-xs text-stone-500">Kelola harga jual resmi dan ketersediaan stok lauk dapur Minang secara langsung di database MySQL.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative w-full sm:w-60">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={searchMenuQuery}
                      onChange={e => setSearchMenuQuery(e.target.value)}
                      placeholder="Cari menu hidangan..."
                      className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#a61c1c] transition"
                    />
                  </div>

                  {/* View Mode Switcher */}
                  <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
                    <button
                      onClick={() => setMenuViewMode('cards')}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${menuViewMode === 'cards' ? 'bg-white shadow-xs text-[#a61c1c]' : 'text-stone-500 hover:text-stone-800'}`}
                      title="Tampilan Kartu Foto"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setMenuViewMode('table')}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${menuViewMode === 'table' ? 'bg-white shadow-xs text-[#a61c1c]' : 'text-stone-500 hover:text-stone-800'}`}
                      title="Tampilan Tabel Data"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAddMenuModal(true)}
                    className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Hidangan</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {['Semua', 'Daging', 'Ayam', 'Ikan & Laut', 'Sayuran', 'Pelengkap', 'Minuman'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setMenuCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                      menuCategoryFilter === cat
                        ? 'bg-[#18100c] text-white shadow'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu Items Render */}
              {menuViewMode === 'cards' ? (
                
                /* CARDS PHOTO VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredMenuItems.map(item => (
                    <div 
                      key={item.id}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div>
                        {/* Food Image with Badges */}
                        <div className="relative h-40 bg-stone-100 overflow-hidden">
                          <img
                            src={item.image_url || '/images/menu/rendang.jpg'}
                            alt={item.nama}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/hero-rumah-gadang.jpg';
                            }}
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#a61c1c] text-white shadow-xs">
                                {item.badge}
                              </span>
                            )}
                            {item.is_spicy === 1 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-stone-900 shadow-xs flex items-center gap-0.5">
                                <Flame className="w-3 h-3" /> Pedas
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                              {item.kategori}
                            </span>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{item.nama}</h4>
                          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                            {item.deskripsi}
                          </p>

                          <div className="pt-2 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-stone-400 block uppercase font-semibold">Harga Porsi</span>
                              <div className="font-bold text-sm sm:text-base text-[#a61c1c]">
                                Rp {Number(item.harga).toLocaleString('id-ID')}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setEditingPriceItem(item);
                                setTempPrice(String(item.harga));
                              }}
                              className="p-1.5 text-stone-400 hover:text-[#a61c1c] rounded-lg hover:bg-stone-100 transition cursor-pointer"
                              title="Edit Harga"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions: Stock Switch & Delete */}
                      <div className="p-3 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleStok(item.id, item.stok_status)}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            item.stok_status === 'Tersedia'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-900 border border-red-300 hover:bg-red-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${item.stok_status === 'Tersedia' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <span>{item.stok_status}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteMenu(item.id, item.nama)}
                          className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="Hapus hidangan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              ) : (

                /* TABLE DATA VIEW (RESPONSIF DENGAN HORIZONTAL SCROLL) */
                <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto shadow-sm">
                  <table className="w-full min-w-[650px] text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 font-mono border-b border-stone-200">
                      <tr>
                        <th className="p-3.5">Foto & Nama Menu</th>
                        <th className="p-3.5">Kategori</th>
                        <th className="p-3.5">Harga Jual</th>
                        <th className="p-3.5">Status Stok</th>
                        <th className="p-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredMenuItems.map(item => (
                        <tr key={item.id} className="hover:bg-stone-50 transition">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image_url || '/images/menu/rendang.jpg'}
                                alt={item.nama}
                                className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/hero-rumah-gadang.jpg';
                                }}
                              />
                              <div>
                                <div className="font-bold text-stone-900">{item.nama}</div>
                                <div className="text-[10px] text-stone-500 line-clamp-1">{item.deskripsi}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 bg-stone-100 text-stone-700 border border-stone-200 rounded-lg font-semibold text-[11px]">
                              {item.kategori}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                              <span>Rp {Number(item.harga).toLocaleString('id-ID')}</span>
                              <button
                                onClick={() => {
                                  setEditingPriceItem(item);
                                  setTempPrice(String(item.harga));
                                }}
                                className="text-stone-400 hover:text-[#a61c1c] p-1 rounded hover:bg-stone-100 transition cursor-pointer"
                                title="Ubah harga"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleStok(item.id, item.stok_status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                item.stok_status === 'Tersedia'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-900 border border-red-300 hover:bg-red-200'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${item.stok_status === 'Tersedia' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                              <span>{item.stok_status}</span>
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteMenu(item.id, item.nama)}
                              className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                              title="Hapus menu dari database"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              )}

            </div>
          )}

          {/* ================= TAB 4: ARUS KAS & KEUANGAN ================= */}
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Pemasukan (Omzet)</div>
                  <div className="font-serif font-black text-2xl text-emerald-700 mt-1">
                    Rp {totalOmzet.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Dari {orders.length} transaksi pesanan</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Pengeluaran Dapur</div>
                  <div className="font-serif font-black text-2xl text-red-700 mt-1">
                    Rp {totalPengeluaran.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Biaya belanja bahan & operasional</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Laba Bersih Saat Ini</div>
                  <div className={`font-serif font-black text-2xl mt-1 ${labaBersih >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Rp {labaBersih.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Selisih kas masuk & keluar</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Rasio Profit Margin</div>
                  <div className={`font-serif font-black text-2xl mt-1 ${profitMargin >= 30 ? 'text-emerald-700' : 'text-stone-800'}`}>
                    {profitMargin}%
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Persentase keuntungan bersih</div>
                </div>
              </div>

              {/* Expense Management Header */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Catatan Pengeluaran & Biaya Operasional</h3>
                  <p className="text-xs text-stone-500">Mencatat pembelian bahan baku dapur, bumbu Minang, gas LPG, kemasan mika, dan upah operasional.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative w-full sm:w-60">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={searchExpenseQuery}
                      onChange={e => setSearchExpenseQuery(e.target.value)}
                      placeholder="Cari pengeluaran..."
                      className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#a61c1c] transition"
                    />
                  </div>

                  <button
                    onClick={() => setShowAddExpenseModal(true)}
                    className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Catat Pengeluaran Baru</span>
                  </button>
                </div>
              </div>

              {/* Expenses Table (RESPONSIF DENGAN HORIZONTAL SCROLL) */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto shadow-sm">
                <table className="w-full min-w-[650px] text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 font-mono border-b border-stone-200">
                    <tr>
                      <th className="p-3.5">Tanggal</th>
                      <th className="p-3.5">Judul Pengeluaran</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Nominal (Rp)</th>
                      <th className="p-3.5">Keterangan</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-stone-50 transition">
                        <td className="p-3.5 font-mono text-stone-500">{exp.tanggal}</td>
                        <td className="p-3.5 font-bold text-stone-900">{exp.judul}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold text-[11px]">
                            {exp.kategori}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-red-700 text-sm">
                          Rp {Number(exp.jumlah).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-stone-500 max-w-xs">{exp.keterangan || '-'}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id, exp.judul)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
                            title="Hapus pengeluaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================= TAB 5: AKUN STAF & KRU RESTO ================= */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Manajemen Akun Staf & Kru Dapur</h3>
                  <p className="text-xs text-stone-500">Kelola akun kasir, koki Minang, kurir pengantar, status shift, dan data staf di database MySQL.</p>
                </div>

                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Akun Staf</span>
                </button>
              </div>

              {/* Staff Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffList.map(st => (
                  <div key={st.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#18100c] text-[#caa268] font-bold text-sm flex items-center justify-center shrink-0">
                            {st.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-sm">{st.nama}</div>
                            <div className="text-[11px] text-stone-500 font-medium">{st.role}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleStaffStatus(st.id, st.status)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                            st.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                          title="Klik untuk ubah status aktif/cuti"
                        >
                          {st.status}
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono">{st.no_telp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Shift: {st.shift}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer: WhatsApp, EDIT AKUN, & Hapus */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/${st.no_telp.replace(/^0/, '62').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Chat WA</span>
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingStaffItem({ ...st })}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          title="Edit Akun Staf"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#a61c1c]" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStaff(st.id, st.nama)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                          title="Hapus akun staf"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ================= TAB 6: LAPORAN & EKSPOR DATA ================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Rekapitulasi Penjualan & Ekspor Pembukuan</h3>
                  <p className="text-xs text-stone-500">Unduh data pembukuan kasir dalam format Excel/CSV atau cetak lembar laporan penjualan resmi.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor Excel / CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
                      const dlAnchor = document.createElement('a');
                      dlAnchor.setAttribute("href", dataStr);
                      dlAnchor.setAttribute("download", `rekap_transaksi_${Date.now()}.json`);
                      dlAnchor.click();
                    }}
                    className="px-4 py-2 bg-[#18100c] text-white hover:bg-[#a61c1c] text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor JSON</span>
                  </button>

                  <button
                    onClick={() => setShowPrintReportModal(true)}
                    className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Laporan Resmi</span>
                  </button>
                </div>
              </div>

              {/* Performance Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm">
                  <h4 className="font-bold text-sm text-stone-900 mb-3">Distribusi Status Pesanan</h4>
                  <div className="space-y-2.5 text-xs">
                    {['Menunggu Konfirmasi', 'Dibayar', 'Sedang Dimasak', 'Siap Dikirim', 'Selesai'].map(st => {
                      const count = orders.filter(o => o.status === st).length;
                      const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                      return (
                        <div key={st}>
                          <div className="flex justify-between font-medium mb-1">
                            <span>{st}</span>
                            <span className="font-bold">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#a61c1c] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-stone-900">Ringkasan Operasional Database</h4>
                  <div className="text-xs space-y-2 text-stone-600">
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>Total Porsi Menu Terdaftar:</span>
                      <strong className="text-stone-900">{menuItems.length} Porsi</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>Total Kru Bertugas:</span>
                      <strong className="text-stone-900">{staffList.length} Orang</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>Engine Database:</span>
                      <strong className="text-emerald-700 font-mono">{dbInfo.engine}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span>Database Name:</span>
                      <strong className="text-stone-900 font-mono">{dbInfo.database}</strong>
                    </div>
                  </div>
                </div>
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

              {/* 6 Relational Tables Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { name: 'menu', count: menuItems.length, desc: 'Daftar Menu' },
                  { name: 'outlet', count: 3, desc: 'Cabang Outlet' },
                  { name: 'pesanan', count: orders.length, desc: 'Header Pesanan' },
                  { name: 'pesanan_items', count: orders.reduce((sum, o) => sum + (o.items?.length || 0), 0), desc: 'Detail Nampan' },
                  { name: 'pengeluaran', count: expenses.length, desc: 'Beban Biaya' },
                  { name: 'staf', count: staffList.length, desc: 'Akun Kru Kasir' },
                ].map((tbl, i) => (
                  <div key={i} className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">{tbl.name}</span>
                    <div className="font-mono font-black text-xl text-[#a61c1c]">{tbl.count}</div>
                    <div className="text-[10px] text-stone-500 truncate">{tbl.desc}</div>
                  </div>
                ))}
              </div>

              {/* DDL Schema Viewers for All Tables */}
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

        </main>

        {/* ================= MOBILE BOTTOM NAVIGATION (HP / SMARTPHONE) ================= */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
              activeTab === 'dashboard' ? 'text-[#a61c1c] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Ringkasan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
              activeTab === 'orders' ? 'text-[#a61c1c] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            {pendingOrdersCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 bg-[#a61c1c] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
            <span className="text-[10px]">Pesanan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
              activeTab === 'menu' ? 'text-[#a61c1c] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Menu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
              activeTab === 'finance' ? 'text-[#a61c1c] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Kas</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer min-w-[56px]"
          >
            <MenuIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Menu Lain</span>
          </button>
        </div>

      </div>

      {/* ================= MODAL: CETAK STRUK THERMAL POS ================= */}
      <ReceiptModal
        isOpen={Boolean(selectedReceiptOrder)}
        onClose={() => setSelectedReceiptOrder(null)}
        order={selectedReceiptOrder}
      />

      {/* ================= MODAL: EDIT HARGA CEPAT ================= */}
      {editingPriceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-stone-200 p-6">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
              Perbarui Harga Jual
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {editingPriceItem.nama}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Harga Baru (Rupiah):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-stone-500 font-semibold">
                  Rp
                </span>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={tempPrice}
                  onChange={e => setTempPrice(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:border-[#a61c1c]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingPriceItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePrice}
                disabled={savingPrice}
                className="px-4 py-2 bg-[#a61c1c] hover:bg-[#8e1717] text-white text-xs font-bold rounded-lg transition shadow cursor-pointer"
              >
                {savingPrice ? 'Menyimpan...' : 'Simpan Harga'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT AKUN STAF ================= */}
      {editingStaffItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto shadow-2xl border border-stone-200 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Edit Akun Staf & Kru</h3>
                <p className="text-xs text-stone-500">Perbarui informasi jabatan, kontak, atau shift staf.</p>
              </div>
              <button onClick={() => setEditingStaffItem(null)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editingStaffItem.nama}
                  onChange={e => setEditingStaffItem({ ...editingStaffItem, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Jabatan / Role *</label>
                  <select
                    value={editingStaffItem.role}
                    onChange={e => setEditingStaffItem({ ...editingStaffItem, role: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  >
                    {['Kasir Utama', 'Kepala Koki Dapur', 'Juru Masak Rendang', 'Kurir Pengantar', 'Pramusaji', 'Manajer Resto'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Shift Kerja</label>
                  <select
                    value={editingStaffItem.shift}
                    onChange={e => setEditingStaffItem({ ...editingStaffItem, shift: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  >
                    <option value="Pagi (08.00 - 16.00)">Pagi (08.00 - 16.00)</option>
                    <option value="Sore (14.00 - 22.00)">Sore (14.00 - 22.00)</option>
                    <option value="Full Time">Full Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">No. WhatsApp / Telepon *</label>
                <input
                  type="text"
                  required
                  value={editingStaffItem.no_telp}
                  onChange={e => setEditingStaffItem({ ...editingStaffItem, no_telp: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingStaffItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingStaff}
                  className="px-5 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  {savingStaff ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH MENU BARU ================= */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto shadow-2xl border border-stone-200 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Tambah Menu Kuliner Minang</h3>
                <p className="text-xs text-stone-500">Daftarkan menu hidangan baru langsung ke database MySQL.</p>
              </div>
              <button onClick={() => setShowAddMenuModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMenu} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nama Hidangan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gulai Cancang Daging"
                    value={newMenu.nama}
                    onChange={e => setNewMenu({ ...newMenu, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategori *</label>
                  <select
                    value={newMenu.kategori}
                    onChange={e => setNewMenu({ ...newMenu, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  >
                    {['Daging', 'Ayam', 'Ikan & Laut', 'Sayuran', 'Pelengkap', 'Minuman'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Harga Porsi (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    placeholder="25000"
                    value={newMenu.harga}
                    onChange={e => setNewMenu({ ...newMenu, harga: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Lencana / Badge</label>
                  <input
                    type="text"
                    placeholder="Best Seller / Favorit / Khas Minang"
                    value={newMenu.badge}
                    onChange={e => setNewMenu({ ...newMenu, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL Foto Hidangan</label>
                <input
                  type="text"
                  placeholder="/images/menu/nama-menu.jpg atau URL Web"
                  value={newMenu.image_url}
                  onChange={e => setNewMenu({ ...newMenu, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Deskripsi & Racikan Rempah</label>
                <textarea
                  rows="2"
                  placeholder="Kelezatan olahan rempah khas Minang..."
                  value={newMenu.deskripsi}
                  onChange={e => setNewMenu({ ...newMenu, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={newMenu.is_spicy === 1}
                    onChange={e => setNewMenu({ ...newMenu, is_spicy: e.target.checked ? 1 : 0 })}
                    className="rounded text-[#a61c1c]"
                  />
                  <span>Rasa Pedas (Spicy)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingMenu}
                  className="px-5 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  {submittingMenu ? 'Menyimpan...' : 'Simpan ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CATAT PENGELUARAN ================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto shadow-2xl border border-stone-200 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Catat Pengeluaran Resto</h3>
                <p className="text-xs text-stone-500">Mencatat pembelian bahan baku dapur dan beban operasional.</p>
              </div>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama / Judul Pengeluaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daging Sapi Gandik 15 Kg"
                  value={newExpense.judul}
                  onChange={e => setNewExpense({ ...newExpense, judul: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategori Biaya *</label>
                  <select
                    value={newExpense.kategori}
                    onChange={e => setNewExpense({ ...newExpense, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  >
                    {['Bahan Baku', 'Operasional & Gas', 'Kemasan & Mika', 'Gaji & Upah', 'Kebersihan & Sanitasi', 'Lain-lain'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="1500000"
                    value={newExpense.jumlah}
                    onChange={e => setNewExpense({ ...newExpense, jumlah: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={newExpense.tanggal}
                  onChange={e => setNewExpense({ ...newExpense, tanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Keterangan / No. Nota</label>
                <input
                  type="text"
                  placeholder="Nota Toko Daging Pasar Raya"
                  value={newExpense.keterangan}
                  onChange={e => setNewExpense({ ...newExpense, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-5 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  {submittingExpense ? 'Menyimpan...' : 'Simpan Biaya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH STAF ================= */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto shadow-2xl border border-stone-200 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Tambah Akun Staf Resto</h3>
                <p className="text-xs text-stone-500">Daftarkan akun kru dapur atau kasir baru.</p>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama staf"
                  value={newStaff.nama}
                  onChange={e => setNewStaff({ ...newStaff, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Jabatan / Role *</label>
                  <select
                    value={newStaff.role}
                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  >
                    {['Kasir Utama', 'Kepala Koki Dapur', 'Juru Masak Rendang', 'Kurir Pengantar', 'Pramusaji', 'Manajer Resto'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Shift Kerja</label>
                  <select
                    value={newStaff.shift}
                    onChange={e => setNewStaff({ ...newStaff, shift: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                  >
                    <option value="Pagi (08.00 - 16.00)">Pagi (08.00 - 16.00)</option>
                    <option value="Sore (14.00 - 22.00)">Sore (14.00 - 22.00)</option>
                    <option value="Full Time">Full Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">No. WhatsApp / HP *</label>
                <input
                  type="text"
                  required
                  placeholder="081234567890"
                  value={newStaff.no_telp}
                  onChange={e => setNewStaff({ ...newStaff, no_telp: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#a61c1c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingStaff}
                  className="px-5 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  {submittingStaff ? 'Menyimpan...' : 'Simpan Akun Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CETAK LAPORAN PENJUALAN RESMI ================= */}
      {showPrintReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#18100c] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#caa268]" />
                <span className="font-bold text-xs">Lembar Laporan Resmi Penjualan Resto</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-[#a61c1c] hover:bg-[#881414] text-white rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button onClick={() => setShowPrintReportModal(false)} className="text-stone-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 bg-white text-stone-800 text-xs">
              {/* Kop Surat Resmi */}
              <div className="text-center pb-4 border-b-2 border-stone-900 space-y-1">
                <h2 className="font-serif font-black text-xl text-stone-900 tracking-wider">
                  RUMAH MAKAN KHAS PADANG MASAKAN PADANG ID
                </h2>
                <p className="text-[11px] text-stone-600">
                  Jl. Pintu Air Raya No. 18, Pasar Baru, Jakarta Pusat • Telp: +62 851-4741-3866
                </p>
                <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest pt-1">
                  LAPORAN PEMBUKUAN & REKAP TRANSAKSI PENJUALAN KASIR
                </p>
              </div>

              {/* Ringkasan Angka */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Total Transaksi</span>
                  <span className="font-bold text-sm text-stone-900">{orders.length} Pesanan</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Total Pemasukan (Omzet)</span>
                  <span className="font-bold text-sm text-[#a61c1c]">Rp {totalOmzet.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Total Pengeluaran</span>
                  <span className="font-bold text-sm text-red-700">Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Tabel Ringkas 10 Transaksi Terakhir */}
              <div>
                <h4 className="font-bold text-xs uppercase mb-2">Daftar Transaksi Terakhir:</h4>
                <table className="w-full border-collapse border border-stone-200 text-[11px]">
                  <thead>
                    <tr className="bg-stone-100 font-bold">
                      <th className="border border-stone-200 p-2 text-left">No. Pesanan</th>
                      <th className="border border-stone-200 p-2 text-left">Pelanggan</th>
                      <th className="border border-stone-200 p-2 text-left">Status</th>
                      <th className="border border-stone-200 p-2 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map(o => (
                      <tr key={o.id}>
                        <td className="border border-stone-200 p-2 font-mono">#{o.nomor_pesanan}</td>
                        <td className="border border-stone-200 p-2">{o.nama_pelanggan}</td>
                        <td className="border border-stone-200 p-2">{o.status}</td>
                        <td className="border border-stone-200 p-2 text-right font-bold">
                          Rp {Number(o.total_harga || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-6 flex justify-between text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold mt-12 underline">Manajer Operasional</p>
                </div>
                <div>
                  <p>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                  <p className="font-bold mt-12 underline">{activeOperator?.nama || 'Vinzkie'} (Kasir Utama)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
