import mysql from 'mysql2';
import { fileURLToPath } from 'url';
import path from 'path';

// Import sqlite3 secara dinamis agar aman di serverless Vercel (yang tidak punya modul C++ native)
let sqlite3 = null;
try {
  const sqliteModule = await import('sqlite3');
  sqlite3 = sqliteModule.default || sqliteModule;
} catch (e) {
  // Lingkungan serverless Vercel (sqlite3 native module dilewati)
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlitePath = path.resolve(__dirname, 'warung_padang.db');

export let activeEngine = 'SQLite';
export let databaseName = 'warung_padang.db';

// Konfigurasi MySQL (Mendukung phpMyAdmin lokal & TiDB Cloud / Remote MySQL)
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_warung_padang',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')) ? { rejectUnauthorized: false } : undefined
};

let mysqlPool = null;
let sqliteDb = null;

// ================= IN-MEMORY FALLBACK (VERCEL SERVERLESS ENGINE) =================
// Menjamin serverless Vercel 100% aktif dan tidak crash jika belum terhubung ke MySQL Cloud
const memoryStore = {
  menu: [
    { id: 1, nama: 'Rendang Daging Sapi Darek', kategori: 'Daging', harga: 28000, deskripsi: 'Daging sapi pilihan direbus santan kelapa tua selama 8 jam dengan 16 rempah alami hingga karamelisasi pekat gurih.', image_url: '/images/menu/rendang.jpg', badge: 'Best Seller', is_spicy: 1, stok_status: 'Tersedia' },
    { id: 2, nama: 'Ayam Pop Gurih Tradisi', kategori: 'Ayam', harga: 24000, deskripsi: 'Ayam pejantan dimasak rempah air kelapa muda gurih, disajikan dengan saus lado merah segar khas Bukittinggi.', image_url: '/images/menu/ayam-pop.jpg', badge: 'Favorit', is_spicy: 0, stok_status: 'Tersedia' },
    { id: 3, nama: 'Gulai Tunjang Sapi Empuk', kategori: 'Daging', harga: 32000, deskripsi: 'Kikil tunjang sapi kenyal empuk berkuah gulai santan kental berbumbu kapulaga, lengkuas, dan asam kandis.', image_url: '/images/menu/gulai-tunjang.jpg', badge: 'Khas Minang', is_spicy: 1, stok_status: 'Tersedia' },
    { id: 4, nama: 'Dendeng Batokok Lado Mudo', kategori: 'Daging', harga: 29000, deskripsi: 'Irisan daging sapi pipih empuk dipanggang gurih, disiram ulekan kasar cabai hijau segar dan minyak kelapa.', image_url: '/images/menu/dendeng-batokok.jpg', badge: 'Pedas Mantap', is_spicy: 1, stok_status: 'Tersedia' },
    { id: 5, nama: 'Gulai Kepala Ikan Kakap', kategori: 'Ikan & Laut', harga: 48000, deskripsi: 'Kepala kakap merah segar dengan kuah gulai rempah kuning asam pedas gurih harum daun ruku-ruku.', image_url: '/images/menu/gulai-kepala-kakap.jpg', badge: 'Istimewa', is_spicy: 1, stok_status: 'Tersedia' },
    { id: 6, nama: 'Ayam Goreng Lengkuas Panas', kategori: 'Ayam', harga: 23000, deskripsi: 'Ayam bumbu rempah kuning ditaburi rempah parutan lengkuas garing keemasan yang renyah.', image_url: '/images/menu/ayam-goreng-lengkuas.jpg', badge: 'Renyah', is_spicy: 0, stok_status: 'Tersedia' },
    { id: 7, nama: 'Cincang Daging Sapi Pedas', kategori: 'Daging', harga: 27000, deskripsi: 'Daging cincang berlemak gurih khas Padang dengan kuah kari santan merah pekat pedas mantap.', image_url: '/images/menu/cincang-daging.jpg', badge: 'Pedas Gurih', is_spicy: 1, stok_status: 'Tersedia' },
    { id: 8, nama: 'Telur Dadar Tebal Padang', kategori: 'Pelengkap', harga: 14000, deskripsi: 'Telur bebek padat tebal berpori rempah wangi daun kunyit, daun bawang, dan lada murni.', image_url: '/images/menu/telur-dadar.jpg', badge: 'Wajib Coba', is_spicy: 0, stok_status: 'Tersedia' },
    { id: 9, nama: 'Sambal Lado Mudo Minang', kategori: 'Pelengkap', harga: 8000, deskripsi: 'Cabai hijau kriting, tomat hijau, dan bawang merah diulek kasar dengan perasan jeruk nipis dan minyak panas.', image_url: '/images/menu/sambal-lado-mudo.jpg', badge: 'Ekstra Pedas', is_spicy: 1, stok_status: 'Tersedia' },
    { id: 10, nama: 'Gulai Daun Singkong & Teri', kategori: 'Sayuran', harga: 12000, deskripsi: 'Pucuk daun singkong muda segar dimasak santan encer gurih dengan taburan teri nasi renyah.', image_url: '/images/menu/gulai-daun-singkong.jpg', badge: 'Segar', is_spicy: 0, stok_status: 'Tersedia' },
    { id: 11, nama: 'Es Tebak Tradisional', kategori: 'Minuman', harga: 16000, deskripsi: 'Minuman segar es serut tape ketan hitam, tebak cendol beras, kolang-kaling manis, sirup merah, dan santan dingin.', image_url: '/images/menu/es-tebak.jpg', badge: 'Khas Padang', is_spicy: 0, stok_status: 'Tersedia' },
    { id: 12, nama: 'Teh Talua Kocok Padang', kategori: 'Minuman', harga: 18000, deskripsi: 'Teh pekat hangat berpadu kocokan kuning telur bebek berbusa lembut, susu kental manis, dan perasan jeruk nipis.', image_url: '/images/menu/teh-talua.jpg', badge: 'Penambah Energi', is_spicy: 0, stok_status: 'Tersedia' }
  ],
  outlet: [
    { id: 1, nama_cabang: 'Outlet Utama Pasar Baru', tipe: 'Pusat', alamat: 'Jl. Pintu Air Raya No. 18, Pasar Baru, Sawah Besar', kota: 'Jakarta Pusat', telepon: '0812-9988-7761', jam_buka: '10.00 - 22.00 WIB', kapasitas: 'Dine-in 120 Orang • Parkir 25 Mobil', maps_query: 'Pasar Baru Jakarta Pusat' },
    { id: 2, nama_cabang: 'Cabang Rawamangun', tipe: 'Cabang Resmi', alamat: 'Jl. Pemuda No. 42, Rawamangun, Pulo Gadung', kota: 'Jakarta Timur', telepon: '0812-9988-7762', jam_buka: '09.00 - 22.00 WIB', kapasitas: 'Dine-in 80 Orang • Parkir 15 Mobil', maps_query: 'Rawamangun Jakarta Timur' },
    { id: 3, nama_cabang: 'Cabang Tebet Eco Express', tipe: 'Express & Dine-in', alamat: 'Jl. Tebet Barat Dalam Raya No. 15, Tebet', kota: 'Jakarta Selatan', telepon: '0812-9988-7763', jam_buka: '10.00 - 23.00 WIB', kapasitas: 'Dine-in 60 Orang • Drive Thru', maps_query: 'Tebet Jakarta Selatan' },
    { id: 4, nama_cabang: 'Cabang Dago Heritage Bandung', tipe: 'Cabang Resmi', alamat: 'Jl. Ir. H. Juanda No. 118, Dago', kota: 'Bandung', telepon: '0822-7788-9901', jam_buka: '10.00 - 22.00 WIB', kapasitas: 'Dine-in 100 Orang • Ruang VIP', maps_query: 'Dago Bandung' },
    { id: 5, nama_cabang: 'Cabang Asli Khatib Sulaiman Padang', tipe: 'Pusat Daerah Minang', alamat: 'Jl. Khatib Sulaiman No. 55, Lolong Belanti', kota: 'Kota Padang', telepon: '0751-889922', jam_buka: '08.00 - 23.00 WIB', kapasitas: 'Dine-in 200 Orang • Heritage Hall', maps_query: 'Khatib Sulaiman Padang' }
  ],
  pesanan: [],
  pesanan_items: [],
  pengeluaran: [
    { id: 1, judul: 'Belanja Daging Sapi Darek 15kg', kategori: 'Bahan Baku', jumlah: 1950000, tanggal: new Date().toISOString().split('T')[0], keterangan: 'Daging sapi segar untuk rendang harian' },
    { id: 2, judul: 'Kelapa Parut Santan Murni 40 Butir', kategori: 'Bahan Baku', jumlah: 280000, tanggal: new Date().toISOString().split('T')[0], keterangan: 'Santan kelapa tua bumbu rendang & gulai' },
    { id: 3, judul: 'Bumbu Rempah & Cabai Merah Bukittinggi', kategori: 'Bahan Baku', jumlah: 350000, tanggal: new Date().toISOString().split('T')[0], keterangan: 'Cabai merah, cabai hijau, kapulaga, serai' },
    { id: 4, judul: 'Gas LPG 12kg x 2 Tabung', kategori: 'Operasional', jumlah: 440000, tanggal: new Date().toISOString().split('T')[0], keterangan: 'Bahan bakar kuali dapur presto & kompor' },
    { id: 5, judul: 'Kotak Nasi Mika & Kertas Food-Grade', kategori: 'Kemasan', jumlah: 180000, tanggal: new Date().toISOString().split('T')[0], keterangan: 'Stok 200 pcs box nasi kotak catering' }
  ],
  staf: [
    { id: 1, nama: 'eellyaa', role: 'Kasir Utama POS', no_telp: '0851-4741-3866', status: 'Aktif', shift: 'Pagi (08.00 - 16.00)' },
    { id: 2, nama: 'Mak Etek Buyung', role: 'Kepala Koki Dapur Minang', no_telp: '0813-8877-6652', status: 'Aktif', shift: 'Pagi (08.00 - 16.00)' },
    { id: 3, nama: 'Sutan Bagindo', role: 'Juru Racik Rendang & Gulai', no_telp: '+62 851-4741-3866', status: 'Aktif', shift: 'Sore (14.00 - 22.00)' },
    { id: 4, nama: 'Zul Ilham', role: 'Kurir Pengantar Nasi Kotak', no_telp: '0819-6655-4432', status: 'Aktif', shift: 'Fleksibel Operasional' },
    { id: 5, nama: 'Uni Desi', role: 'Pramusaji & Packing Nasi Kotak', no_telp: '0812-3344-5566', status: 'Aktif', shift: 'Pagi (08.00 - 16.00)' }
  ]
};

// Inisialisasi Database Cerdas (Mendukung MySQL -> SQLite -> In-Memory)
export function initDatabase() {
  try {
    const testPool = mysql.createPool(mysqlConfig);

    testPool.getConnection((err, connection) => {
      if (!err && connection) {
        connection.release();
        mysqlPool = testPool;
        activeEngine = (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') ? 'MySQL (Cloud)' : 'MySQL (phpMyAdmin)';
        databaseName = mysqlConfig.database;
        console.log('===============================================');
        console.log(`🐬 TERHUBUNG KE MYSQL / ${activeEngine}!`);
        console.log(`🗄️ Database: ${mysqlConfig.database} (Host: ${mysqlConfig.host}:${mysqlConfig.port})`);
        console.log('===============================================');
        initAdditionalTables();
      } else {
        console.warn('⚠️ Tidak ada koneksi MySQL (' + (err ? err.message : 'Unknown') + ').');
        initSqliteFallback();
      }
    });
  } catch (e) {
    console.warn('Gagal inisialisasi MySQL, beralih ke fallback:', e.message);
    initSqliteFallback();
  }
}

function initSqliteFallback() {
  if (!sqlite3) {
    console.log('⚡ Menggunakan In-Memory Engine (Vercel Serverless Mode)');
    initMemoryFallback();
    return;
  }

  activeEngine = 'SQLite';
  databaseName = 'warung_padang.db';
  try {
    sqliteDb = new sqlite3.Database(sqlitePath, (err) => {
      if (err) {
        console.warn('⚠️ Gagal membuka file SQLite lokal:', err.message);
        initMemoryFallback();
      } else {
        console.log('Terhubung ke database SQLite:', sqlitePath);
        initAdditionalTables();
      }
    });
  } catch (e) {
    console.warn('Eksepsi SQLite:', e.message);
    initMemoryFallback();
  }
}

function initMemoryFallback() {
  activeEngine = 'Cloud Memory Engine';
  databaseName = 'warung_padang (Memory)';
  console.log('☁️ Engine Database Aktif:', activeEngine);
}

function initAdditionalTables() {
  if (activeEngine.startsWith('MySQL') && mysqlPool) {
    const createPengeluaran = `
      CREATE TABLE IF NOT EXISTS \`pengeluaran\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`judul\` VARCHAR(255) NOT NULL,
        \`kategori\` VARCHAR(100) NOT NULL,
        \`jumlah\` DECIMAL(12,2) NOT NULL,
        \`tanggal\` VARCHAR(50) NOT NULL,
        \`keterangan\` TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    const createStaf = `
      CREATE TABLE IF NOT EXISTS \`staf\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nama\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(100) NOT NULL,
        \`no_telp\` VARCHAR(50) NOT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'Aktif',
        \`shift\` VARCHAR(100) NOT NULL DEFAULT 'Pagi (08.00 - 16.00)'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    mysqlPool.query(createPengeluaran);
    mysqlPool.query(createStaf);
  } else if (sqliteDb) {
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS pengeluaran (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        judul TEXT NOT NULL,
        kategori TEXT NOT NULL,
        jumlah REAL NOT NULL,
        tanggal TEXT NOT NULL,
        keterangan TEXT
      )
    `);
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS staf (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        role TEXT NOT NULL,
        no_telp TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Aktif',
        shift TEXT NOT NULL DEFAULT 'Pagi (08.00 - 16.00)'
      )
    `);
  }
}

// Unified Database Interface (MySQL / SQLite / In-Memory Vercel)
export const db = {
  all(sql, params = [], callback) {
    if (activeEngine.startsWith('MySQL') && mysqlPool) {
      const mySql = sql.replace(/json_group_array/gi, 'JSON_ARRAYAGG').replace(/json_object/gi, 'JSON_OBJECT');
      mysqlPool.query(mySql, params, (err, rows) => {
        if (err) return callback(err);
        callback(null, rows || []);
      });
    } else if (sqliteDb) {
      sqliteDb.all(sql, params, callback);
    } else {
      // Memory Store Handlers
      const lower = sql.toLowerCase();
      if (lower.includes('from menu')) {
        let items = [...memoryStore.menu];
        if (lower.includes('where kategori =') && params[0]) {
          items = items.filter(m => m.kategori.toLowerCase() === params[0].toLowerCase());
        }
        return callback(null, items);
      }
      if (lower.includes('from outlet')) {
        return callback(null, [...memoryStore.outlet]);
      }
      if (lower.includes('from staf')) {
        return callback(null, [...memoryStore.staf]);
      }
      if (lower.includes('from pengeluaran')) {
        return callback(null, [...memoryStore.pengeluaran]);
      }
      if (lower.includes('from pesanan')) {
        const enriched = memoryStore.pesanan.map(p => {
          const items = memoryStore.pesanan_items.filter(it => it.pesanan_id === p.id);
          return { ...p, items: JSON.stringify(items) };
        });
        return callback(null, enriched);
      }
      callback(null, []);
    }
  },

  get(sql, params = [], callback) {
    if (activeEngine.startsWith('MySQL') && mysqlPool) {
      const mySql = sql.replace(/json_group_array/gi, 'JSON_ARRAYAGG').replace(/json_object/gi, 'JSON_OBJECT');
      mysqlPool.query(mySql, params, (err, rows) => {
        if (err) return callback(err);
        callback(null, rows && rows.length > 0 ? rows[0] : null);
      });
    } else if (sqliteDb) {
      sqliteDb.get(sql, params, callback);
    } else {
      const lower = sql.toLowerCase();
      if (lower.includes('from pesanan') && lower.includes('nomor_pesanan')) {
        const cleanNo = (params[0] || '').toString().toLowerCase();
        const p = memoryStore.pesanan.find(o => o.nomor_pesanan.toLowerCase() === cleanNo);
        if (!p) return callback(null, null);
        const items = memoryStore.pesanan_items.filter(it => it.pesanan_id === p.id);
        return callback(null, { ...p, items: JSON.stringify(items) });
      }
      if (lower.includes('from staf')) {
        return callback(null, memoryStore.staf[0] || null);
      }
      if (lower.includes('count(*) as total_pesanan')) {
        const total_pesanan = memoryStore.pesanan.length;
        const total_omzet = memoryStore.pesanan.reduce((sum, o) => sum + (o.total_harga || 0), 0);
        return callback(null, { total_pesanan, total_omzet });
      }
      if (lower.includes('count(*) as total_menu')) {
        return callback(null, { total_menu: memoryStore.menu.length });
      }
      if (lower.includes('count(*) as total_outlet')) {
        return callback(null, { total_outlet: memoryStore.outlet.length });
      }
      if (lower.includes('count(*) as pending_pesanan')) {
        const pending = memoryStore.pesanan.filter(p => p.status === 'Menunggu Konfirmasi').length;
        return callback(null, { pending_pesanan: pending });
      }
      if (lower.includes('sum(jumlah) as total_pengeluaran')) {
        const total = memoryStore.pengeluaran.reduce((sum, x) => sum + (x.jumlah || 0), 0);
        return callback(null, { total_pengeluaran: total });
      }
      if (lower.includes('count(*) as total_staf')) {
        return callback(null, { total_staf: memoryStore.staf.length });
      }
      callback(null, null);
    }
  },

  run(sql, params = [], callback) {
    if (activeEngine.startsWith('MySQL') && mysqlPool) {
      mysqlPool.query(sql, params, function (err, result) {
        if (err) return callback ? callback(err) : null;
        const context = {
          lastID: result ? result.insertId : null,
          changes: result ? result.affectedRows : 0
        };
        if (callback) callback.call(context, null);
      });
    } else if (sqliteDb) {
      sqliteDb.run(sql, params, callback);
    } else {
      const lower = sql.toLowerCase();
      const context = { lastID: Date.now(), changes: 1 };

      if (lower.includes('insert into pesanan ')) {
        const [nomor, nama, wa, tipe, catatan, total] = params;
        const newId = memoryStore.pesanan.length + 1;
        memoryStore.pesanan.unshift({
          id: newId,
          nomor_pesanan: nomor,
          nama_pelanggan: nama,
          nomor_wa: wa,
          tipe_layanan: tipe,
          catatan: catatan || '',
          total_harga: total,
          status: 'Menunggu Konfirmasi',
          created_at: new Date().toISOString()
        });
        context.lastID = newId;
      } else if (lower.includes('insert into pesanan_items')) {
        const [pesanan_id, nama_item, jumlah, harga_satuan, subtotal] = params;
        memoryStore.pesanan_items.push({
          id: memoryStore.pesanan_items.length + 1,
          pesanan_id,
          nama_item,
          jumlah,
          harga_satuan,
          subtotal
        });
      } else if (lower.includes('update pesanan set status =')) {
        const status = params[0];
        const nomor = (params[1] || '').toString().toLowerCase();
        const p = memoryStore.pesanan.find(o => o.nomor_pesanan.toLowerCase() === nomor || o.id == nomor);
        if (p) p.status = status;
      } else if (lower.includes('insert into pengeluaran')) {
        const [judul, kategori, jumlah, tgl, ket] = params;
        const newId = memoryStore.pengeluaran.length + 1;
        memoryStore.pengeluaran.unshift({ id: newId, judul, kategori, jumlah, tanggal: tgl, keterangan: ket });
        context.lastID = newId;
      } else if (lower.includes('insert into staf')) {
        const [nama, role, telp, status, shift] = params;
        const newId = memoryStore.staf.length + 1;
        memoryStore.staf.push({ id: newId, nama, role, no_telp: telp, status, shift });
        context.lastID = newId;
      }

      if (callback) callback.call(context, null);
    }
  },

  getEngine() {
    return activeEngine;
  },
  getDatabaseName() {
    return databaseName;
  }
};
