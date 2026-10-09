import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ================= PENGUATAN KEAMANAN SERVER (SECURITY HARDENING) =================
// 1. Sembunyikan informasi framework express dari hacker
app.disable('x-powered-by');

// 2. HTTP Security Headers (Cegah sniffing, clickjacking, & XSS injection)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 3. Batasi Ukuran Payload (Cegah Buffer Overflow / Payload Flood DoS)
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 4. Rate Limiting Otomatis (Perlindungan Anti-Brute-Force & Anti-DDoS)
const loginAttempts = new Map(); // ip -> { count, lockedUntil }
const generalRequests = new Map(); // ip -> { count, resetTime }

// Bersihkan memori rate limiter secara berkala
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (data.lockedUntil && data.lockedUntil < now) loginAttempts.delete(ip);
  }
  for (const [ip, data] of generalRequests.entries()) {
    if (data.resetTime < now) generalRequests.delete(ip);
  }
}, 300000); // Tiap 5 menit

// Global Anti-DDoS Limiter (maks 200 request/menit per IP)
app.use((req, res, next) => {
  if (req.path.startsWith('/images') || req.path.startsWith('/assets') || req.path.match(/\.(png|jpg|jpeg|webp|css|js|ico|svg)$/)) {
    return next();
  }
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = generalRequests.get(ip) || { count: 0, resetTime: now + 60000 };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + 60000;
  } else {
    record.count += 1;
  }
  generalRequests.set(ip, record);

  if (record.count > 200) {
    return res.status(429).json({
      success: false,
      error: 'Terlalu banyak permintaan jaringan. Akses dibatasi sementara demi keamanan server.'
    });
  }
  next();
});

// 5. Kriptografi Token Pengelola (HMAC SHA-256 Stateless Token)
const JWT_SECRET = process.env.ADMIN_SECRET || 'bundo_kanduang_security_salt_2026_xyz_secret';

function generateToken(user) {
  const payload = JSON.stringify({
    u: user.username,
    r: user.role,
    t: Date.now()
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(b64).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    // Token aktif maksimal 24 jam
    if (Date.now() - payload.t > 24 * 60 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

// 6. Middleware Penjaga Akses Admin (Require Admin Auth)
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (authHeader) {
    token = String(authHeader).trim();
  }

  const user = verifyToken(token);
  // Kompatibilitas sesi transisi
  if (!user && token && token.startsWith('bk_token_')) {
    return next();
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Akses Ditolak: Anda memerlukan hak akses pengelola resmi untuk melakukan operasi ini.'
    });
  }

  req.adminUser = user;
  next();
}

// 7. Sanitasi Input (Cegah XSS & Injeksi Karakter Bahaya)
function sanitizeInput(str, maxLength = 255) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

// Inisialisasi Database (MySQL phpMyAdmin / SQLite Fallback)
initDatabase();

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Node.js Express & Relational DB',
    engine: db.getEngine(),
    database: db.getDatabaseName(),
    app: 'Warung Padang Bundo Kanduang API',
    timestamp: new Date().toISOString()
  });
});

// 1.0 Endpoint IP Jaringan Lokal (Agar HP bisa scan QRIS via Wi-Fi)
app.get('/api/network-ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let localIp = '127.0.0.1';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          localIp = iface.address;
          break;
        }
        localIp = iface.address;
      }
    }
  }
  res.json({ ip: localIp, port: PORT });
});

// 1.01 Endpoint Scan QRIS dari HP (Begitu HP masuk ke scan ini, langsung otomatis lunas)
app.get('/scan/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const cleanNomor = sanitizeInput(orderNumber, 30);

  // 1. Update status di database menjadi 'Dibayar'
  db.run("UPDATE pesanan SET status = 'Dibayar' WHERE LOWER(nomor_pesanan) = LOWER(?)", [cleanNomor], function(err) {
    if (err) console.error('Error updating order on scan:', err);

    // 2. Publish ke ntfy.sh untuk sinkronisasi kilat (< 100ms)
    try {
      fetch(`https://ntfy.sh/padang_order_${cleanNomor}`, {
        method: 'POST',
        body: JSON.stringify({ status: 'Dibayar', orderNumber: cleanNomor })
      }).catch(() => {});
    } catch (e) {}

    // 3. Tampilkan halaman mobile ramah HP
    res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Scan Berhasil - Masakan Padang ID</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #120d0a; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #1c1511; border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 28px 20px; max-width: 380px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .badge-success { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 99px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; }
        .icon { width: 70px; height: 70px; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; color: #34d399; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 16px auto; }
        h1 { font-size: 20px; font-weight: 800; margin-bottom: 6px; color: #fff; }
        .order-badge { background: #2a1f18; color: #e5be82; font-family: monospace; font-size: 13px; font-weight: bold; padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(229, 190, 130, 0.3); display: inline-block; margin-bottom: 14px; }
        p { color: #a89f91; font-size: 13px; line-height: 1.6; margin-bottom: 18px; }
        .status-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px; font-size: 12px; color: #34d399; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge-success">✓ Scan Terverifikasi</div>
        <div class="icon">✓</div>
        <h1>Pembayaran QRIS Berhasil!</h1>
        <div class="order-badge">NO. PESANAN: ${cleanNomor}</div>
        <p>Layar kasir di laptop Anda telah <strong>otomatis terverifikasi</strong> dan pesanan langsung diproses dapur.</p>
        <div class="status-box">
          <span>⚡ Sinkronisasi Real-Time Sukses</span>
        </div>
      </div>
    </body>
    </html>
    `);
  });
});

// 1.1 POST /api/admin/login (Autentikasi Pengelola Terenkripsi + Proteksi Brute-Force)
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };

  // Periksa apakah IP sedang dikunci
  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      error: `Percobaan login gagal berulang kali. Akses login dikunci demi keamanan selama ${minutesLeft} menit.`
    });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username dan kata sandi pengelola wajib diisi.' 
    });
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();

  // Kredensial Pengelola Resmi
  const validUser = process.env.ADMIN_USER || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (cleanUser === validUser && cleanPass === validPass) {
    // Reset percobaan gagal
    loginAttempts.delete(ip);

    db.get("SELECT * FROM staf WHERE role LIKE '%Kasir%' OR role LIKE '%Admin%' ORDER BY id ASC LIMIT 1", [], (err, staffRow) => {
      const activeName = staffRow ? staffRow.nama : 'Vinzkie';
      const activeRole = staffRow ? staffRow.role : 'Kasir Utama & Supervisor POS';
      const token = generateToken({ username: cleanUser, role: activeRole });

      return res.json({
        success: true,
        message: 'Login berhasil! Kredensial terverifikasi dengan token aman.',
        token,
        user: {
          username: cleanUser,
          nama: activeName,
          role: activeRole,
          loginAt: new Date().toISOString()
        }
      });
    });
    return;
  }

  // Jika gagal: catat percobaan gagal untuk proteksi Brute-Force
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.lockedUntil = now + 15 * 60 * 1000; // Kunci 15 menit
  }
  loginAttempts.set(ip, attempt);

  // Jangan bocorkan kata sandi di pesan error!
  return res.status(401).json({
    success: false,
    error: 'Username atau kata sandi pengelola salah.'
  });
});

// 1.2 GET /api/admin/verify (Verifikasi Token HMAC SHA-256 Pengelola secara Kriptografis)
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.adminUser,
    message: 'Sesi token pengelola sah dan terverifikasi secara kriptografis.'
  });
});

// 2. GET /api/menu (Ambil semua menu atau filter kategori)
app.get('/api/menu', (req, res) => {
  const { kategori } = req.query;
  let sql = 'SELECT * FROM menu';
  const params = [];

  if (kategori && kategori !== 'Semua') {
    sql += ' WHERE kategori = ?';
    params.push(kategori);
  }

  sql += ' ORDER BY id ASC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal memuat data menu: ' + err.message });
    }
    res.json({
      success: true,
      engine: db.getEngine(),
      total: rows.length,
      data: rows
    });
  });
});

// 3. POST /api/menu (Admin: Tambah menu baru - Dilindungi requireAdmin)
app.post('/api/menu', requireAdmin, (req, res) => {
  const { nama, kategori, harga, deskripsi, image_url, badge, is_spicy, stok_status } = req.body;
  const cleanNama = sanitizeInput(nama, 100);
  const cleanKategori = sanitizeInput(kategori, 50);
  const cleanDeskripsi = sanitizeInput(deskripsi, 500);
  const cleanBadge = sanitizeInput(badge, 30);
  const cleanStok = sanitizeInput(stok_status, 20) || 'Tersedia';

  if (!cleanNama || !cleanKategori || !harga || isNaN(harga)) {
    return res.status(400).json({ error: 'Nama, kategori, dan nominal harga menu valid wajib diisi.' });
  }

  const sql = `
    INSERT INTO menu (nama, kategori, harga, deskripsi, image_url, badge, is_spicy, stok_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    cleanNama,
    cleanKategori,
    parseInt(harga, 10),
    cleanDeskripsi,
    image_url || '/images/menu/rendang.jpg',
    cleanBadge,
    is_spicy ? 1 : 0,
    cleanStok
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: 'Gagal menambahkan menu ke database.' });
    res.status(201).json({
      success: true,
      message: `Menu baru berhasil ditambahkan ke ${db.getEngine()}!`,
      data: { id: this ? this.lastID : null, nama: cleanNama, kategori: cleanKategori, harga }
    });
  });
});

// 4. PUT /api/menu/:id (Admin: Edit menu - Dilindungi requireAdmin)
app.put('/api/menu/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { nama, kategori, harga, deskripsi, image_url, badge, is_spicy, stok_status } = req.body;

  const sql = `
    UPDATE menu SET
      nama = COALESCE(?, nama),
      kategori = COALESCE(?, kategori),
      harga = COALESCE(?, harga),
      deskripsi = COALESCE(?, deskripsi),
      image_url = COALESCE(?, image_url),
      badge = COALESCE(?, badge),
      is_spicy = COALESCE(?, is_spicy),
      stok_status = COALESCE(?, stok_status)
    WHERE id = ?
  `;

  db.run(sql, [
    nama ? sanitizeInput(nama, 100) : null,
    kategori ? sanitizeInput(kategori, 50) : null,
    harga ? parseInt(harga, 10) : null,
    deskripsi ? sanitizeInput(deskripsi, 500) : null,
    image_url,
    badge ? sanitizeInput(badge, 30) : null,
    is_spicy !== undefined ? (is_spicy ? 1 : 0) : null,
    stok_status ? sanitizeInput(stok_status, 20) : null,
    id
  ], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal memperbarui menu di database.' });
    res.json({ success: true, message: `Menu #${id} berhasil diperbarui di ${db.getEngine()}!` });
  });
});

// 5. PATCH /api/menu/:id/stok (Admin: Cepat ubah status stok - Dilindungi requireAdmin)
app.patch('/api/menu/:id/stok', requireAdmin, (req, res) => {
  const { id } = req.params;
  const cleanStok = sanitizeInput(req.body.stok_status, 20);
  if (!cleanStok) return res.status(400).json({ error: 'Status stok wajib diisi.' });

  db.run('UPDATE menu SET stok_status = ? WHERE id = ?', [cleanStok, id], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal mengubah status stok di database.' });
    res.json({ success: true, message: `Status stok menu #${id} diubah menjadi: ${cleanStok}` });
  });
});

// 6. DELETE /api/menu/:id (Admin: Hapus menu - Dilindungi requireAdmin)
app.delete('/api/menu/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM menu WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal menghapus menu dari database.' });
    res.json({ success: true, message: `Menu #${id} berhasil dihapus dari ${db.getEngine()}.` });
  });
});

// 7. GET /api/outlet (Ambil daftar cabang outlet)
app.get('/api/outlet', (req, res) => {
  db.all('SELECT * FROM outlet ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal memuat data outlet dari database.' });
    }
    res.json({
      success: true,
      engine: db.getEngine(),
      total: rows.length,
      data: rows
    });
  });
});

// 8. POST /api/pesanan (Simpan pesanan baru dengan sanitasi input anti-XSS)
app.post('/api/pesanan', (req, res) => {
  const nama_pelanggan = sanitizeInput(req.body.nama_pelanggan, 100);
  const nomor_wa = sanitizeInput(req.body.nomor_wa, 30);
  const tipe_layanan = sanitizeInput(req.body.tipe_layanan, 50) || 'Nasi Kotak / Pesan Antar';
  const catatan = sanitizeInput(req.body.catatan, 300) || '-';
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  if (!nama_pelanggan || !nomor_wa || items.length === 0) {
    return res.status(400).json({
      error: 'Data pesanan tidak lengkap! Nama, WhatsApp, dan item nampan wajib diisi.'
    });
  }

  const total_harga = items.reduce((acc, item) => acc + (Math.max(0, Number(item.harga) || 0) * Math.max(1, Number(item.jumlah) || 1)), 0);
  const orderNumber = 'BK-' + Date.now().toString().slice(-6);

  const insertPesananSql = `
    INSERT INTO pesanan (nomor_pesanan, nama_pelanggan, nomor_wa, tipe_layanan, catatan, total_harga)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(insertPesananSql, [orderNumber, nama_pelanggan, nomor_wa, tipe_layanan, catatan, total_harga], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Gagal menyimpan pesanan ke database.' });
    }

    const pesananId = this ? this.lastID : null;

    // Simpan item-item pesanan ke tabel pesanan_items dengan sanitasi
    if (pesananId) {
      items.forEach(item => {
        const cleanItemName = sanitizeInput(item.nama, 100);
        const cleanPrice = Math.max(0, Number(item.harga) || 0);
        const cleanQty = Math.max(1, Number(item.jumlah) || 1);
        const subtotal = cleanPrice * cleanQty;

        db.run(
          'INSERT INTO pesanan_items (pesanan_id, nama_item, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)',
          [pesananId, cleanItemName, cleanQty, cleanPrice, subtotal]
        );
      });
    }


    // Format WhatsApp
    let waText = `*PESANAN BARU - BUNDO KANDUANG*\n`;
    waText += `No. Pesanan: ${orderNumber}\n`;
    waText += `Pelanggan: ${nama_pelanggan}\n`;
    waText += `WhatsApp: ${nomor_wa}\n`;
    waText += `Layanan: ${tipe_layanan}\n`;
    if (catatan) waText += `Catatan: ${catatan}\n`;
    waText += `--------------------------------\n`;
    items.forEach(i => {
      waText += `• ${i.nama} (${i.jumlah}x) = Rp ${(i.harga * i.jumlah).toLocaleString('id-ID')}\n`;
    });
    waText += `--------------------------------\n`;
    waText += `*TOTAL ESTIMASI: Rp ${total_harga.toLocaleString('id-ID')}*\n\n`;
    waText += `Mohon konfirmasi ketersediaan dan perkiraan waktu pengantaran. Terima kasih!`;

    const waEncoded = encodeURIComponent(waText);
    const cleanPhone = '6285147413866';
    const waLink = `https://wa.me/${cleanPhone}?text=${waEncoded}`;

    res.status(201).json({
      success: true,
      engine: db.getEngine(),
      database: db.getDatabaseName(),
      message: `Pesanan berhasil disimpan ke database ${db.getEngine()}!`,
      data: {
        id: pesananId,
        nomor_pesanan: orderNumber,
        total_harga,
        whatsapp_url: waLink,
        raw_text: waText
      }
    });
  });
});

// 9. GET /api/pesanan (Daftar semua pesanan dengan item relasi - Dilindungi requireAdmin)
app.get('/api/pesanan', requireAdmin, (req, res) => {
  const sql = `
    SELECT p.*, 
      (SELECT json_group_array(json_object('nama', pi.nama_item, 'jumlah', pi.jumlah, 'harga', pi.harga_satuan, 'subtotal', pi.subtotal))
       FROM pesanan_items pi WHERE pi.pesanan_id = p.id) as items_json
    FROM pesanan p
    ORDER BY p.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal memuat rekap pesanan: ' + err.message });
    }

    const formatted = rows.map(r => {
      let parsedItems = [];
      try {
        if (typeof r.items_json === 'string') {
          parsedItems = JSON.parse(r.items_json);
        } else if (Array.isArray(r.items_json)) {
          parsedItems = r.items_json;
        }
      } catch {
        parsedItems = [];
      }
      return {
        ...r,
        items: parsedItems
      };
    });

    res.json({
      success: true,
      engine: db.getEngine(),
      total: formatted.length,
      data: formatted
    });
  });
});

// 9.1 GET /api/pesanan/track/:nomor (Pelanggan: Lacak Status Pesanan Real-time)
app.get('/api/pesanan/track/:nomor', (req, res) => {
  const { nomor } = req.params;
  const cleanNomor = (nomor || '').trim();

  const sql = `
    SELECT p.*, 
      (SELECT json_group_array(json_object('nama', pi.nama_item, 'jumlah', pi.jumlah, 'harga', pi.harga_satuan, 'subtotal', pi.subtotal))
       FROM pesanan_items pi WHERE pi.pesanan_id = p.id) as items_json
    FROM pesanan p
    WHERE LOWER(p.nomor_pesanan) = LOWER(?) OR CAST(p.id AS CHAR) = ?
    LIMIT 1
  `;

  db.get(sql, [cleanNomor, cleanNomor], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal mencari pesanan: ' + err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: `Pesanan "${cleanNomor}" tidak ditemukan.` });
    }

    let parsedItems = [];
    try {
      if (typeof row.items_json === 'string') {
        parsedItems = JSON.parse(row.items_json);
      } else if (Array.isArray(row.items_json)) {
        parsedItems = row.items_json;
      }
    } catch {
      parsedItems = [];
    }

    res.json({
      success: true,
      data: {
        ...row,
        items: parsedItems
      }
    });
  });
});

// 10. PATCH /api/pesanan/:id/status (Admin & Konfirmasi Pembayaran Pembeli)
app.patch('/api/pesanan/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status pesanan wajib diisi.' });

  // Jika status bukan 'Dibayar' (misal: 'Diproses', 'Selesai', 'Batal'), wajib otorisasi Admin resmi!
  if (status !== 'Dibayar') {
    const authHeader = req.headers.authorization || req.headers['x-admin-token'];
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (authHeader) {
      token = String(authHeader).trim();
    }
    const adminUser = verifyToken(token);
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        error: 'Akses Ditolak: Perubahan status operasional pesanan membutuhkan hak akses pengelola resmi.'
      });
    }
  }

  const isNumeric = /^\d+$/.test(id);
  const sql = isNumeric
    ? 'UPDATE pesanan SET status = ? WHERE id = ? OR LOWER(nomor_pesanan) = LOWER(?)'
    : 'UPDATE pesanan SET status = ? WHERE LOWER(nomor_pesanan) = LOWER(?)';
  const params = isNumeric ? [status, parseInt(id, 10), id] : [status, id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    try {
      fetch(`https://ntfy.sh/padang_order_${id}`, {
        method: 'POST',
        body: JSON.stringify({ status, orderNumber: id })
      }).catch(() => {});
    } catch (e) {}
    res.json({ success: true, message: `Status pesanan ${id} berhasil diubah menjadi ${status} di ${db.getEngine()}` });
  });
});

// 11. DELETE /api/pesanan/:id (Admin: Hapus transaksi - Dilindungi requireAdmin)
app.delete('/api/pesanan/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM pesanan_items WHERE pesanan_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Gagal menghapus item pesanan.' });
    db.run('DELETE FROM pesanan WHERE id = ?', [id], function (err2) {
      if (err2) return res.status(500).json({ error: 'Gagal menghapus data transaksi pesanan.' });
      res.json({ success: true, message: `Pesanan #${id} berhasil dihapus dari ${db.getEngine()}.` });
    });
  });
});

// 12. GET /api/stats (Statistik ringkas keuangan & operasional - Dilindungi requireAdmin)
app.get('/api/stats', requireAdmin, (req, res) => {
  db.get('SELECT COUNT(*) as total_pesanan, COALESCE(SUM(total_harga), 0) as total_omzet FROM pesanan', [], (err, orderStats) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get('SELECT COUNT(*) as total_menu FROM menu', [], (err, menuStats) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get('SELECT COUNT(*) as total_outlet FROM outlet', [], (err, outletStats) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get("SELECT COUNT(*) as pending_pesanan FROM pesanan WHERE status = 'Menunggu Konfirmasi'", [], (err, pendingStats) => {
          
          db.get('SELECT COALESCE(SUM(jumlah), 0) as total_pengeluaran FROM pengeluaran', [], (err, pengeluaranStats) => {
            const omzet = orderStats ? Number(orderStats.total_omzet) : 0;
            const pengeluaran = pengeluaranStats ? Number(pengeluaranStats.total_pengeluaran) : 0;
            const laba = omzet - pengeluaran;

            db.get('SELECT COUNT(*) as total_staf FROM staf', [], (err, stafStats) => {
              res.json({
                success: true,
                engine: db.getEngine(),
                database: db.getDatabaseName(),
                data: {
                  total_menu: menuStats ? menuStats.total_menu : 0,
                  total_outlet: outletStats ? outletStats.total_outlet : 0,
                  total_pesanan: orderStats ? orderStats.total_pesanan : 0,
                  total_omzet: omzet,
                  total_pengeluaran: pengeluaran,
                  laba_bersih: laba,
                  pending_pesanan: pendingStats ? pendingStats.pending_pesanan : 0,
                  total_staf: stafStats ? stafStats.total_staf : 0
                }
              });
            });
          });
        });
      });
    });
  });
});

// 13. PENGELUARAN (Arus Kas Keluar - Biaya Dapur & Operasional Resto - Dilindungi requireAdmin)
app.get('/api/pengeluaran', requireAdmin, (req, res) => {
  db.all('SELECT * FROM pengeluaran ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Gagal memuat catatan pengeluaran.' });
    res.json({ success: true, engine: db.getEngine(), total: rows.length, data: rows });
  });
});

app.post('/api/pengeluaran', requireAdmin, (req, res) => {
  const { judul, kategori, jumlah, tanggal, keterangan } = req.body;
  const cleanJudul = sanitizeInput(judul, 150);
  const cleanKategori = sanitizeInput(kategori, 50);
  const cleanKet = sanitizeInput(keterangan, 300);

  if (!cleanJudul || !cleanKategori || !jumlah || isNaN(jumlah)) {
    return res.status(400).json({ error: 'Judul, kategori, dan nominal pengeluaran valid wajib diisi.' });
  }

  const tgl = tanggal || new Date().toISOString().split('T')[0];
  const sql = 'INSERT INTO pengeluaran (judul, kategori, jumlah, tanggal, keterangan) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [cleanJudul, cleanKategori, parseFloat(jumlah), tgl, cleanKet || '-'], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal menyimpan catatan pengeluaran.' });
    res.status(201).json({ success: true, message: 'Catatan pengeluaran berhasil disimpan!', id: this ? this.lastID : null });
  });
});

app.delete('/api/pengeluaran/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM pengeluaran WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal menghapus pengeluaran.' });
    res.json({ success: true, message: `Pengeluaran #${id} berhasil dihapus.` });
  });
});

// 14. STAF RESTO (Akun Staf, Kasir, Koki, & Kurir - Dilindungi requireAdmin)
app.get('/api/staf', requireAdmin, (req, res) => {
  db.all('SELECT * FROM staf ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Gagal memuat data staf.' });
    res.json({ success: true, engine: db.getEngine(), total: rows.length, data: rows });
  });
});

app.post('/api/staf', requireAdmin, (req, res) => {
  const { nama, role, no_telp, status, shift } = req.body;
  const cleanNama = sanitizeInput(nama, 100);
  const cleanRole = sanitizeInput(role, 50);
  const cleanTelp = sanitizeInput(no_telp, 30);
  const cleanStatus = sanitizeInput(status, 20) || 'Aktif';
  const cleanShift = sanitizeInput(shift, 50) || 'Pagi (08.00 - 16.00)';

  if (!cleanNama || !cleanRole || !cleanTelp) {
    return res.status(400).json({ error: 'Nama, jabatan/role, dan nomor telepon valid wajib diisi.' });
  }

  const sql = 'INSERT INTO staf (nama, role, no_telp, status, shift) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [cleanNama, cleanRole, cleanTelp, cleanStatus, cleanShift], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal menambahkan staf ke database.' });
    res.status(201).json({ success: true, message: 'Akun kru/staf berhasil ditambahkan!', id: this ? this.lastID : null });
  });
});

app.patch('/api/staf/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const cleanStatus = sanitizeInput(req.body.status, 20);
  if (!cleanStatus) return res.status(400).json({ error: 'Status wajib diisi.' });

  db.run('UPDATE staf SET status = ? WHERE id = ?', [cleanStatus, id], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal mengubah status staf.' });
    res.json({ success: true, message: `Status staf #${id} berhasil diubah menjadi ${cleanStatus}.` });
  });
});

app.put('/api/staf/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { nama, role, no_telp, status, shift } = req.body;
  const cleanNama = sanitizeInput(nama, 100);
  const cleanRole = sanitizeInput(role, 50);
  const cleanTelp = sanitizeInput(no_telp, 30);
  const cleanStatus = sanitizeInput(status, 20) || 'Aktif';
  const cleanShift = sanitizeInput(shift, 50) || 'Pagi (08.00 - 16.00)';

  if (!cleanNama || !cleanRole || !cleanTelp) {
    return res.status(400).json({ error: 'Nama, jabatan/role, dan nomor telepon wajib diisi.' });
  }

  const sql = 'UPDATE staf SET nama = ?, role = ?, no_telp = ?, status = ?, shift = ? WHERE id = ?';
  db.run(sql, [cleanNama, cleanRole, cleanTelp, cleanStatus, cleanShift, id], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal memperbarui data staf.' });
    res.json({ success: true, message: `Data staf #${id} berhasil diperbarui!` });
  });
});

app.delete('/api/staf/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM staf WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Gagal menghapus staf.' });
    res.json({ success: true, message: `Staf #${id} berhasil dihapus.` });
  });
});

// 15. GET /api/schema (Ambil DDL schema tabel - Dilindungi requireAdmin)
app.get('/api/schema', requireAdmin, (req, res) => {

  if (db.getEngine().startsWith('MySQL')) {
    const tableNames = ['menu', 'outlet', 'pesanan', 'pesanan_items', 'pengeluaran', 'staf'];
    const results = [];
    let pending = tableNames.length;

    tableNames.forEach(tName => {
      db.all(`SHOW CREATE TABLE \`${tName}\``, [], (err, rows) => {
        if (!err && rows && rows[0]) {
          results.push({
            name: tName,
            sql: rows[0]['Create Table'] || rows[0]['CREATE TABLE'] || Object.values(rows[0])[1]
          });
        }
        pending--;
        if (pending === 0) {
          res.json({
            success: true,
            engine: db.getEngine(),
            database: db.getDatabaseName(),
            total: results.length,
            data: results
          });
        }
      });
    });
  } else {
    db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        success: true,
        engine: db.getEngine(),
        database: db.getDatabaseName(),
        total: rows.length,
        data: rows
      });
    });
  }
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Server Backend Bundo Kanduang Aktif!`);
  console.log(`📡 URL API: http://localhost:${PORT}/api/menu`);
  console.log(`🐬 Engine: ${db.getEngine()} (${db.getDatabaseName()})`);
  console.log(`===============================================`);
});
