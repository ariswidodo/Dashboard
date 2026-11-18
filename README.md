# EPR Achievement Dashboard FY26

> **Portal monitoring multi-tenant** pencapaian target penjualan seluruh toko retail Epson Partner Retail (EPR) dan Partner Premier (EPP) FY26 — tampilan Power BI Analytics, role-based access, strict read-only untuk partner.

---

## Demo & Referensi Data

| | URL |
|---|---|
| **Referensi dashboard** | [ariswidodo.github.io/EPR](https://ariswidodo.github.io/EPR/) |
| **Data sumber** | GitHub repo `ariswidodo/EPR` → `epr_data.json` |
| **Supabase project** | `nhuaoaujwfnpymhfgnbf.supabase.co` |

---

## Arsitektur Sistem

```
Login  ──► Deteksi peran otomatis (Supabase Auth)
               │
               ├─► ADMIN  (admin@epr26.id)
               │     • Tab 1 – Overview & Target H2: lihat & filter 24 toko EPR
               │     • Tab 2 – Paketan Berjalan: 62 peserta Booster Up (semua AM)
               │     • Tab 3 – Kontribusi EPP & Audit: semua 19 EPP lengkap
               │     • Drawer detail per toko (termasuk sumber EPP)
               │
               ├─► EPP  (computa, topdistribusi, compumart, rakaperkasa)
               │     • Tab 1 – Overview: monitoring 24 toko EPR (read-only)
               │     • Tab 2 – Paketan Berjalan: lihat program Booster Up
               │     • Tab 3 – Kontribusi EPP: baris MILIK SENDIRI penuh +
               │               baris EPP lain dianonimkan "EPP Lain #N"
               │     • Domain login: username@epp26.id
               │
               └─► EPR  (sinarjaya, harrisma, dst…)
                     • Tab 1 – Overview: hanya data TOKO SENDIRI
                     • Tab 2 – Paketan Berjalan: pesan "tidak terdaftar"
                               jika toko tidak ikut program (area AM ARIS)
                     • Tab 3 – tersembunyi
                     • Subtitle topbar menampilkan nama toko yang tepat
                     • Domain login: username@epr26.id
```

---

## Stack Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 + Custom PBI CSS (`styles-pbi.css`) |
| Icons | Lucide React |
| Backend / Auth | Supabase (PostgreSQL + GoTrue Auth) |
| Keamanan Data | Row-Level Security (RLS) PostgreSQL |
| Data Pembelian | `public/data/epr_data.json` (dari repo `ariswidodo/EPR`) |
| Hosting | Cloudflare Pages (Free Tier) |

---

## Struktur File Proyek

```
epr-dashboard/
├── .env                              ← Kredensial Supabase (git-ignored)
├── .env.example                      ← Template variabel environment
├── index.html
├── vite.config.ts
├── tsconfig.json / package.json
│
│── SQL Scripts (jalankan berurutan di Supabase SQL Editor):
├── supabase_setup.sql                ← [1] Tabel EPR, RLS, trigger, 24 data toko
├── seed_users.sql                    ← [2] 24 akun login EPR
├── setup_epp.sql                     ← [3] Tabel EPP + 127 data EPP nasional
├── seed_epp_local.sql                ← [4] Akun Admin + 4 EPP lokal Jawa Tengah
├── update_epr_credentials.sql        ← [5] Update username & password 24 EPR
├── import_pembelian_sales.sql        ← [6] Import 288 catatan pembelian bulanan
├── lockdown_readonly_rls.sql         ← [7] Kunci strict READ-ONLY EPR & EPP
├── patch_user_metadata.sql           ← [8] Patch epr_code ke JWT user_metadata
│
├── public/
│   └── data/
│       ├── epr_data.json             ← Data utama: 24 toko, 12 bulan, semua kategori
│       ├── program_rules.json        ← Skema reward Booster Up
│       └── peserta_booster.csv       ← Daftar peserta program
│
└── src/
    ├── main.tsx
    ├── App.tsx                       ← Auth session, deteksi role, pass userEprCode
    ├── index.css                     ← Import Tailwind + styles-pbi.css
    ├── styles-pbi.css                ← CSS Power BI custom (dari ariswidodo/EPR)
    ├── types-pbi.ts                  ← TypeScript interfaces (PartnerData, EprFullData…)
    ├── vite-env.d.ts
    ├── lib/
    │   └── supabase.ts               ← Supabase client + guard isSupabaseConfigured
    └── components/
        ├── Login.tsx                 ← Login (multi-domain: @epr26.id → @epp26.id)
        ├── ModernEprDashboard.tsx    ← Dashboard utama (1 file, 3 tab, semua role)
        └── ChangePasswordModal.tsx   ← Modal ganti password mandiri
```

---

## Akun Default

### Admin

| Email | Password | Akses |
|---|---|---|
| `admin@epr26.id` | `AdminEpr2026!` | Full access — semua data EPR + EPP |

---

### EPR — Toko Retail (24 Akun)

> Login menggunakan **Email** (`username@epr26.id`) dan password di bawah.

| Kode | Nama Toko | Username / Email | Password Default |
|---|---|---|---|
| EPR-0038 | SINAR JAYA COMPUTER | `sinarjaya@epr26.id` | `Epr2026!SinarJaya` |
| EPR-0054 | PT HETERO NIAGA GLOBAL | `heteroniaga@epr26.id` | `Epr2026!HeteroNiaga` |
| EPR-0267 | PT HARRISMA PRATAMAJAYA | `harrisma@epr26.id` | `Epr2026!Harrisma` |
| EPR-0650 | CV RAJA PRINT SOLUTION | `rajaprint@epr26.id` | `Epr2026!RajaPrint` |
| EPR-0733 | MICRO PRINTER | `microprinter@epr26.id` | `Epr2026!MicroPrinter` |
| EPR-0881 | UD PIXEL | `pixel@epr26.id` | `Epr2026!PixelSemarang` |
| EPR-1002 | AL BUMI IT STORE | `albumi@epr26.id` | `Epr2026!AlBumi` |
| EPR-1005 | CV PRIBUMI JAYA KOMPUTAMA | `pribumijaya@epr26.id` | `Epr2026!PribumiJaya` |
| EPR-1197 | CV YESTOYA ABADI | `yestoya@epr26.id` | `Epr2026!YestoyaAbadi` |
| EPR-1409 | PRIMA KOMPUTER | `primakomputer@epr26.id` | `Epr2026!PrimaKomputer` |
| EPR-1410 | CV SAFRINDO PERKASA | `safrindo@epr26.id` | `Epr2026!Safrindo` |
| EPR-1413 | PT INFOKOM PUTRA KENCANA | `infokom@epr26.id` | `Epr2026!InfokomPutra` |
| EPR-1570 | CV MITRA PRATAMA KOMPUTINDO | `mitrapratama@epr26.id` | `Epr2026!MitraPratama` |
| EPR-1628 | CV ARTADINATA PERKASA ABADI | `artadinata@epr26.id` | `Epr2026!Artadinata` |
| EPR-1768 | CV KARYA HIDUP MULYA | `karyahidupmulya@epr26.id` | `Epr2026!KaryaHidupMulya` |
| EPR-1770 | CV PUTRA MANDIRI | `putramandiri@epr26.id` | `Epr2026!PutraMandiri` |
| EPR-1816 | CV SALAM JAYA KOMPUTINDO | `salamjaya@epr26.id` | `Epr2026!SalamJaya` |
| EPR-1845 | CV BUMI RAYA INDONESIA | `bumiraya@epr26.id` | `Epr2026!BumiRaya` |
| EPR-1906 | ELLITE COMPUTER WELERI | `ellite@epr26.id` | `Epr2026!ElliteWeleri` |
| EPR-1907 | PT HAIGA CITRA DIGITAL | `haiga@epr26.id` | `Epr2026!HaigaCitra` |
| EPR-1966 | CV MITRA SARANA TEKNIK | `mitrasarana@epr26.id` | `Epr2026!MitraSarana` |
| EPR-1967 | CV DIAMOND INDO | `diamondindo@epr26.id` | `Epr2026!DiamondIndo` |
| EPR-1999 | CV NAFIRI | `nafiri@epr26.id` | `Epr2026!NafiriSemarang` |
| EPR-2013 | CV JAYA MAKMUR STATIONARY | `jayamakmur@epr26.id` | `Epr2026!JayaMakmur` |

---

### EPP — Partner Premier Aktif (4 Akun Lokal Jawa Tengah)

> Login menggunakan **Email** (`username@epp26.id`).

| Kode | Nama EPP | Kota | Email | Password Default |
|---|---|---|---|---|
| EPP-0050 | CV COMPUTA | Yogyakarta | `computa@epp26.id` | `Epp2026!Computa` |
| EPP-0055 | CV TOP DISTRIBUSI | Yogyakarta | `topdistribusi@epp26.id` | `Epp2026!TopDistribusi` |
| EPP-0056 | PT COMPUTEK INFOMART INDONESIA | Semarang | `compumart@epp26.id` | `Epp2026!Compumart` |
| EPP-0245 | PT RAKA PERKASA TEKNOLOGI | Yogyakarta | `rakaperkasa@epp26.id` | `Epp2026!RakaPerkasa` |

> 💡 Semua pengguna dapat mengganti password mandiri via tombol **"Ganti Password"** di pojok kanan atas dashboard.

---

## Setup Lengkap

### Langkah 1 — Setup Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → pilih project Anda.
2. **Authentication → Providers → Email** → nonaktifkan **"Confirm email"**.
3. Buka **SQL Editor**, jalankan file SQL **secara berurutan**:

   | # | File | Fungsi |
   |---|---|---|
   | 1 | `supabase_setup.sql` | Buat tabel `epr_stores`, RLS, trigger, insert 24 data toko |
   | 2 | `seed_users.sql` | Buat 24 akun login EPR + perbaikan token NULL |
   | 3 | `setup_epp.sql` | Buat tabel `epp_stores`, RLS, insert 127 data EPP nasional |
   | 4 | `seed_epp_local.sql` | Akun Admin + 4 akun EPP lokal Jawa Tengah |
   | 5 | `update_epr_credentials.sql` | Update username & password 24 toko EPR |
   | 6 | `import_pembelian_sales.sql` | Import 288 catatan pembelian bulanan ke `sales_records` |
   | 7 | `lockdown_readonly_rls.sql` | Kunci strict READ-ONLY EPR & EPP di level database |
   | 8 | `patch_user_metadata.sql` | Set `epr_code` ke `raw_user_meta_data` JWT semua akun EPR |

4. *(Opsional — jika muncul error `Database error querying schema`)*:
   ```sql
   update auth.users set
     confirmation_token    = coalesce(confirmation_token, ''),
     recovery_token        = coalesce(recovery_token, ''),
     email_change          = coalesce(email_change, ''),
     email_change_token_new = coalesce(email_change_token_new, '');
   notify pgrst, 'reload schema';
   ```

5. Hubungkan `user_id` ke tabel `epr_stores` jika belum:
   ```sql
   update public.epr_stores s
   set user_id = u.id
   from auth.users u
   where lower(split_part(u.email, '@', 1)) = lower(s.username);
   notify pgrst, 'reload schema';
   ```

#### Troubleshooting Umum Supabase

| Error | Penyebab | Solusi |
|---|---|---|
| `Database error querying schema` | Token NULL di `auth.users` | Jalankan query langkah 4 |
| `null value in column provider_id` | GoTrue versi baru wajib `provider_id` | Sudah ditangani di `seed_*.sql` |
| Subtitle toko salah setelah login | `epr_code` belum di JWT | Jalankan `patch_user_metadata.sql`, lalu logout & login ulang |
| "Akun belum terhubung data toko" | `user_id` di `epr_stores` kosong | Jalankan query langkah 5 |

---

### Langkah 2 — Konfigurasi Environment

Salin `.env.example` → `.env`, isi dengan nilai dari **Supabase → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbg...
```

---

### Langkah 3 — Uji Coba Lokal

```powershell
npm install
npm run dev
# Buka http://localhost:5173
```

---

### Langkah 4 — Deploy ke GitHub

```powershell
git remote add origin https://github.com/USERNAME_ANDA/epr-dashboard.git
git branch -M main
git push -u origin main
```

---

### Langkah 5 — Deploy ke Cloudflare Pages

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages → Pages → Connect to Git**
2. Pilih repositori `epr-dashboard`
3. Pengaturan build:
   - **Framework**: `Vite`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Tambahkan **Environment Variables** di Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Save and Deploy** → aktif di `https://epr-dashboard.pages.dev`

---

## Keamanan & Hak Akses

Semua hak akses dikunci di tingkat database PostgreSQL via **Row-Level Security (RLS)**.

| Role | Hak Akses | Catatan |
|---|---|---|
| **Admin** | Full Read & Write | Satu-satunya yang bisa edit data master & realisasi |
| **EPP** | Read-Only | Lihat monitoring 24 EPR; identitas EPP kompetitor **dirahasiakan** |
| **EPR** | Strict Read-Only | Hanya data toko sendiri; tidak ada form input/edit |
| **Semua** | Ganti password | Hanya untuk akun login pribadi masing-masing |

> Sekalipun seseorang memodifikasi kode frontend di browser, database PostgreSQL Supabase secara mutlak menolak `INSERT`, `UPDATE`, atau `DELETE` dari akun selain Admin.

---

## Hak Akses Per Tab Dashboard

| Tab | Admin | EPP | EPR |
|---|---|---|---|
| Overview & Target H2 | ✅ Semua 24 toko + filter | ✅ Semua 24 toko + filter | ✅ Hanya toko sendiri |
| Paketan Berjalan | ✅ 62 peserta (semua AM) | ✅ 62 peserta (semua AM) | ⚠️ Pesan "tidak terdaftar" (AM ARIS tidak ikut Booster Up) |
| Kontribusi EPP & Audit | ✅ 19 EPP lengkap | ✅ Baris sendiri penuh + EPP lain dianonimkan | ❌ Tab tidak muncul |

---

## Data Pembelian

Data utama dashboard dibaca dari file statis:

```
public/data/epr_data.json
```

File ini di-*clone* dari repo `ariswidodo/EPR` dan berisi:
- **24 partner EPR** (area AM ARIS, Jawa Tengah)
- **12 bulan** data pembelian FY26 (Apr 2025 – Mar 2026)
- **4 kategori**: Consumer, Consumables, Scanner, Dotmatrix
- **62 peserta** program Booster Up (AM HERDIAN + SIGIT)
- **19 EPP** ringkasan kontribusi supply

Untuk memperbarui data, ganti file `public/data/epr_data.json` lalu `npm run build` ulang.

---

## File Referensi (Desktop)

| File | Keterangan |
|---|---|
| `Desktop/Akun_Toko_EPR_FY26.xlsx` | Rekap username & password 24 toko EPR |
| `Desktop/Akun_EPP_FY26.xlsx` | Rekap username & password 4 EPP lokal |
