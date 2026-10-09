import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StorySection from './components/StorySection';
import MenuCatalog from './components/MenuCatalog';
import CateringSection from './components/CateringSection';
import OutletLocator from './components/OutletLocator';
import OrderTrayModal from './components/OrderTrayModal';
import DatabaseDashboardModal from './components/DatabaseDashboardModal';
import AdminPortal from './components/AdminPortal';
import AdminLogin from './components/AdminLogin';
import FloatingCartBar from './components/FloatingCartBar';
import OrderTracker from './components/OrderTracker';
import Footer from './components/Footer';
import PaymentMethodsModal from './components/PaymentMethodsModal';

// Data Fallback jika Backend offline (foto kuliner lokal beresolusi tinggi)
const FALLBACK_MENUS = [
  { 
    id: 1, 
    nama: 'Rendang Daging Sapi Darek', 
    kategori: 'Daging', 
    harga: 28000, 
    deskripsi: 'Daging sapi pilihan direbus santan kelapa tua selama 8 jam dengan 16 rempah alami hingga karamelisasi pekat gurih.', 
    image_url: '/images/menu/rendang.jpg',
    badge: 'Best Seller', 
    is_spicy: 1,
    stok_status: 'Tersedia'
  },
  { 
    id: 2, 
    nama: 'Ayam Pop Gurih Tradisi', 
    kategori: 'Ayam', 
    harga: 24000, 
    deskripsi: 'Ayam pejantan dimasak rempah air kelapa muda gurih, disajikan dengan saus lado merah segar khas Bukittinggi.', 
    image_url: '/images/menu/ayam-pop.jpg',
    badge: 'Favorit', 
    is_spicy: 0,
    stok_status: 'Tersedia'
  },
  { 
    id: 3, 
    nama: 'Gulai Tunjang Sapi Empuk', 
    kategori: 'Daging', 
    harga: 32000, 
    deskripsi: 'Kikil tunjang sapi kenyal empuk berkuah gulai santan kental berbumbu kapulaga, lengkuas, dan asam kandis.', 
    image_url: '/images/menu/gulai-tunjang.jpg',
    badge: 'Khas Minang', 
    is_spicy: 1,
    stok_status: 'Tersedia'
  },
  { 
    id: 4, 
    nama: 'Dendeng Batokok Lado Mudo', 
    kategori: 'Daging', 
    harga: 29000, 
    deskripsi: 'Irisan daging sapi pipih empuk dipanggang gurih, disiram ulekan kasar cabai hijau segar dan minyak kelapa.', 
    image_url: '/images/menu/dendeng-batokok.jpg',
    badge: 'Pedas Mantap', 
    is_spicy: 1,
    stok_status: 'Tersedia'
  },
  { 
    id: 5, 
    nama: 'Gulai Kepala Ikan Kakap', 
    kategori: 'Ikan & Laut', 
    harga: 48000, 
    deskripsi: 'Kepala kakap merah segar dengan kuah gulai rempah kuning asam pedas gurih harum daun ruku-ruku.', 
    image_url: '/images/menu/gulai-kakap.jpg',
    badge: 'Istimewa', 
    is_spicy: 1,
    stok_status: 'Tersedia'
  },
  { 
    id: 6, 
    nama: 'Ayam Goreng Lengkuas Panas', 
    kategori: 'Ayam', 
    harga: 23000, 
    deskripsi: 'Ayam bumbu rempah kuning ditaburi rempah parutan lengkuas garing keemasan yang renyah.', 
    image_url: '/images/menu/ayam-goreng.jpg',
    badge: 'Renyah', 
    is_spicy: 0,
    stok_status: 'Tersedia'
  },
  { 
    id: 7, 
    nama: 'Cincang Daging Sapi Pedas', 
    kategori: 'Daging', 
    harga: 27000, 
    deskripsi: 'Potongan daging sandung lamur empuk berbumbu gulai kari cincang merah pedas berempah kuat.', 
    image_url: '/images/menu/cincang-daging.jpg',
    badge: 'Pedas Gurih', 
    is_spicy: 1,
    stok_status: 'Tersedia'
  },
  { 
    id: 8, 
    nama: 'Telur Dadar Tebal Padang', 
    kategori: 'Pelengkap', 
    harga: 14000, 
    deskripsi: 'Telur bebek padat tebal berpori rempah wangi daun kunyit, daun bawang, dan lada murni.', 
    image_url: '/images/menu/telur-dadar.jpg',
    badge: 'Wajib Coba', 
    is_spicy: 0,
    stok_status: 'Tersedia'
  },
  { 
    id: 9, 
    nama: 'Gulai Daun Singkong & Ikan Teri', 
    kategori: 'Sayuran', 
    harga: 12000, 
    deskripsi: 'Pucuk daun singkong muda lembut dimasak santan bumbu kuning gurih berpadu taburan ikan teri medan renyah.', 
    image_url: '/images/menu/gulai-singkong.jpg',
    badge: 'Sayur Segar', 
    is_spicy: 0,
    stok_status: 'Tersedia'
  },
  { 
    id: 10, 
    nama: 'Sambal Lado Mudo Minang', 
    kategori: 'Pelengkap', 
    harga: 8000, 
    deskripsi: 'Cabai hijau kriting, tomat hijau, dan bawang merah diulek kasar dengan perasan jeruk nipis dan minyak panas.', 
    image_url: '/images/menu/sambal-lado-mudo.jpg',
    badge: 'Ekstra Pedas', 
    is_spicy: 1,
    stok_status: 'Tersedia'
  },
  { 
    id: 11, 
    nama: 'Es Tebak Tradisional', 
    kategori: 'Minuman', 
    harga: 16000, 
    deskripsi: 'Minuman segar es serut tape ketan hitam, tebak cendol beras, kolang-kaling manis, sirup merah, dan santan dingin.', 
    image_url: '/images/menu/es-tebak.jpg',
    badge: 'Khas Padang', 
    is_spicy: 0,
    stok_status: 'Tersedia'
  },
  { 
    id: 12, 
    nama: 'Teh Talua Kocok Padang', 
    kategori: 'Minuman', 
    harga: 18000, 
    deskripsi: 'Teh pekat hangat berpadu kocokan kuning telur bebek berbusa lembut, susu kental manis, dan perasan jeruk nipis.', 
    image_url: '/images/menu/teh-talua.jpg',
    badge: 'Penambah Energi', 
    is_spicy: 0,
    stok_status: 'Tersedia'
  }
];

const FALLBACK_OUTLETS = [
  { id: 1, nama_cabang: 'Outlet Utama Pasar Baru', tipe: 'Pusat', alamat: 'Jl. Pintu Air Raya No. 18, Pasar Baru, Sawah Besar', kota: 'Jakarta Pusat', telepon: '0812-9988-7761', jam_buka: '10.00 - 22.00 WIB', kapasitas: 'Dine-in 120 Orang • Parkir 25 Mobil' },
  { id: 2, nama_cabang: 'Outlet Sudirman SCBD', tipe: 'Cabang Bisnis', alamat: 'Gedung Artha Graha Ground Floor, Kawasan SCBD', kota: 'Jakarta Selatan', telepon: '0812-9988-7762', jam_buka: '09.30 - 21.30 WIB', kapasitas: 'Area VIP Rapat • Siap Nasi Kotak Kantor' },
  { id: 3, nama_cabang: 'Outlet Bintaro Sektor 7', tipe: 'Cabang Keluarga', alamat: 'Ruko Kebayoran Arcade 2 Blok B No. 8, Bintaro Jaya', kota: 'Tangerang Selatan', telepon: '0812-9988-7763', jam_buka: '10.00 - 22.00 WIB', kapasitas: 'Area Bermain Anak • Ruang AC Bebas Asap' }
];

export default function App() {
  // Support direct browser path /admin as well as internal state navigation
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin') ? 'admin' : 'store';
    }
    return 'store';
  });

  const [menuItems, setMenuItems] = useState(FALLBACK_MENUS);
  const [outlets, setOutlets] = useState(FALLBACK_OUTLETS);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbEngine, setDbEngine] = useState('MySQL (phpMyAdmin)');

  const [trayItems, setTrayItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bk_tray');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keamanan: Validasi token kriptografis server (Bukan sekadar boolean localStorage)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Verifikasi Kriptografis Token Pengelola dengan Backend
  const verifyAdminSession = async () => {
    const token = localStorage.getItem('bk_admin_token');
    // Bersihkan residu boolean yang rentan diutak-atik
    localStorage.removeItem('bk_admin_auth');
    localStorage.removeItem('bk_admin_user');

    if (!token) {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      return;
    }

    try {
      setIsVerifyingAdmin(true);
      const res = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.valid) {
        setIsAdminAuthenticated(true);
        setAdminUser(data.user);
      } else {
        // Token tidak sah, dimanipulasi di DevTools, atau kedaluwarsa
        localStorage.removeItem('bk_admin_token');
        setIsAdminAuthenticated(false);
        setAdminUser(null);
      }
    } catch {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
    } finally {
      setIsVerifyingAdmin(false);
    }
  };

  // Verifikasi sesi setiap kali masuk ke /admin
  useEffect(() => {
    if (currentView === 'admin') {
      verifyAdminSession();
    }
  }, [currentView]);

  // Pantau manipulasi penyimpanan lokal di DevTools (Application Tab) secara real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bk_admin_token' || e.key === 'bk_admin_auth' || e.key === 'bk_admin_user') {
        verifyAdminSession();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Synchronize browser history and address bar URL (/ and /admin)
  useEffect(() => {
    const handlePopState = () => {
      const isPathAdmin = window.location.pathname.startsWith('/admin');
      setCurrentView(isPathAdmin ? 'admin' : 'store');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    const targetPath = view === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Simpan keranjang ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bk_tray', JSON.stringify(trayItems));
    } catch (e) {
      console.error(e);
    }
  }, [trayItems]);

  // Fetch data dari Backend Node.js Relational Database (MySQL / SQLite)
  const refreshStoreData = async () => {
    setLoading(true);
    try {
      const [resMenu, resOutlet, resHealth] = await Promise.all([
        fetch('/api/menu').then(r => r.json()).catch(() => null),
        fetch('/api/outlet').then(r => r.json()).catch(() => null),
        fetch('/api/health').then(r => r.json()).catch(() => null)
      ]);

      if (resHealth && resHealth.engine) {
        setDbEngine(resHealth.engine);
      }

      if (resMenu && resMenu.success && resMenu.data.length > 0) {
        setMenuItems(resMenu.data);
        setDbConnected(true);
      }

      if (resOutlet && resOutlet.success && resOutlet.data.length > 0) {
        setOutlets(resOutlet.data);
      }
    } catch (err) {
      console.warn('Backend server belum aktif, menggunakan data offline lokal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStoreData();
  }, []);

  // Handler: Tambah ke nampan
  const handleAddToTray = (item) => {
    setTrayItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, jumlah: i.jumlah + 1 } : i
        );
      }
      return [...prev, { id: item.id, nama: item.nama, harga: item.harga, image_url: item.image_url, jumlah: 1 }];
    });
  };

  // Handler: Update kuantitas
  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setTrayItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, jumlah: newQty } : i))
    );
  };

  // Handler: Hapus item
  const handleRemoveItem = (id) => {
    setTrayItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Handler: Kosongkan nampan
  const handleClearTray = () => {
    setTrayItems([]);
  };

  // Handler: Tambah paket nasi kotak
  const handleAddPackage = (pkg) => {
    handleAddToTray({
      id: pkg.id,
      nama: pkg.nama,
      harga: pkg.harga,
      image_url: pkg.image_url
    });
    setIsTrayOpen(true);
  };

  // ================= VIEW: PORTAL ADMIN & KASIR DAPUR (/admin) =================
  if (currentView === 'admin') {
    // Layar proteksi keamanan saat memverifikasi token kriptografis
    if (isVerifyingAdmin) {
      return (
        <div className="min-h-screen bg-[#100805] flex flex-col items-center justify-center text-white px-4">
          <div className="w-12 h-12 border-4 border-[#b59261]/20 border-t-[#b59261] rounded-full animate-spin mb-4" />
          <h2 className="text-base font-semibold tracking-wide">Memvalidasi Keamanan Sesi...</h2>
          <p className="text-xs text-stone-400 mt-1">Memverifikasi tanda tangan kriptografis token pengelola resmi.</p>
        </div>
      );
    }

    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setIsAdminAuthenticated(true);
            setAdminUser(user);
          }}
          onBackToStore={() => {
            navigateTo('store');
            refreshStoreData();
          }}
        />
      );
    }

    return (
      <AdminPortal 
        adminUser={adminUser}
        onBackToStore={() => {
          navigateTo('store');
          refreshStoreData();
        }}
        onLogout={() => {
          localStorage.removeItem('bk_admin_token');
          localStorage.removeItem('bk_admin_user');
          localStorage.removeItem('bk_admin_auth');
          setIsAdminAuthenticated(false);
          setAdminUser(null);
        }}
      />
    );
  }

  // ================= VIEW: WEBSITE PELANGGAN / TAMU (/) =================
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-[#19120e] pb-16 sm:pb-0">
      {/* 1. Navbar */}
      <Navbar 
        trayItems={trayItems}
        onOpenTray={() => setIsTrayOpen(true)}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onOpenAdmin={() => navigateTo('admin')}
        dbEngine={dbEngine}
        dbConnected={dbConnected}
      />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Story & Filosofi */}
      <StorySection />

      {/* 4. Menu Catalog */}
      <MenuCatalog 
        menuItems={menuItems}
        onAddToTray={handleAddToTray}
        loading={loading}
      />

      {/* 5. Paket Nasi Kotak / Catering */}
      <CateringSection 
        onAddPackage={handleAddPackage}
      />

      {/* 6. Lacak Status Pesanan Real-Time (E-Commerce Feature) */}
      <OrderTracker />

      {/* 7. Cabang Outlet */}
      <OutletLocator 
        outlets={outlets}
      />

      {/* 8. Footer */}
      <Footer 
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onOpenAdmin={() => navigateTo('admin')}
      />

      {/* Floating Bottom Cart Bar (ShopeeFood / GoFood Standard) */}
      <FloatingCartBar 
        trayItems={trayItems}
        onOpenTray={() => setIsTrayOpen(true)}
      />

      {/* Floating WhatsApp Action (Anti-Overlap with Cart Bar on Mobile) */}
      <a
        href="https://wa.me/6285147413866?text=Halo%20Masakan%20Padang%20ID,%20saya%20ingin%20bertanya%20menu%20dan%20pesanan."
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed ${trayItems.length > 0 ? 'bottom-24 sm:bottom-6' : 'bottom-6'} right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group`}
        aria-label="Hubungi WhatsApp"
        title="Chat WhatsApp Kasir: 0851-4741-3866"
      >
        <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

      {/* Modals */}
      <OrderTrayModal 
        isOpen={isTrayOpen}
        onClose={() => setIsTrayOpen(false)}
        trayItems={trayItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearTray={handleClearTray}
        onOpenPaymentInfo={() => setIsPaymentModalOpen(true)}
      />

      <DatabaseDashboardModal 
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onOpenAdmin={() => navigateTo('admin')}
      />

      <PaymentMethodsModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onOpenTray={() => setIsTrayOpen(true)}
      />
    </div>
  );
}
