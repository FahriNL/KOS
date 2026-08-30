# 🏠 KosManager - Sistem Manajemen Kos Modern & Multi-Device

Aplikasi web manajemen kos yang modern, simpel, intuitif, dan responsif (Mobile-first). Mempermudah pengelolaan nomor kamar, penghuni, siklus jatuh tempo sewa, pengingat WhatsApp 1-klik, dan pembukuan arus kas kos.

Didesain untuk dapat diakses secara tersinkronisasi di **Smartphone & Laptop**, dengan biaya **100% GRATIS (Rp 0)** menggunakan arsitektur **GitHub Pages + Supabase Cloud**.

---

## ✨ Fitur Utama

- 🏢 **Visual Room Matrix**: Tampilan visual status kamar dengan kode warna (🟢 Kosong, 🔵 Terisi, 🟡 Mendekati Jatuh Tempo, 🔴 Menunggak, ⚪ Perbaikan).
- 👥 **Manajemen Penghuni & Check-in/Check-out**: Form pencatatan lengkap data penyewa, uang jaminan (deposit), dan tanggal mulai sewa.
- ⏰ **Deteksi Siklus Jatuh Tempo Otomatis**: Menghitung mundur tagihan sewa bulanan dan memberikan sinyal peringatan (H-7 hingga overdue).
- 💬 **1-Click WhatsApp Reminder**: Membuka WhatsApp secara instan dengan pesan tagihan yang sudah terisi otomatis (Nama, Kamar, Nominal, Jatuh Tempo, dan No Rekening).
- 💰 **Buku Kas & Laporan Keuangan**: Pencatatan pemasukan sewa dan pengeluaran operasional (listrik, air PDAM, WiFi, maintenance).
- 📱 **Mobile-First & PWA Support**: Tampilan nyaman di HP dengan navigasi bawah (*Bottom Navigation*) dan dapat di-*Add to Home Screen*.
- 🔐 **Keamanan & Sinkronisasi Cloud**: Didukung database cloud PostgreSQL Supabase dengan *Row Level Security* (RLS) sehingga data pribadi penghuni tidak tersimpan di repositori publik GitHub.
- ⚡ **Offline / Demo Mode**: Dapat langsung digunakan dan dicoba secara offline tanpa konfigurasi awal yang rumit.

---

## 🚀 Cara Menjalankan di Komputer Lokal

1. Buka terminal di folder proyek ini:
   ```bash
   npm install
   ```
2. Jalankan server lokal:
   ```bash
   npm run dev
   ```
3. Buka browser di `http://localhost:3000`.

---

## ☁️ Cara Menghubungkan ke Supabase (Database Cloud Gratis)

1. Buat akun gratis di [https://supabase.com](https://supabase.com).
2. Buat proyek baru (*New Project*), misalnya: `KosManager`.
3. Buka menu **SQL Editor** di Supabase Dashboard, buat query baru, lalu salin dan jalankan seluruh isi file `src/sql/schema.sql`.
4. Buka menu **Project Settings → API** di Supabase Dashboard:
   - Salin **Project URL**
   - Salin **Project API Keys (anon / public)**
5. Buka aplikasi web Anda, masuk ke menu **Pengaturan → Database Supabase**, masukkan URL & Key tersebut, lalu klik **Simpan & Hubungkan Cloud**.

---

## 🌐 Cara Deploy Gratis ke GitHub Pages

1. Buat repository baru di akun GitHub Anda (misal: `kos-manager`).
2. Upload kode proyek ke repository tersebut:
   ```bash
   git init
   git add .
   git commit -m "Initial commit KosManager"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/kos-manager.git
   git push -u origin main
   ```
3. Buka **Settings → Pages** di repository GitHub Anda, pilih *Source: GitHub Actions* atau gunakan branch `gh-pages` setelah menjalankan `npm run build`.
4. Web kos Anda kini live di internet dan bisa diakses dari mana saja tanpa biaya sewa server!
