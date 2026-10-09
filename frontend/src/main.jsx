import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Proteksi & Peringatan Keamanan Konsol Peramban (Anti-Tampering Warning)
if (typeof window !== 'undefined') {
  console.log(
    '%c🛡️ PERINGATAN KEAMANAN MASAKAN PADANG ID 🛡️',
    'color: #dc2626; font-size: 16px; font-weight: 900; background: #fee2e2; padding: 4px 10px; border-radius: 4px; border: 1px solid #ef4444;'
  );
  console.log(
    '%cPERHATIAN: Mengubah atau menyuntikkan data pada Local Storage (Application), Cookie, atau Console untuk membobol akses pengelola diproteksi oleh validasi kriptografis HMAC SHA-256 pada server. Segala bentuk manipulasi data otomatis memicu penghapusan sesi seketika.',
    'color: #b45309; font-size: 11px; font-weight: 600;'
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
