import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Sparkles, Award, FileText, 
  Users, Settings, ShieldCheck, Printer, Download, Plus, 
  Trash2, Edit3, CheckCircle2, AlertCircle, Clock, 
  DollarSign, PieChart, ShieldAlert, Check, X
} from 'lucide-react';

export default function OwnerView({
  activeTab,
  orders,
  expenses,
  staffList,
  totalOmzet,
  totalPengeluaran,
  labaBersih,
  profitMargin,
  avgOrderValue,
  topSellingMenus,
  onShowPrintReport,
  handleExportCSV,
  onOpenAddStaff,
  onEditStaff,
  onToggleStaffStatus,
  onDeleteStaff
}) {
  // ================= 1. STATE PENGATURAN TOKO & PAJAK =================
  const [storeSettings, setStoreSettings] = useState({
    namaToko: 'Rumah Makan Padang Bundo Kanduang',
    tagline: 'Kelezatan Tradisi Minang Autentik & Halal',
    alamat: 'Jl. Pintu Air Raya No. 18, Pasar Baru, Sawah Besar, Jakarta Pusat',
    telepon: '+62 851-4741-3866',
    email: 'info@masakanpadang.id',
    ppnPajak: 10, // PB1 Restoran 10%
    biayaBungkus: 2000,
    qrisNmid: 'ID1020039281729 - Masakan Padang ID',
    qrisStatus: 'Aktif Terhubung',
    jamOperasional: '10.00 - 22.00 WIB'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // ================= 2. STATE AUDIT LOG & VOID PERSETUJUAN =================
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, waktu: '12 Okt 2026 18:45', user: 'Rian Hendra', role: 'Kasir', aksi: 'Transaksi POS Tunai', detail: 'Memproses pesanan #BK-829102 sebesar Rp 56.000', ip: '192.168.1.15' },
    { id: 2, waktu: '12 Okt 2026 17:30', user: 'Rian Hendra', role: 'Kasir', aksi: 'Buka Laci Kasir (Cash In)', detail: 'Mencatat modal awal kembalian Rp 250.000', ip: '192.168.1.15' },
    { id: 3, waktu: '12 Okt 2026 16:15', user: 'Vinzkie', role: 'Admin', aksi: 'Perubahan Harga Menu', detail: 'Ubah harga Rendang Daging dari Rp 27.000 ke Rp 28.000', ip: '192.168.1.10' },
    { id: 4, waktu: '12 Okt 2026 14:00', user: 'Rian Hendra', role: 'Kasir', aksi: 'Pengajuan Void Transaksi', detail: 'Mengajukan pembatalan pesanan salah input #BK-771890 (Rp 84.000)', ip: '192.168.1.15' },
    { id: 5, waktu: '12 Okt 2026 11:20', user: 'Vinzkie', role: 'Admin', aksi: 'Restock Bahan Supplier', detail: 'Catat barang masuk Daging Sapi 15 Kg dari PD. Berkah Senen', ip: '192.168.1.10' }
  ]);

  const [voidRequests, setVoidRequests] = useState([
    {
      id: 1,
      nomorPesanan: 'BK-771890',
      pemohon: 'Rian Hendra (Kasir 1)',
      alasan: 'Pelanggan salah memilih varian lauk dan meminta pembatalan nota sebelum dimasak',
      nominal: 84000,
      waktu: '12 Okt 2026 14:00 WIB',
      status: 'Menunggu Persetujuan Owner'
    }
  ]);

  // Handle Save Settings
  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      alert('Pengaturan Toko, Pajak PB1 & Sistem Pembayaran berhasil disimpan!');
    }, 600);
  };

  // Handle Approve Void
  const handleApproveVoid = (requestId) => {
    setVoidRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Disetujui Owner (Void Sukses)' } : r));
    setAuditLogs(prev => [
      {
        id: Date.now(),
        waktu: new Date().toLocaleString('id-ID'),
        user: 'Vinzkie',
        role: 'Owner',
        aksi: 'Otorisasi Void Disetujui',
        detail: `Menyetujui pembatalan pesanan #${voidRequests.find(v => v.id === requestId)?.nomorPesanan} (Rp ${voidRequests.find(v => v.id === requestId)?.nominal.toLocaleString('id-ID')})`,
        ip: '192.168.1.2'
      },
      ...prev
    ]);
    alert('Otorisasi Void berhasil disetujui! Pembatalan transaksi telah dicatat di Audit Log.');
  };

  // Handle Reject Void
  const handleRejectVoid = (requestId) => {
    setVoidRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Ditolak Owner' } : r));
    alert('Permintaan Void ditolak.');
  };

  return (
    <div className="space-y-6">

      {/* ================= TAB 1: DASHBOARD ANALITIK & LABA RUGI (P&L) ================= */}
      {activeTab === 'owner_dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Executive Hero Banner */}
          <div className="bg-gradient-to-r from-[#1e100a] via-[#2d1b13] to-[#18100c] text-white p-5 sm:p-6 rounded-2xl border border-amber-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-200 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-[#f5d796]" />
                <span>Panel Eksekutif Pemilik Restoran (P&L Real-Time)</span>
              </div>
              <h3 className="font-serif font-black text-lg sm:text-xl text-white">
                Analisis Finansial & Laporan Laba Rugi Bisnis
              </h3>
              <p className="text-xs text-stone-300">
                Pemantauan perputaran omzet kotor, beban modal belanja bahan, hingga laba bersih bersih resto secara real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={onShowPrintReport}
              className="px-4 py-2.5 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Direksi Resmi ➔</span>
            </button>
          </div>

          {/* 4 Financial KPI Cards (P&L) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Omzet Penjualan</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-mono font-black text-xl sm:text-2xl text-stone-900">
                Rp {totalOmzet.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">{orders.length} total pesanan kasir</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Beban Modal & Belanja</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <div className="font-mono font-black text-xl sm:text-2xl text-red-700">
                Rp {totalPengeluaran.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">{expenses.length} pos biaya bahan & utilitas</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-emerald-300 bg-emerald-50/30 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Laba Bersih (Net Profit)</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className={`font-mono font-black text-xl sm:text-2xl ${labaBersih >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                Rp {labaBersih.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">Omzet dikurangi Beban belanja</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Margin Keuntungan</span>
                <Award className="w-4 h-4 text-[#caa268]" />
              </div>
              <div className="font-mono font-black text-xl sm:text-2xl text-[#a61c1c]">
                {profitMargin}%
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Rata-rata: Rp {avgOrderValue.toLocaleString('id-ID')} / pesanan</p>
            </div>
          </div>

          {/* Ranking Menu Terlaris (Leaderboard Revenue Dishes) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-black text-base text-stone-900">
                  Ranking Hidangan Terlaris & Kontributor Omzet
                </h4>
                <p className="text-xs text-stone-500">
                  5 Menu Padang yang paling banyak dipesan dan menghasilkan perputaran uang tertinggi
                </p>
              </div>
              <Award className="w-5 h-5 text-[#caa268]" />
            </div>

            <div className="divide-y divide-stone-100">
              {topSellingMenus.map((dish, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#18100c] text-white font-mono font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-stone-900">{dish.name}</div>
                      <div className="text-[10px] text-stone-400">Terjual {dish.qty} porsi</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-stone-900">
                      Rp {Number(dish.revenue || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Kontribusi Omzet</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: SEMUA LAPORAN & EKSPOR DATA ================= */}
      {activeTab === 'owner_reports' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Akses Seluruh Laporan Pembukuan & Audit
              </h3>
              <p className="text-xs text-stone-500">
                Unduh rekapitulasi data penjualan lengkap dalam format Excel/CSV atau cetak lembar resmi ber-kop surat resto.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Excel / CSV</span>
              </button>

              <button
                type="button"
                onClick={onShowPrintReport}
                className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Resmi</span>
              </button>
            </div>
          </div>

          {/* Tabel Riwayat Seluruh Transaksi Restoran */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-x-auto shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Daftar Seluruh Transaksi Masuk ({orders.length} Pesanan)
              </h4>
            </div>

            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-stone-50 text-stone-500 font-mono border-b">
                <tr>
                  <th className="p-3">No. Pesanan</th>
                  <th className="p-3">Tanggal & Jam</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Layanan</th>
                  <th className="p-3">Detail Nampan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 20).map(o => (
                  <tr key={o.id}>
                    <td className="p-3 font-mono font-bold text-[#a61c1c]">#{o.nomor_pesanan}</td>
                    <td className="p-3 text-stone-500 font-mono">{o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : '-'}</td>
                    <td className="p-3 font-bold text-stone-900">{o.nama_pelanggan}</td>
                    <td className="p-3 text-stone-600">{o.tipe_layanan}</td>
                    <td className="p-3 max-w-[200px] truncate text-stone-700">
                      {(o.items || []).map(i => `${i.nama || i.nama_item} (${i.jumlah}x)`).join(', ')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-stone-900">
                      Rp {Number(o.total_harga || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ================= TAB 3: MANAJEMEN PENGGUNA (USER MANAGEMENT) ================= */}
      {activeTab === 'user_mgmt' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Manajemen Pengguna (User Management)
              </h3>
              <p className="text-xs text-stone-500">
                Owner berwenang mengelola, menambah akun kasir/admin baru, mengubah shift, serta menonaktifkan akun karyawan.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAddStaff}
              className="px-4 py-2 bg-[#a61c1c] hover:bg-[#881414] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Daftarkan Karyawan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map(staf => (
              <div key={staf.id} className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                      {staf.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleStaffStatus && onToggleStaffStatus(staf.id, staf.status)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                        staf.status === 'Aktif' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-stone-100 text-stone-600 border-stone-300'
                      }`}
                    >
                      {staf.status} (Klik Toggle)
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-stone-900 pt-1">{staf.nama}</h4>
                  <p className="text-xs text-stone-500 font-mono">{staf.no_telp}</p>
                  <p className="text-[11px] text-stone-600">Jadwal Shift: <strong>{staf.shift}</strong></p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEditStaff && onEditStaff(staf)}
                    className="p-1.5 text-stone-600 hover:text-[#a61c1c] rounded-lg transition cursor-pointer"
                    title="Edit akun staf"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteStaff && onDeleteStaff(staf.id, staf.nama)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                    title="Hapus akun"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= TAB 4: PENGATURAN TOKO & PAJAK SISTEM ================= */}
      {activeTab === 'store_settings' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
            <h3 className="font-serif font-black text-lg text-stone-900">
              Pengaturan Toko, Pajak Restoran & Sistem Pembayaran
            </h3>
            <p className="text-xs text-stone-500">
              Ubah identitas resmi restoran yang tercetak di struk nota, alamat cabang, dan regulasi pajak PB1.
            </p>
          </div>

          <form onSubmit={handleSaveStoreSettings} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Usaha / Warung Padang</label>
                <input
                  type="text"
                  value={storeSettings.namaToko}
                  onChange={(e) => setStoreSettings(p => ({ ...p, namaToko: e.target.value }))}
                  className="w-full border p-2.5 rounded-xl bg-stone-50 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Tagline Slogan</label>
                <input
                  type="text"
                  value={storeSettings.tagline}
                  onChange={(e) => setStoreSettings(p => ({ ...p, tagline: e.target.value }))}
                  className="w-full border p-2.5 rounded-xl bg-stone-50 outline-none focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Alamat Lengkap Restoran</label>
                <input
                  type="text"
                  value={storeSettings.alamat}
                  onChange={(e) => setStoreSettings(p => ({ ...p, alamat: e.target.value }))}
                  className="w-full border p-2.5 rounded-xl bg-stone-50 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Nomor Kontak / WhatsApp Resmi</label>
                <input
                  type="text"
                  value={storeSettings.telepon}
                  onChange={(e) => setStoreSettings(p => ({ ...p, telepon: e.target.value }))}
                  className="w-full border p-2.5 rounded-xl bg-stone-50 outline-none focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Pajak Restoran PB1 (%)</label>
                <input
                  type="number"
                  value={storeSettings.ppnPajak}
                  onChange={(e) => setStoreSettings(p => ({ ...p, ppnPajak: Number(e.target.value) }))}
                  className="w-full border p-2.5 rounded-xl bg-stone-50 outline-none focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Biaya Kemasan Nasi Kotak (Rp)</label>
                <input
                  type="number"
                  value={storeSettings.biayaBungkus}
                  onChange={(e) => setStoreSettings(p => ({ ...p, biayaBungkus: Number(e.target.value) }))}
                  className="w-full border p-2.5 rounded-xl bg-stone-50 outline-none focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Integrasi QRIS Dinamis</label>
                <input
                  type="text"
                  value={storeSettings.qrisMerchant}
                  disabled
                  className="w-full border p-2.5 rounded-xl bg-stone-100 text-stone-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 bg-[#a61c1c] hover:bg-[#881414] text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                {savingSettings ? 'Menyimpan Pengaturan...' : 'Simpan Perubahan Sistem ➔'}
              </button>
            </div>
          </form>

        </div>
      )}

      {/* ================= TAB 5: AUDIT LOG & PERSETUJUAN KHUSUS (VOID) ================= */}
      {activeTab === 'audit_log' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
            <h3 className="font-serif font-black text-lg text-stone-900">
              Audit Log Aktivitas & Otorisasi Khusus (Anti-Fraud)
            </h3>
            <p className="text-xs text-stone-500">
              Memantau aktivitas penting staf untuk mencegah kecurangan, serta memberikan otorisasi pembatalan transaksi (void).
            </p>
          </div>

          {/* Panel Permintaan Otorisasi Void */}
          <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-900 font-serif font-black text-sm">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h4>Permintaan Otorisasi Pembatalan Transaksi (Void Approval)</h4>
            </div>

            <div className="space-y-2">
              {voidRequests.map(req => (
                <div key={req.id} className="p-4 bg-white rounded-xl border border-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#a61c1c]">#{req.nomorPesanan}</span>
                      <span className="font-bold text-stone-900">Rp {req.nominal.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{req.waktu}</span>
                    </div>
                    <p className="text-stone-600">Pemohon: <strong>{req.pemohon}</strong></p>
                    <p className="text-stone-500 italic">Alasan: "{req.alasan}"</p>
                    <div className="text-[10px] font-bold text-amber-700">{req.status}</div>
                  </div>

                  {req.status.includes('Menunggu') ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRejectVoid(req.id)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveVoid(req.id)}
                        className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow cursor-pointer"
                      >
                        ✓ Setujui Pembatalan (Void)
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-emerald-700">{req.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-x-auto shadow-sm p-4 space-y-3">
            <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
              Log Rekam Jejak Aktivitas Sistem Karyawan
            </h4>

            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-stone-50 text-stone-500 font-mono border-b">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Nama Pengguna</th>
                  <th className="p-3">Peran Role</th>
                  <th className="p-3">Jenis Tindakan</th>
                  <th className="p-3">Rincian Operasi</th>
                  <th className="p-3 text-right">Alamat IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td className="p-3 font-mono text-stone-500">{log.waktu}</td>
                    <td className="p-3 font-bold text-stone-900">{log.user}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 border">
                        {log.role}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-stone-800">{log.aksi}</td>
                    <td className="p-3 text-stone-600">{log.detail}</td>
                    <td className="p-3 text-right font-mono text-stone-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
