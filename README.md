# EPR Achievement Dashboard FY26

> **Portal monitoring multi-tenant** pencapaian target penjualan seluruh toko retail Epson Partner Retail (EPR) dan Partner Premier (EPP) FY26 — tampilan Power BI Analytics, role-based access, strict read-only untuk partner, dan tracking bulanan program paket berjalan.

---

## Demo & Referensi Data

| | URL / Sumber |
|---|---|
| **Referensi dashboard** | [ariswidodo.github.io/EPR](https://ariswidodo.github.io/EPR/) |
| **Data Pembelian Utama** | GitHub repo `ariswidodo/EPR` → `public/data/epr_data.json` |
| **Data Paket Berjalan (Booster Up)** | GitHub repo `ariswidodo/Q3-Booster-Up` → `public/data/program_partners.json` |
| **Supabase project** | `nhuaoaujwfnpymhfgnbf.supabase.co` |

---

## Arsitektur Sistem & Hak Akses

```
Login  ──► Deteksi peran otomatis (Supabase Auth)
               │
               ├─► ADMIN  (admin@epr26.id)
               │     • Tab 1 – Overview & Target H2: lihat & filter 24 toko EPR
               │     • Tab 2 – Paketan Berjalan: 82 peserta Booster Up (ARIS, HERDIAN, SIGIT)
               │               dengan tracking bulanan (Okt, Nov, Des, Sudah Beli, Kurang Berapa)
               │     • Tab 3 – Kontribusi EPP & Audit: seluruh 19 EPP nasional lengkap
               │     • Drawer inspeksi detail toko (termasuk supplier EPP)
               │
               ├─► EPP  (computa, topdistribusi, compumart, rakaperkasa)
               │     • Tab 1 – Overview: monitoring 24 toko EPR (read-only)
               │     • Tab 2 – Paketan Berjalan: monitoring 82 peserta Booster Up lengkap
               │               dengan tracking bulanan (Okt, Nov, Des, Sudah Beli, Kurang Berapa)
               │     • Tab 3 – DIHILANGKAN (hanya untuk Admin demi kerahasiaan)
               │     • Domain login: username@epp26.id
               │
               └─► EPR  (sinarjaya, harrisma, albumi, dst…)
                     • Tab 1 – Overview: terisolasi strictly hanya data TOKO SENDIRI
                     • Tab 2 – Paketan Berjalan: terisolasi paket Booster Up TOKO SENDIRI
                               dengan tracking bulanan (Sudah Beli berapa, Kurang berapa)
                     • Tab 3 – DIHILANGKAN
                     • Subtitle topbar otomatis menampilkan nama toko yang sesuai
                     • Domain login: username@epr26.id
```

---

## Stack Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 + Custom Power BI CSS (`styles-pbi.css`) |
| Icons | Lucide React |
| Backend / Auth | Supabase (PostgreSQL + GoTrue Auth) |
| Keamanan Data | Row-Level Security (RLS) PostgreSQL (Strict Read-Only) |
| Data Utama | `public/data/epr_data.json` (dari repo `ariswidodo/EPR`) |
| Data Booster | `public/data/program_partners.json` (dari repo `ariswidodo/Q3-Booster-Up`) |
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
│       ├── epr_data.json             ← Data utama: 24 toko, 12 bulan fiskal, semua kategori
│       ├── program_partners.json     ← 82 peserta Booster Up & tracking bulanan (Okt, Nov, Des)
│       ├── program_rules.json        ← Skema reward Booster Up
│       └── peserta_booster.csv       ← Master CSV peserta booster
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
        ├── ModernEprDashboard.tsx    ← Dashboard utama (Overview, Booster Up, Audit)
        └── ChangePasswordModal.tsx   ← Modal ganti password mandiri
```

---

## Akun Default

### Admin

| Email | Password | Hak Akses |
|---|---|---|
| `admin@epr26.id` | `AdminEpr2026!` | Full access — semua data EPR, EPP, Booster Up, & Audit |

---

### EPR — Toko Retail (24 Akun)

> Login menggunakan **Email** (`username@epr26.id`) atau **Username** saja.

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

> Login menggunakan **Email** (`username@epp26.id`) atau **Username** saja.

| Kode | Nama EPP | Kota | Email | Password Default |
|---|---|---|---|---|
| EPP-0050 | CV COMPUTA | Yogyakarta | `computa@epp26.id` | `Epp2026!Computa` |
| EPP-0055 | CV TOP DISTRIBUSI | Yogyakarta | `topdistribusi@epp26.id` | `Epp2026!TopDistribusi` |
| EPP-0056 | PT COMPUTEK INFOMART INDONESIA | Semarang | `compumart@epp26.id` | `Epp2026!Compumart` |
| EPP-0245 | PT RAKA PERKASA TEKNOLOGI | Yogyakarta | `rakaperkasa@epp26.id` | `Epp2026!RakaPerkasa` |

> 💡 Semua pengguna dapat mengganti password mandiri via tombol **"Ganti Password"** di pojok kanan atas dashboard.

---

## Hak Akses Per Tab Dashboard

| Tab | Admin | EPP | EPR |
|---|---|---|---|
| **Overview & Target H2** | ✅ Semua 24 toko + slicers | ✅ Semua 24 toko + slicers | ✅ Terisolasi: hanya toko sendiri |
| **Paketan Berjalan (Booster Up)** | ✅ Semua 82 peserta + tracking bulanan | ✅ Semua 82 peserta + tracking bulanan | ✅ Terisolasi: paket toko sendiri + tracking bulanan |
| **Kontribusi EPP & Audit** | ✅ 19 EPP lengkap | ❌ **Dihilangkan** | ❌ **Dihilangkan** |

---

## Fitur Tab Paketan Berjalan (Q3 Booster Up)

Tab **Paketan Berjalan** memantau pencapaian program kuartal 3 (1 Okt – 31 Des 2026) yang disinkronkan dari data resmi `ariswidodo/Q3-Booster-Up`:

1. **Cakupan 82 Peserta**:
   - **ARIS**: 20 Toko *(termasuk Sinar Jaya, Al Bumi, Hetero, dkk)*
   - **HERDIAN**: 42 Toko
   - **SIGIT**: 20 Toko
2. **Tracking Progres Bulanan**:
   - Kolom **Okt 2026**, **Nov 2026**, dan **Des 2026** memantau qty pembelian bulanan.
3. **Sudah Beli vs Kurang Berapa**:
   - **Sudah Beli**: Menampilkan total qty terverifikasi beserta rincian sub-kategori (*Low End, Mid High, Ink Bottle* atau *664/003, Lainnya*).
   - **Kurang (Gap)**: Menghitung selisih real-time terhadap target paket. Jika sudah memenuhi target, berstatus `✓ Terpenuhi`.
4. **Skema Reward Otomatis**:
   - **SUN**: Rp 20.000.000
   - **STAR**: Rp 10.000.000
   - **MOON**: Rp 3.900.000

---

## Setup Lengkap Supabase

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

---

## Uji Coba & Deploy

### Jalankan Lokal
```powershell
npm install
npm run dev
# Buka http://localhost:5173
```

### Build & Deploy Cloudflare Pages
```powershell
npm run build
```
1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages → Pages → Connect to Git**.
2. Build command: `npm run build`, Output directory: `dist`.
3. Set Environment Variables: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.

---

## File Referensi (Desktop)

| File | Keterangan |
|---|---|
| `Desktop/Akun_Toko_EPR_FY26.xlsx` | Rekap username & password 24 toko EPR |
| `Desktop/Akun_EPP_FY26.xlsx` | Rekap username & password 4 EPP lokal |
