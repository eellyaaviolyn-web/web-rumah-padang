import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan username dan kata sandi pengelola.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('bk_admin_token', data.token);
        localStorage.removeItem('bk_admin_auth');
        localStorage.removeItem('bk_admin_user');
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Username atau kata sandi pengelola salah.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server autentikasi. Pastikan koneksi server aman dan aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#100805] flex font-sans antialiased text-stone-800 selection:bg-[#a61c1c] selection:text-white">
      
      {/* ================= LEFT COLUMN: HERO BRANDING ================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#100805] border-r border-[#2d1b13]">
        
        {/* Background Image with Layered Gradient Overlays */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 transition-transform duration-1000"
          style={{ 
            backgroundImage: `url('/hero-rumah-gadang-hd.jpg')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0705] via-[#140b07]/85 to-[#1e100a]/90" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a61c1c]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#c59837]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 w-fit shadow-lg">
            <img 
              src="/logo-horizontal.png" 
              alt="Masakan Padang ID" 
              className="h-9 w-auto object-contain" 
            />
          </div>

          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Toko Pelanggan</span>
            </button>
          )}
        </div>

        {/* Middle: Clean Headline & Description */}
        <div className="relative z-10 my-auto py-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-200 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portal Manajemen Kasir & Database</span>
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl font-black text-white leading-tight">
            Kelezatan Tradisi Minang, <br />
            <span className="text-[#f5d796]">Presisi Manajemen Modern.</span>
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-md">
            Akses aman dan terpusat untuk operasional kasir, antrean dapur, pemantauan stok hidangan, serta pembukuan arus kas otomatis.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-stone-400 text-xs font-mono">
            <div className="p-3 bg-black/40 rounded-xl border border-white/10">
              <span className="block text-[10px] text-stone-500 uppercase">Engine Basis Data</span>
              <span className="text-white font-bold">MySQL Relasional</span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/10">
              <span className="block text-[10px] text-stone-500 uppercase">Integrasi Sistem</span>
              <span className="text-[#f5d796] font-bold">POS Kasir & WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Clean subtle footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-stone-400 font-mono flex items-center justify-between">
          <span>Warung Padang Bundo Kanduang</span>
          <span className="text-emerald-400">● Sistem Online</span>
        </div>

      </div>


      {/* ================= RIGHT COLUMN: CLEAN MODERN SAAS LOGIN ================= */}
      <div className="w-full lg:w-1/2 xl:w-7/12 bg-[#fcfbf9] flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        
        {/* Central Auth Container */}
        <div className="max-w-md w-full mx-auto py-6">
          
          {/* Back to store mobile pill */}
          {onBackToStore && (
            <div className="mb-6 lg:hidden">
              <button
                onClick={onBackToStore}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Website Menu</span>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 tracking-tight">
              Login Pengelola Resto
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
              Silakan masuk menggunakan kredensial pengelola untuk mengoperasikan kasir POS, antrean dapur, dan sinkronisasi database.
            </p>
          </div>

          {/* Feedback: Error Message */}
          {errorMsg && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-xs p-3.5 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input: Username */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Username Pengelola
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username (contoh: admin)"
                  className="w-full bg-white hover:bg-stone-50 focus:bg-white border border-stone-200 focus:border-[#a61c1c] focus:ring-2 focus:ring-red-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 outline-none transition font-medium"
                  required
                />
              </div>
            </div>

            {/* Input: Password with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Kata Sandi / PIN Pengelola
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi (contoh: admin123)"
                  className="w-full bg-white hover:bg-stone-50 focus:bg-white border border-stone-200 focus:border-[#a61c1c] focus:ring-2 focus:ring-red-100 rounded-xl pl-10 pr-10 py-2.5 text-xs text-stone-900 placeholder-stone-400 outline-none transition font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#a61c1c] focus:ring-[#a61c1c] border-stone-300"
                />
                <span className="text-xs text-stone-600 font-medium">Ingat saya di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-[#a61c1c] to-[#871414] hover:from-[#ba2020] hover:to-[#961717] active:scale-98 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akun Pengelola...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Dashboard Resto ➔</span>
                </>
              )}
            </button>

          </form>

          {/* Return button at bottom */}
          {onBackToStore && (
            <div className="mt-8 pt-6 border-t border-stone-200 text-center">
              <button
                type="button"
                onClick={onBackToStore}
                className="text-xs text-stone-500 hover:text-[#a61c1c] font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Website Pemesanan Pelanggan</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
