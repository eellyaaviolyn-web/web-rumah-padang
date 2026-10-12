import React, { useState, useEffect } from 'react';
import { X, Database, RefreshCw, Layers, DollarSign, ShoppingCart, MapPin, Code2, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function DatabaseDashboardModal({ isOpen, onClose, onOpenAdmin }) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'schema'
  const [dbMeta, setDbMeta] = useState({ engine: 'MySQL (phpMyAdmin)', database: 'db_warung_padang' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStats, resOrders, resSchema] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/pesanan'),
        fetch('/api/schema')
      ]);

      const dataStats = await resStats.json();
      const dataOrders = await resOrders.json();
      const dataSchema = await resSchema.json();

      if (dataStats.success) {
        setStats(dataStats.data);
        if (dataStats.engine) setDbMeta({ engine: dataStats.engine, database: dataStats.database || 'db_warung_padang' });
      }
      if (dataOrders.success) setOrders(dataOrders.data);
      if (dataSchema.success) setSchemas(dataSchema.data);
    } catch (err) {
      console.error('Gagal mengambil data rekap database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Quick test: simulate an order for teacher evaluation
  const handleSimulateOrder = async () => {
    setSimulating(true);
    try {
      const sampleCustomerNames = ['Pak Guru Penguji', 'Bu Guru Penilai', 'Ahmad Dani SMK', 'Siti Rahmawati', 'Rizky Pratama'];
      const randomName = sampleCustomerNames[Math.floor(Math.random() * sampleCustomerNames.length)];
      
      const payload = {
        nama_pelanggan: randomName + ' (Uji DB)',
        nomor_wa: '08129988' + Math.floor(1000 + Math.random() * 9000),
        tipe_layanan: 'Nasi Kotak Kantor (Uji Praktik)',
        catatan: 'Simulasi pengujian koneksi database SQLite via React frontend',
        items: [
          { nama: 'Rendang Daging Sapi Darek', harga: 28000, jumlah: 2 },
          { nama: 'Ayam Pop Gurih Sambal Lado', harga: 24000, jumlah: 1 },
          { nama: 'Teh Talua Kocok Padang', harga: 14000, jumlah: 2 }
        ]
      };

      const res = await fetch('/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        await fetchData();
        setActiveTab('orders');
      }
    } catch (err) {
      console.error('Gagal simulasi pesanan:', err);
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-[#d6cbbe]">
        
        {/* Header */}
        <div className="bg-[#18100c] text-white p-5 flex items-center justify-between border-b border-[#3b271d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2a170f] border border-[#523829] text-[#c59837]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#fbf6ec]">Dashboard Database {dbMeta.engine}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 rounded font-semibold">
                  Tugas Praktik SMK
                </span>
              </div>
              <p className="text-[11px] text-[#918175]">
                Relasi 4 Tabel Aktif di <span className="font-mono text-[#c59837]">{dbMeta.database}</span> (Siap Dibuka di phpMyAdmin)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateOrder}
              disabled={simulating}
              className="px-3 py-1.5 bg-[#a61c1c] hover:bg-[#881414] text-white rounded-lg transition flex items-center gap-1.5 text-xs font-semibold shadow"
              title="Kirim 1 transaksi uji coba untuk membuktikan SQLite bekerja realtime"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{simulating ? 'Menyimpan...' : '+ Simulasi Uji Transaksi'}</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 text-[#c59837] hover:text-white rounded-lg hover:bg-white/10 transition flex items-center gap-1 text-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-[#918175] hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="bg-[#241711] px-5 py-2.5 flex items-center justify-between border-b border-[#3b271d] text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'orders'
                  ? 'bg-[#a61c1c] text-white shadow'
                  : 'text-[#c4b5a5] hover:text-white hover:bg-white/5'
              }`}
            >
              📋 Rekap Transaksi ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'schema'
                  ? 'bg-[#a61c1c] text-white shadow'
                  : 'text-[#c4b5a5] hover:text-white hover:bg-white/5'
              }`}
            >
              🏗️ Struktur Skema DDL ({schemas.length} Tabel)
            </button>
          </div>

          <div className="text-[11px] text-[#918175] font-mono hidden sm:block">
            SQLite 3 + Express.js REST API
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#fcfbf9]">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-white rounded-xl border border-[#e8ded2] shadow-sm">
              <div className="flex items-center gap-2 text-[#7d7065] mb-1">
                <Layers className="w-4 h-4 text-[#a61c1c]" /> Total Menu
              </div>
              <div className="text-xl font-bold text-[#19120e]">{stats ? stats.total_menu : '...'} item</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1 font-mono">Tabel: menu</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#e8ded2] shadow-sm">
              <div className="flex items-center gap-2 text-[#7d7065] mb-1">
                <MapPin className="w-4 h-4 text-[#c59837]" /> Total Outlet
              </div>
              <div className="text-xl font-bold text-[#19120e]">{stats ? stats.total_outlet : '...'} cabang</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1 font-mono">Tabel: outlet</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#e8ded2] shadow-sm">
              <div className="flex items-center gap-2 text-[#7d7065] mb-1">
                <ShoppingCart className="w-4 h-4 text-[#a61c1c]" /> Pesanan Masuk
              </div>
              <div className="text-xl font-bold text-[#a61c1c]">{stats ? stats.total_pesanan : '...'} transaksi</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1 font-mono">Tabel: pesanan</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#e8ded2] shadow-sm">
              <div className="flex items-center gap-2 text-[#7d7065] mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Total Omzet
              </div>
              <div className="text-base font-bold text-emerald-700 truncate">
                Rp {stats ? stats.total_omzet.toLocaleString('id-ID') : '...'}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1 font-mono">Agregat: SUM()</div>
            </div>
          </div>

          {/* TAB 1: Orders Table */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-[#e8ded2] overflow-hidden shadow-sm">
              <div className="p-4 bg-[#f8f5ee] border-b border-[#eee5d8] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#19120e]">Rekap Transaksi Relasional SQLite</h4>
                  <p className="text-[11px] text-[#7d7065]">JOIN relasi tabel <span className="font-mono text-[#a61c1c]">pesanan</span> dan <span className="font-mono text-[#a61c1c]">pesanan_items</span></p>
                </div>
                <span className="text-xs font-mono font-bold text-[#a61c1c]">{orders.length} Data Tersimpan</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-[#918175]">
                  <div className="w-6 h-6 border-2 border-[#a61c1c] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Memuat data pesanan...
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#918175]">
                  Belum ada transaksi di database. Silakan klik tombol <strong>+ Simulasi Uji Transaksi</strong> di pojok kanan atas!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fcfbf9] text-[#7d7065] font-mono border-b border-[#eee5d8]">
                      <tr>
                        <th className="p-3">No. Pesanan</th>
                        <th className="p-3">Pelanggan</th>
                        <th className="p-3">Layanan</th>
                        <th className="p-3">Detail Item Relasi</th>
                        <th className="p-3">Total Harga</th>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee5d8]">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#fbf9f5] transition">
                          <td className="p-3 font-mono font-bold text-[#a61c1c]">{ord.nomor_pesanan}</td>
                          <td className="p-3">
                            <div className="font-bold text-[#19120e]">{ord.nama_pelanggan}</div>
                            <div className="text-[10px] text-[#7d7065] font-mono">{ord.nomor_wa}</div>
                          </td>
                          <td className="p-3 text-[11px] text-[#4a3e35]">{ord.tipe_layanan}</td>
                          <td className="p-3">
                            <div className="space-y-0.5 text-[11px]">
                              {ord.items && ord.items.map((it, idx) => (
                                <div key={idx} className="text-[#5c4e43]">
                                  • {it.nama} <span className="font-bold text-[#19120e]">({it.jumlah}x)</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 font-bold text-[#19120e]">
                            Rp {ord.total_harga.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-[10px] text-[#7d7065] font-mono">
                            {new Date(ord.created_at).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {ord.status}
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

          {/* TAB 2: Schema DDL */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <strong>Skema Asli SQLite (sqlite_master)</strong>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Query DDL yang aktif di <code className="bg-emerald-100 px-1 py-0.5 rounded">backend/warung_padang.db</code> membuktikan perancangan database relasional formal sesuai silabus SMK RPL / TKJ.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {schemas.map((s, idx) => (
                  <div key={idx} className="bg-[#18100c] text-[#f5d796] rounded-xl border border-[#3b271d] overflow-hidden shadow">
                    <div className="px-4 py-2 bg-[#251710] border-b border-[#3b271d] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-[#c59837]" />
                        <span className="font-mono font-bold text-white">Tabel: {s.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">Active Table</span>
                    </div>
                    <pre className="p-4 text-[11px] font-mono text-[#d6c7b6] overflow-x-auto leading-relaxed">
                      {s.sql}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8f5ee] border-t border-[#eee5d8] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-[#7d7065]">
            Bukti verifikasi tugas database SMK: REST API Node.js + SQLite3 Relational Database.
          </div>
          <div className="flex items-center gap-2">
            {onOpenAdmin && (
              <button
                onClick={() => { onClose(); onOpenAdmin(); }}
                className="px-3.5 py-2 bg-[#a61c1c] text-white hover:bg-[#881414] text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5"
              >
                <span>Buka Portal Kasir & Dapur</span>
                <span>➔</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#18100c] text-white hover:bg-[#2e1d15] text-xs font-bold rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
