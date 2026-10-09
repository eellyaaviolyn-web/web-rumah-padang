-- ==========================================================
-- SKEMA & DATA DATABASE: WARUNG PADANG BUNDO KANDUANG
-- Tugas Database SMK (Relational Database)
-- Kompatibel dengan phpMyAdmin / MySQL / MariaDB (Laragon / XAMPP)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS db_warung_padang DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_warung_padang;

-- ----------------------------------------------------------
-- 1. Tabel: menu
-- Menyimpan katalog hidangan Minangkabau beserta harga dan foto
-- ----------------------------------------------------------
DROP TABLE IF EXISTS pesanan_items;
DROP TABLE IF EXISTS pesanan;
DROP TABLE IF EXISTS outlet;
DROP TABLE IF EXISTS menu;

CREATE TABLE menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  harga INT NOT NULL,
  deskripsi TEXT,
  image_url VARCHAR(255),
  badge VARCHAR(50),
  is_spicy TINYINT(1) DEFAULT 1,
  stok_status ENUM('Tersedia', 'Habis') DEFAULT 'Tersedia',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 2. Tabel: outlet
-- Menyimpan cabang restoran resmi
-- ----------------------------------------------------------
CREATE TABLE outlet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_cabang VARCHAR(150) NOT NULL,
  tipe VARCHAR(50) DEFAULT 'Cabang Resmi',
  alamat TEXT NOT NULL,
  kota VARCHAR(100) NOT NULL,
  telepon VARCHAR(30) NOT NULL,
  jam_buka VARCHAR(100) NOT NULL,
  kapasitas VARCHAR(150),
  maps_query VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 3. Tabel: pesanan (Header Transaksi)
-- Menyimpan data pemesan, total tagihan, dan alur status
-- ----------------------------------------------------------
CREATE TABLE pesanan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_pesanan VARCHAR(30) UNIQUE NOT NULL,
  nama_pelanggan VARCHAR(150) NOT NULL,
  nomor_wa VARCHAR(30) NOT NULL,
  tipe_layanan VARCHAR(100) NOT NULL,
  catatan TEXT,
  total_harga INT NOT NULL,
  status ENUM('Menunggu Konfirmasi', 'Sedang Dimasak', 'Siap Dikirim', 'Selesai', 'Dibatalkan') DEFAULT 'Menunggu Konfirmasi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 4. Tabel: pesanan_items (Detail Transaksi / Foreign Key)
-- Relasi One-to-Many dengan tabel pesanan
-- ----------------------------------------------------------
CREATE TABLE pesanan_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pesanan_id INT NOT NULL,
  nama_item VARCHAR(150) NOT NULL,
  jumlah INT NOT NULL,
  harga_satuan INT NOT NULL,
  subtotal INT NOT NULL,
  CONSTRAINT fk_pesanan FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- SEED DATA AWAL: KATALOG MENU MINANGKABAU
-- ==========================================================
INSERT INTO menu (nama, kategori, harga, deskripsi, image_url, badge, is_spicy, stok_status) VALUES
('Rendang Daging Sapi Darek', 'Daging', 28000, 'Daging sapi pilihan direbus santan kelapa tua selama 8 jam dengan 16 rempah alami hingga karamelisasi pekat gurih.', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80', 'Best Seller', 1, 'Tersedia'),
('Ayam Pop Gurih Tradisi', 'Ayam', 24000, 'Ayam pejantan dimasak rempah air kelapa muda gurih, disajikan dengan saus lado merah segar khas Bukittinggi.', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', 'Favorit', 0, 'Tersedia'),
('Gulai Tunjang Sapi Empuk', 'Daging', 32000, 'Kikil tunjang sapi kenyal empuk berkuah gulai santan kental berbumbu kapulaga, lengkuas, dan asam kandis.', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80', 'Khas Minang', 1, 'Tersedia'),
('Dendeng Batokok Lado Mudo', 'Daging', 29000, 'Irisan daging sapi pipih empuk dipanggang gurih, disiram ulekan kasar cabai hijau segar dan minyak kelapa.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 'Pedas Mantap', 1, 'Tersedia'),
('Gulai Kepala Ikan Kakap', 'Ikan & Laut', 48000, 'Kepala kakap merah segar dengan kuah gulai rempah kuning asam pedas gurih harum daun ruku-ruku.', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 'Istimewa', 1, 'Tersedia'),
('Ayam Goreng Lengkuas Panas', 'Ayam', 23000, 'Ayam bumbu rempah kuning ditaburi rempah parutan lengkuas garing keemasan yang renyah.', 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', 'Renyah', 0, 'Tersedia'),
('Cincang Daging Sapi Pedas', 'Daging', 27000, 'Daging cincang berlemak gurih khas Padang dengan kuah kari santan merah pekat pedas mantap.', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80', 'Pedas Gurih', 1, 'Tersedia'),
('Telur Dadar Tebal Padang', 'Pelengkap', 14000, 'Telur bebek padat tebal berpori rempah wangi daun kunyit, daun bawang, dan lada murni.', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', 'Wajib Coba', 0, 'Tersedia'),
('Sambal Lado Mudo Minang', 'Pelengkap', 8000, 'Cabai hijau kriting, tomat hijau, dan bawang merah diulek kasar dengan perasan jeruk nipis dan minyak panas.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80', 'Ekstra Pedas', 1, 'Tersedia'),
('Gulai Daun Singkong & Teri', 'Sayuran', 12000, 'Pucuk daun singkong muda segar dimasak santan encer gurih dengan taburan teri nasi renyah.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', 'Segar', 0, 'Tersedia'),
('Es Tebak Tradisional', 'Minuman', 16000, 'Minuman segar es serut tape ketan hitam, tebak cendol beras, kolang-kaling manis, sirup merah, dan santan dingin.', 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80', 'Khas Padang', 0, 'Tersedia'),
('Teh Talua Kocok Padang', 'Minuman', 18000, 'Teh pekat hangat berpadu kocokan kuning telur bebek berbusa lembut, susu kental manis, dan perasan jeruk nipis.', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', 'Penambah Energi', 0, 'Tersedia');

-- ==========================================================
-- SEED DATA CABANG OUTLET
-- ==========================================================
INSERT INTO outlet (nama_cabang, tipe, alamat, kota, telepon, jam_buka, kapasitas, maps_query) VALUES
('Outlet Utama Pasar Baru', 'Pusat', 'Jl. Pintu Air Raya No. 18, Pasar Baru, Sawah Besar', 'Jakarta Pusat', '0812-9988-7761', '10.00 - 22.00 WIB', 'Dine-in 120 Orang • Parkir 25 Mobil', 'Pasar Baru Jakarta Pusat'),
('Outlet Sudirman SCBD', 'Cabang Bisnis', 'Gedung Artha Graha Ground Floor, Kawasan SCBD', 'Jakarta Selatan', '0812-9988-7762', '09.30 - 21.30 WIB', 'Area VIP Rapat • Siap Nasi Kotak Kantor', 'SCBD Sudirman Jakarta'),
('Outlet Bintaro Sektor 7', 'Cabang Keluarga', 'Ruko Kebayoran Arcade 2 Blok B No. 8, Bintaro Jaya', 'Tangerang Selatan', '0812-9988-7763', '10.00 - 22.00 WIB', 'Area Bermain Anak • Ruang AC Bebas Asap', 'Bintaro Jaya Sektor 7');

-- ==========================================================
-- SEED DATA TRANSAKSI PESANAN
-- ==========================================================
INSERT INTO pesanan (id, nomor_pesanan, nama_pelanggan, nomor_wa, tipe_layanan, catatan, total_harga, status) VALUES
(1, 'BK-911156', 'Budi Santoso', '081299887766', 'Nasi Kotak Kantor', 'Pesan hangat untuk makan siang', 56000, 'Menunggu Konfirmasi'),
(2, 'BK-249214', 'Guru Pembimbing SMK', '081234567890', 'Paket Nasi Kotak Rapat', 'Uji Coba Sistem Database Relasional SMK', 235000, 'Sedang Dimasak');

INSERT INTO pesanan_items (pesanan_id, nama_item, jumlah, harga_satuan, subtotal) VALUES
(1, 'Rendang Daging Sapi Darek', 2, 28000, 56000),
(2, 'Paket Nasi Kotak Singgalang', 5, 35000, 175000),
(2, 'Es Tebak Tradisional', 5, 12000, 60000);
