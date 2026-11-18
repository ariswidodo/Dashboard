# Portal Partner EPR FY26 - Dashboard Toko

Website dashboard partner retail khusus untuk pemantauan target penjualan FY26 dan realisasi bulanan toko dengan sistem multi-tenant berbasis **Supabase PostgreSQL Row-Level Security (RLS)** dan frontend **React + Vite + Tailwind CSS**, siap di-deploy secara gratis ke **Cloudflare Pages**.

---

## Fitur Utama

1. **Keamanan Tingkat Database (RLS)**:
   - Toko yang login hanya dapat melihat data toko & target penjualannya sendiri.
   - Database Supabase menolak akses data antar-toko secara native.
2. **Login Ramah Pengguna**:
   - Toko masuk hanya menggunakan **Username** dan **Password (Default)** tanpa perlu menghafal kode toko atau email.
3. **Mandiri Ganti Password**:
   - Pengguna dapat mengganti password mereka sendiri langsung melalui tombol di dashboard toko.
4. **Tracking Realisasi Penjualan Bulanan**:
   - Toko dapat menginput dan memperbarui pencapaian aktual per bulan (Bulan 1 - 11) dan melihat persentase pencapaian (% Achievement).

---

## Langkah 1: Setup Supabase

1. Buka dashboard [Supabase](https://supabase.com/dashboard) dan pilih/buat project Anda.
2. Buka menu **Authentication** > **Providers** > **Email**:
   - Nonaktifkan / uncheck pilihan **"Confirm email"** (agar akun toko langsung aktif dan bisa langsung login dengan password default tanpa verifikasi email).
3. Buka menu **SQL Editor**, buat tab baru, lalu salin dan jalankan seluruh isi file:
   📄 [`supabase_setup.sql`](./supabase_setup.sql)
   *(Skrip ini otomatis membuat tabel, RLS policy, trigger penaut akun, dan memasukkan seluruh 24 data master toko dari Excel)*.

---

## Langkah 2: Konfigurasi Environment (`.env`)

1. Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Buka dashboard Supabase > **Project Settings** > **API**, lalu isi `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbg...
   ```

---

## Langkah 3: Daftarkan 24 Akun Toko Secara Otomatis

Jalankan script Python berikut di terminal untuk mendaftarkan 24 akun toko sekaligus:
```bash
python register_users.py
```
*Daftar lengkap username & password default untuk dibagikan ke toko dapat dilihat di file `C:\Users\Qeea.Deeva\Desktop\Akun_Toko_EPR_FY26.xlsx`.*

---

## Langkah 4: Uji Coba di Komputer Lokal

```bash
npm run dev
```
Buka browser di alamat `http://localhost:5173`, lalu coba login menggunakan salah satu username toko (contoh: username `sinarjaya` dan password `Epr2026!SinarJaya`).

---

## Langkah 5: Deploy ke GitHub & Cloudflare Pages

### A. Unggah ke GitHub
1. Buat repository baru di [GitHub](https://github.com/new) (misal bernama: `epr-dashboard`).
2. Di folder proyek ini, jalankan:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi portal partner EPR FY26"
   git branch -M main
   git remote add origin https://github.com/USERNAME_GITHUB_ANDA/epr-dashboard.git
   git push -u origin main
   ```

### B. Hubungkan ke Cloudflare Pages
1. Masuk ke dashboard [Cloudflare](https://dash.cloudflare.com/) > **Workers & Pages** > **Pages** > **Connect to Git**.
2. Pilih repositori `epr-dashboard`.
3. Di pengaturan build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Tambahkan **Environment variables**:
   - `VITE_SUPABASE_URL` = *(URL Supabase Anda)*
   - `VITE_SUPABASE_ANON_KEY` = *(Anon key Supabase Anda)*
5. Klik **Save and Deploy**. Website Anda akan langsung aktif dengan domain gratis `*.pages.dev`.
