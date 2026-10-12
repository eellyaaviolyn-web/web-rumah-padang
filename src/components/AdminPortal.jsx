import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Receipt, UtensilsCrossed, Wallet, Users, FileText, 
  Database, Search, Plus, Trash2, Edit3, Printer, Phone, 
  ExternalLink, LogOut, CheckCircle2, Clock, Flame, 
  ChefHat, Bike, X, ChevronRight, Menu as MenuIcon, 
  RefreshCw, DollarSign, TrendingUp, TrendingDown, ShieldCheck, Check,
  Sparkles, Download, Volume2, VolumeX, Filter, Grid, List, 
  ArrowUpRight, PieChart, Layers, AlertCircle, Crown, ShoppingCart, Award,
  Tag, Settings
} from 'lucide-react';
import ReceiptModal from './ReceiptModal';
import KasirView from './roles/KasirView';
import AdminView from './roles/AdminView';
import OwnerView from './roles/OwnerView';

export default function AdminPortal({ onBackToStore, onLogout, adminUser }) {
  // Identifikasi Peran Pengguna Aktif (Multi-Role: Kasir, Admin, Owner)
  const userRole = (adminUser?.role || 'Admin').toLowerCase();
  const isKasir = userRole.includes('kasir');
  const isOwner = userRole.includes('owner');
  const isAdmin = !isKasir && !isOwner;

  // Navigation: Kasir ke pos, Owner ke owner_dashboard, Admin ke dashboard_ops
  const [activeTab, setActiveTab] = useState(() => {
    const role = (adminUser?.role || 'Admin').toLowerCase();
    if (role.includes('kasir')) return 'pos';
    if (role.includes('owner')) return 'owner_dashboard';
    return 'dashboard_ops';
  });
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

  // Navigation Items Terfilter Sesuai Hak Akses Peran Spesifik (Kasir, Admin, Owner)
  const navItems = useMemo(() => {
    if (isKasir) {
      return [
        { id: 'pos', label: 'Transaksi / POS Kasir', icon: ShoppingCart, badge: 'POS' },
        { id: 'orders', label: 'Riwayat Shift Saya', icon: Clock, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Baru` : null },
        { id: 'customers_light', label: 'Member & Pelanggan', icon: Users, badge: null },
        { id: 'cash_drawer', label: 'Buka / Tutup Kasir', icon: Wallet, badge: 'Laci' },
        { id: 'menu_stock', label: 'Katalog & Stok Lauk', icon: UtensilsCrossed, badge: `${menuItems.length}` },
      ];
    }
    if (isOwner) {
      return [
        { id: 'owner_dashboard', label: 'Analitik & Laba Rugi', icon: TrendingUp, badge: 'P&L' },
        { id: 'owner_reports', label: 'Semua Laporan & Ekspor', icon: FileText, badge: null },
        { id: 'user_mgmt', label: 'Manajemen Pengguna', icon: Users, badge: `${staffList.length}` },
        { id: 'store_settings', label: 'Pengaturan Toko & Pajak', icon: Settings, badge: null },
        { id: 'audit_log', label: 'Audit Log & Persetujuan', icon: ShieldCheck, badge: 'Anti-Fraud' },
      ];
    }
    // Default Admin Resto
    return [
      { id: 'dashboard_ops', label: 'Dashboard Operasional', icon: LayoutDashboard, badge: null },
      { id: 'menu_admin', label: 'Produk & Harga', icon: UtensilsCrossed, badge: `${menuItems.length}` },
      { id: 'inventory', label: 'Stok & Inventaris Bahan', icon: Layers, badge: 'Stok' },
      { id: 'promo', label: 'Diskon & Promo Kupon', icon: Tag, badge: null },
      { id: 'partners', label: 'Pelanggan & Supplier', icon: Users, badge: null },
      { id: 'daily_report', label: 'Laporan Harian', icon: FileText, badge: null },
      { id: 'database', label: 'Database & phpMyAdmin', icon: Database, badge: 'MySQL' },
    ];
  }, [isKasir, isOwner, pendingOrdersCount, menuItems.length, staffList.length]);

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
              if (activeOperator && isAdmin) setEditingStaffItem({ ...activeOperator });
            }}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:shadow-2xs transition group"
            title="Profil pengguna aktif"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 shadow-xs ${
                isKasir 
                  ? 'bg-emerald-600 text-white' 
                  : isOwner 
                  ? 'bg-purple-800 text-amber-300' 
                  : 'bg-[#18100c] text-[#f5d796]'
              }`}>
                {isOwner ? <Crown className="w-4 h-4" /> : isKasir ? <ShoppingCart className="w-4 h-4" /> : getInitials(activeOperator?.nama)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {activeOperator?.nama || adminUser?.nama || (isKasir ? 'Rian Hendra' : isOwner ? 'H. Dt. Palimo Kayo' : 'Ahmad Manager')}
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${
                  isKasir ? 'text-emerald-700' : isOwner ? 'text-purple-700' : 'text-[#a61c1c]'
                }`}>
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span className="truncate">{adminUser?.badge || (isKasir ? 'Kasir POS' : isOwner ? 'Owner Resto' : 'Admin Pengelola')}</span>
                </div>
              </div>
            </div>
            {isAdmin && (
              <div className="p-1 rounded text-slate-400 group-hover:text-red-700 transition shrink-0">
                <Edit3 className="w-3.5 h-3.5" />
              </div>
            )}
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
          {/* PERAN 1: KASIR VIEW */}
          {isKasir && (
            <KasirView
              activeTab={activeTab}
              menuItems={menuItems}
              orders={orders}
              activeOperator={activeOperator}
              onSelectReceipt={setSelectedReceiptOrder}
              onAdvanceOrderStatus={handleAdvanceStatus}
              onToggleStock={handleToggleStok}
              onNewOrderCreated={loadAdminData}
              playChime={playChime}
            />
          )}

          {/* PERAN 2: ADMIN VIEW */}
          {isAdmin && (
            <AdminView
              activeTab={activeTab}
              menuItems={menuItems}
              orders={orders}
              staffList={staffList}
              dbInfo={dbInfo}
              schemas={schemas}
              onOpenAddMenu={() => setShowAddMenuModal(true)}
              onOpenEditPrice={(item) => {
                setEditingPriceItem(item);
                setTempPrice(String(item.harga));
              }}
              onDeleteMenu={handleDeleteMenu}
              onToggleStock={handleToggleStok}
              handleExportCSV={handleExportCSV}
            />
          )}

          {/* PERAN 3: OWNER VIEW */}
          {isOwner && (
            <OwnerView
              activeTab={activeTab}
              orders={orders}
              expenses={expenses}
              staffList={staffList}
              totalOmzet={totalOmzet}
              totalPengeluaran={totalPengeluaran}
              labaBersih={labaBersih}
              profitMargin={profitMargin}
              avgOrderValue={avgOrderValue}
              topSellingMenus={topSellingMenus}
              onShowPrintReport={() => setShowPrintReportModal(true)}
              handleExportCSV={handleExportCSV}
              onOpenAddStaff={() => setShowAddStaffModal(true)}
              onEditStaff={(item) => setEditingStaffItem({ ...item })}
              onToggleStaffStatus={handleToggleStaffStatus}
              onDeleteStaff={handleDeleteStaff}
            />
          )}
        </main>

        {/* ================= MOBILE BOTTOM NAVIGATION (HP / SMARTPHONE) ================= */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {navItems.slice(0, 4).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
                  isActive ? 'text-[#a61c1c] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                {item.id === 'orders' && pendingOrdersCount > 0 && (
                  <span className="absolute top-0 right-2 w-4 h-4 bg-[#a61c1c] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
                <span className="text-[10px] truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}

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
