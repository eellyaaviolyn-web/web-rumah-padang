import mysql from 'mysql2';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlitePath = path.resolve(__dirname, 'warung_padang.db');

export let activeEngine = 'SQLite';
export let databaseName = 'warung_padang.db';

// Konfigurasi MySQL / phpMyAdmin (Laragon / XAMPP)
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_warung_padang',
  waitForConnections: true,
  connectionLimit: 10
};

let mysqlPool = null;
let sqliteDb = null;

// Inisialisasi Adapter Database Cerdas (Mendukung MySQL & Fallback SQLite)
export function initDatabase() {
  try {
    // 1. Coba koneksi ke MySQL (phpMyAdmin)
    const testPool = mysql.createPool(mysqlConfig);

    testPool.getConnection((err, connection) => {
      if (!err && connection) {
        connection.release();
        mysqlPool = testPool;
        activeEngine = 'MySQL (phpMyAdmin)';
        databaseName = 'db_warung_padang';
        console.log('===============================================');
        console.log('🐬 TERHUBUNG KE MYSQL / PHPMYADMIN!');
        console.log(`🗄️ Database: ${mysqlConfig.database} (Port: ${mysqlConfig.port})`);
        console.log('🌐 Siap diakses di http://localhost/phpmyadmin');
        console.log('===============================================');
        initAdditionalTables();
      } else {
        console.warn('⚠️ Gagal terhubung ke MySQL (' + (err ? err.message : 'Unknown') + ').');
        console.log('🔄 Beralih otomatis ke fallback database SQLite: warung_padang.db');
        initSqliteFallback();
      }
    });
  } catch (e) {
    console.warn('Gagal inisialisasi MySQL, menggunakan SQLite:', e.message);
    initSqliteFallback();
  }
}

function initSqliteFallback() {
  activeEngine = 'SQLite';
  databaseName = 'warung_padang.db';
  sqliteDb = new sqlite3.Database(sqlitePath, (err) => {
    if (err) console.error('Gagal membuka SQLite:', err.message);
    else {
      console.log('Terhubung ke database SQLite:', sqlitePath);
      initAdditionalTables();
    }
  });
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

    mysqlPool.query(createPengeluaran, (err) => {
      if (!err) {
        mysqlPool.query('SELECT COUNT(*) as cnt FROM \`pengeluaran\`', (e, r) => {
          if (!e && r && r[0] && r[0].cnt === 0) {
            const today = new Date().toISOString().split('T')[0];
            const seed = `
              INSERT INTO \`pengeluaran\` (\`judul\`, \`kategori\`, \`jumlah\`, \`tanggal\`, \`keterangan\`) VALUES
              ('Belanja Daging Sapi Darek 15kg', 'Bahan Baku', 1950000, '${today}', 'Daging sapi segar untuk rendang harian'),
              ('Kelapa Parut Santan Murni 40 Butir', 'Bahan Baku', 280000, '${today}', 'Santan kelapa tua bumbu rendang & gulai'),
              ('Bumbu Rempah & Cabai Merah Bukittinggi', 'Bahan Baku', 350000, '${today}', 'Cabai merah, cabai hijau, kapulaga, serai'),
              ('Gas LPG 12kg x 2 Tabung', 'Operasional', 440000, '${today}', 'Bahan bakar kuali dapur presto & kompor'),
              ('Kotak Nasi Mika & Kertas Food-Grade', 'Kemasan', 180000, '${today}', 'Stok 200 pcs box nasi kotak catering');
            `;
            mysqlPool.query(seed);
          }
        });
      }
    });

    mysqlPool.query(createStaf, (err) => {
      if (!err) {
        mysqlPool.query('SELECT COUNT(*) as cnt FROM \`staf\`', (e, r) => {
          if (!e && r && r[0] && r[0].cnt === 0) {
            const seed = `
              INSERT INTO \`staf\` (\`nama\`, \`role\`, \`no_telp\`, \`status\`, \`shift\`) VALUES
              ('Rian Hendra', 'Kasir Utama & Admin POS', '0812-9988-7761', 'Aktif', 'Pagi (08.00 - 16.00)'),
              ('Mak Etek Buyung', 'Kepala Koki Dapur Minang', '0813-8877-6652', 'Aktif', 'Pagi (08.00 - 16.00)'),
              ('Sutan Bagindo', 'Juru Racik Rendang & Gulai', '0815-7766-5543', 'Aktif', 'Sore (14.00 - 22.00)'),
              ('Zul Ilham', 'Kurir Pengantar Nasi Kotak', '0819-6655-4432', 'Aktif', 'Fleksibel Operasional'),
              ('Uni Desi', 'Pramusaji & Packing Nasi Kotak', '0812-3344-5566', 'Aktif', 'Pagi (08.00 - 16.00)');
            `;
            mysqlPool.query(seed);
          }
        });
      }
    });
  } else if (sqliteDb) {
    const today = new Date().toISOString().split('T')[0];
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS pengeluaran (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        judul TEXT NOT NULL,
        kategori TEXT NOT NULL,
        jumlah REAL NOT NULL,
        tanggal TEXT NOT NULL,
        keterangan TEXT
      )
    `, () => {
      sqliteDb.get('SELECT COUNT(*) as cnt FROM pengeluaran', [], (err, row) => {
        if (!err && row && row.cnt === 0) {
          sqliteDb.run(`
            INSERT INTO pengeluaran (judul, kategori, jumlah, tanggal, keterangan) VALUES
            ('Belanja Daging Sapi Darek 15kg', 'Bahan Baku', 1950000, '${today}', 'Daging sapi segar untuk rendang harian'),
            ('Kelapa Parut Santan Murni 40 Butir', 'Bahan Baku', 280000, '${today}', 'Santan kelapa tua bumbu rendang & gulai'),
            ('Bumbu Rempah & Cabai Merah Bukittinggi', 'Bahan Baku', 350000, '${today}', 'Cabai merah, cabai hijau, kapulaga, serai'),
            ('Gas LPG 12kg x 2 Tabung', 'Operasional', 440000, '${today}', 'Bahan bakar kuali dapur presto & kompor'),
            ('Kotak Nasi Mika & Kertas Food-Grade', 'Kemasan', 180000, '${today}', 'Stok 200 pcs box nasi kotak catering')
          `);
        }
      });
    });

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS staf (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        role TEXT NOT NULL,
        no_telp TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Aktif',
        shift TEXT NOT NULL DEFAULT 'Pagi (08.00 - 16.00)'
      )
    `, () => {
      sqliteDb.get('SELECT COUNT(*) as cnt FROM staf', [], (err, row) => {
        if (!err && row && row.cnt === 0) {
          sqliteDb.run(`
            INSERT INTO staf (nama, role, no_telp, status, shift) VALUES
            ('Vinzkie', 'Kasir Utama & Supervisor POS', '0851-4741-3866', 'Aktif', 'Pagi (08.00 - 16.00)'),
            ('Mak Etek Buyung', 'Kepala Koki Dapur Minang', '0813-8877-6652', 'Aktif', 'Pagi (08.00 - 16.00)'),
            ('Sutan Bagindo', 'Juru Racik Rendang & Gulai', '+62 851-4741-3866', 'Aktif', 'Sore (14.00 - 22.00)'),
            ('Zul Ilham', 'Kurir Pengantar Nasi Kotak', '0819-6655-4432', 'Aktif', 'Fleksibel Operasional'),
            ('Uni Desi', 'Pramusaji & Packing Nasi Kotak', '0812-3344-5566', 'Aktif', 'Pagi (08.00 - 16.00)')
          `);
        }
      });
    });
  }
}

// Unified Database Interface
export const db = {
  // Query banyak baris (SELECT * FROM ...)
  all(sql, params = [], callback) {
    if (activeEngine.startsWith('MySQL') && mysqlPool) {
      // Sesuaikan query JSON untuk MySQL vs SQLite jika ada
      const mySql = sql.replace(/json_group_array/gi, 'JSON_ARRAYAGG')
                       .replace(/json_object/gi, 'JSON_OBJECT');

      mysqlPool.query(mySql, params, (err, rows) => {
        if (err) return callback(err);
        callback(null, rows || []);
      });
    } else if (sqliteDb) {
      sqliteDb.all(sql, params, callback);
    } else {
      callback(new Error('Tidak ada koneksi database aktif'));
    }
  },

  // Query satu baris (SELECT COUNT(*) ...)
  get(sql, params = [], callback) {
    if (activeEngine.startsWith('MySQL') && mysqlPool) {
      const mySql = sql.replace(/json_group_array/gi, 'JSON_ARRAYAGG')
                       .replace(/json_object/gi, 'JSON_OBJECT');

      mysqlPool.query(mySql, params, (err, rows) => {
        if (err) return callback(err);
        callback(null, rows && rows.length > 0 ? rows[0] : null);
      });
    } else if (sqliteDb) {
      sqliteDb.get(sql, params, callback);
    } else {
      callback(new Error('Tidak ada koneksi database aktif'));
    }
  },

  // Eksekusi INSERT, UPDATE, DELETE
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
    } else if (callback) {
      callback(new Error('Tidak ada koneksi database aktif'));
    }
  },

  // Helper info
  getEngine() {
    return activeEngine;
  },
  getDatabaseName() {
    return databaseName;
  }
};
