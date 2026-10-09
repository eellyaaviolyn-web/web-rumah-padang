# 🍛 Masakan Padang ID — Fullstack React, Node.js & MySQL

Aplikasi Website E-Commerce Kuliner & Portal Manajemen Operasional Kasir (POS) **Masakan Padang ID** (Didirikan Sejak 2004).  
Dibangun dengan standar produksi industri modern: **React 19, Tailwind CSS, GSAP Animations, Node.js Express, dan Relational Database MySQL (phpMyAdmin)** dengan proteksi keamanan berlapis (*HMAC SHA-256 Authentication, Anti-Brute Force, Rate Limiting & Input Sanitization*).

---

## 🌟 Fitur Utama

### 🛒 Website Pelanggan & Pemesanan Publik
1. **Desain Editorial & Appetite Appeal**: Palet warna Minang otentik (Crimson Red, Gilded Gold, Linen Cream) dengan tipografi premium.
2. **Katalog Menu Interaktif**: Filter kategori dinamis (Daging, Ayam, Ikan, Sayuran, Minuman) dan pencarian instan.
3. **Nampan / Keranjang Belanja Modern**: Drawer keranjang belanja dengan kontrol kuantitas porsi real-time.
4. **Checkout Multi-Metode Pembayaran**: Mendukung QRIS Dinamis (otomatis verifikasi status), Transfer Bank (BCA & Mandiri), dan Tunai / COD.
5. **Paket Nasi Kotak & Katering Kantor**: Pemesanan bento box instansi, rapat BUMN, dan hajatan.
6. **Pelacakan Pesanan Real-Time**: Lacak status tahapan penyiapan hidangan (Menunggu Konfirmasi ➔ Dibayar ➔ Sedang Dimasak ➔ Siap Dikirim ➔ Selesai).
7. **100% Responsif di Smartphone (HP)**: Target sentuh ergonomis 44px, drawer mobile navigation, dan layout adaptif.

### 🛡️ Portal Kasir, Dapur & Manajemen Admin (`/admin`)
1. **Dashboard Eksekutif**: Metrik omzet, total pesanan, laba bersih, pengeluaran harian, dan grafik leaderboard menu terlaris.
2. **Antrean Pesanan & Kasir POS**: Filter status pesanan, pencatatan otomatis, dan cetak struk nota belanja thermal.
3. **Katalog Menu & Manajemen Stok**: Tambah menu baru, perbarui harga cepat, dan ubah status ketersediaan stok (*Tersedia / Habis*).
4. **Arus Kas & Buku Pengeluaran**: Pencatatan beban belanja bahan baku harian dan laporan laba-rugi otomatis.
5. **Manajemen Akun Staf & Kru**: Pengelolaan data kru kasir, juru masak, dan kurir dengan jadwal shift.
6. **Ekspor Laporan**: Unduh pembukuan dalam format Excel / CSV dan cetak lembar rekapitulasi penjualan resmi.
7. **Pusat Skema Basis Data**: Pratinjau DDL tabel MySQL langsung dari antarmuka.

---

## 🔒 Standar Keamanan Tinggi (Full-Stack Hardening)

- **HMAC SHA-256 Cryptographic Tokens**: Autentikasi pengelola menggunakan tanda tangan digital dengan kedaluwarsa otomatis.
- **Proteksi Anti-Brute Force**: Penguncian otomatis IP (*lockout*) selama 15 menit jika terdeteksi 5 kegagalan login berturut-turut.
- **Global Rate Limiting & DDoS Defense**: Membatasi laju permintaan maksimum 200 req/menit per IP.
- **HTTP Security Headers**: Dilengkapi `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, dan menyembunyikan identitas `X-Powered-By`.
- **Anti-Tampering DevTools Protection**: Validasi sesi wajib server (`GET /api/admin/verify`), auto-eviction pada token ilegal, dan tidak menyimpan data kredensial polos di browser *Local Storage*.
- **Parameterized Queries & XSS Sanitization**: Seluruh query basis data menggunakan prepared statements (`?`) untuk menangkal SQL Injection.

---

## 🗄️ Struktur Basis Data Relasional MySQL (6 Tabel)

Database: `db_warung_padang`
1. `menu`: Katalog masakan, kategori, harga porsi, deskripsi, level pedas, dan status stok.
2. `outlet`: Jaringan cabang resto resmi, alamat fisik, jam operasional, dan kapasitas parkir.
3. `pesanan`: Header transaksi pelanggan, nomor pesanan unik, WhatsApp, tipe layanan, total harga, dan status.
4. `pesanan_items`: Rincian item menu pada setiap pesanan (Relasi One-to-Many).
5. `pengeluaran`: Arus kas keluar belanja bahan dapur dan beban operasional resto.
6. `staf`: Akun kru pengelola, kasir utama, koki dapur, kurir, dan jadwal shift kerja.

*File dump SQL tersedia di root proyek: `warung_padang.sql` (dapat langsung diimpor ke phpMyAdmin).*

---

## 🚀 Panduan Menjalankan Proyek

### Prasyarat
- **Node.js** (v18 atau lebih baru)
- **MySQL / phpMyAdmin** (Laragon atau XAMPP aktif di port 3306)

### Instalasi & Menjalankan Aplikasi
1. Buka terminal di folder proyek:
   ```bash
   npm run dev
   ```
2. Aplikasi akan aktif secara simultan:
   - **Frontend (React Vite)**: `http://localhost:5173`
   - **Backend API (Node Express)**: `http://localhost:5000`
   - **Portal Admin & Kasir**: `http://localhost:5173/admin`
   - **Database phpMyAdmin**: `http://localhost/phpmyadmin` (Database: `db_warung_padang`)

---

## 📡 Dokumentasi Endpoint REST API

| Method | Endpoint | Otorisasi | Keterangan |
|---|---|---|---|
| `GET` | `/api/health` | Publik | Status server & engine database |
| `GET` | `/api/menu` | Publik | Katalog menu masakan harian |
| `GET` | `/api/outlet` | Publik | Daftar cabang outlet resto |
| `POST` | `/api/pesanan` | Publik | Simpan transaksi pesanan baru |
| `GET` | `/api/pesanan/track/:nomor` | Publik | Lacak status pesanan pembeli |
| `POST` | `/api/admin/login` | Publik | Login pengelola & dapatkan token HMAC |
| `GET` | `/api/admin/verify` | **Admin Only** | Verifikasi tanda tangan kriptografis token |
| `GET` | `/api/pesanan` | **Admin Only** | Rekap seluruh pesanan & nomor WA pelanggan |
| `POST` | `/api/menu` | **Admin Only** | Tambah hidangan menu baru |
| `PUT` | `/api/menu/:id` | **Admin Only** | Perbarui data menu masakan |
| `PATCH` | `/api/menu/:id/stok` | **Admin Only** | Ubah cepat ketersediaan stok |
| `DELETE` | `/api/menu/:id` | **Admin Only** | Hapus menu dari database |
| `GET` | `/api/stats` | **Admin Only** | Statistik omzet, laba bersih, & keuangan |
| `GET` | `/api/pengeluaran` | **Admin Only** | Catatan arus kas pengeluaran resto |
| `POST` | `/api/pengeluaran` | **Admin Only** | Catat pengeluaran baru |
| `GET` | `/api/staf` | **Admin Only** | Data akun staf, kasir, & koki |
| `GET` | `/api/schema` | **Admin Only** | DDL skema arsitektur database |

---

*Hak Cipta © 2026 Masakan Padang ID. Seluruh Hak Cipta Dilindungi.*
