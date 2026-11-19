# EPR Achievement Dashboard FY26

> **Portal monitoring multi-tenant** pencapaian target penjualan Epson Partner Retail (EPR) dan Epson Partner Premier (EPP) FY26 — tampilan Power BI Analytics, role-based access, strict read-only untuk partner, verifikasi transaksi, dan tracking bulanan program berjalan.

---

## Demo & Referensi Data

| | URL / Sumber |
|---|---|
| **Referensi dashboard** | [ariswidodo.github.io/EPR](https://ariswidodo.github.io/EPR/) |
| **Data Master & Baseline** | `public/data/epr_data.json`, `epr_master.csv`, `epp_master.csv` |
| **Data Program Berjalan** | `public/data/program_rules.json`, `program_participants_current.json`, `booster_consumables_sku.csv` |
| **Database Harga SKU** | `public/data/sku_price_database.json` |
| **Supabase project** | `nhuaoaujwfnpymhfgnbf.supabase.co` |

> Catatan: `epr_data.json` adalah baseline master dan target. Data pembelian hasil upload disimpan melalui ledger transaksi dan disinkronkan ke Supabase agar Dashboard Admin, EPP, dan EPR membaca sumber yang sama.

---

## Arsitektur Sistem & Hak Akses

```
Login  ──► Deteksi peran otomatis (Supabase Auth)
               │
               ├─► ADMIN  (admin@epr26.id)
               │     • Overview: lihat & filter seluruh EPR
               │     • Program Berjalan: peserta, ketentuan, pembelian bulanan, dan gap
               │     • Kontribusi EPP: rekap penjualan EPP ke EPR dan rincian EPR
               │     • Upload, verifikasi, reset, dan sinkronisasi data transaksi
               │
               ├─► EPP  (computa, topdistribusi, compumart, rakaperkasa)
               │     • Overview: monitoring seluruh EPR (read-only)
               │     • Program Berjalan: pencapaian EPR yang membeli dari EPP tersebut
               │     • Data Upload Epson Hub: validasi bulanan per EPR, kategori, SKU, qty, dan tanggal invoice
               │     • Kontribusi EPP tidak ditampilkan pada akun EPP lain
               │     • Domain login: username@epp26.id
               │
               └─► EPR  (sinarjaya, harrisma, albumi, dst…)
                     • Overview: terisolasi strictly hanya data EPR sendiri
                     • Program Berjalan: hanya program dan pembelian EPR sendiri
                     • Detail pencapaian menampilkan EPP pemasok, kategori produk, SKU, qty, dan tanggal invoice
                     • Subtitle topbar otomatis menampilkan nama EPR yang sesuai
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
| Data Baseline | `public/data/epr_data.json` |
| Data Program | `public/data/program_rules.json`, `program_participants_current.json` |
| Data Harga SKU | `public/data/sku_price_database.json` |
| Data Bersama | Supabase: `sales_records`, `epp_contributions`, `program_transaction_items` |
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
├── supabase_setup.sql                ← [1] Tabel EPR, RLS, trigger, 24 data EPR
├── seed_users.sql                    ← [2] 24 akun login EPR
├── setup_epp.sql                     ← [3] Tabel EPP + 127 data EPP nasional
├── seed_epp_local.sql                ← [4] Akun Admin + 4 EPP lokal Jawa Tengah
├── update_epr_credentials.sql        ← [5] Update username & password 24 EPR
├── lockdown_readonly_rls.sql         ← [6] Kunci strict READ-ONLY EPR & EPP
├── patch_user_metadata.sql           ← [7] Patch epr_code ke JWT user_metadata
├── shared_dashboard_data.sql         ← [8] Tabel ledger transaksi & kontribusi bersama + grants
│
├── public/
│   └── data/
│       ├── epr_data.json             ← Baseline: 24 EPR, 12 bulan fiskal, semua kategori
│       ├── program_rules.json        ← Skema reward Booster Up
│       ├── program_participants_current.json ← Peserta program berjalan saat ini
│       ├── booster_consumables_sku.csv ← SKU Consumables yang dihitung
│       ├── sku_price_database.json    ← Harga rekomendasi per Material Code
│       ├── epr_master.csv             ← Master EPR dan kota
│       └── epp_master.csv             ← Master EPP dan kota
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
        ├── ModernEprDashboard.tsx    ← Dashboard utama (Overview, Program Berjalan, Kontribusi EPP)
        └── ChangePasswordModal.tsx   ← Modal ganti password mandiri
```

---

## Akun Default

### Admin

| Email | Password | Hak Akses |
|---|---|---|
| `admin@epr26.id` | `AdminEpr2026!` | Full access — semua data EPR, EPP, program berjalan, upload, & verifikasi |

---

### EPR — Partner Retail (24 Akun)

> Login menggunakan **Email** (`username@epr26.id`) atau **Username** saja.

| Kode | Nama EPR | Username / Email | Password Default |
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
| **Overview & Target H2** | ✅ Semua EPR + slicers | ✅ Semua EPR + slicers | ✅ Terisolasi: hanya EPR sendiri |
| **Program Berjalan** | ✅ Semua peserta + ketentuan | ✅ EPR yang terkait dengan EPP | ✅ Terisolasi: EPR sendiri |
| **Kontribusi EPP** | ✅ Rekap semua EPP dan EPR | ❌ Tidak ditampilkan | ❌ Tidak ditampilkan |
| **Upload Data Pembelian EPR** | ✅ Topbar (Modal Impor) | ❌ Tidak Ada | ❌ Tidak Ada |
| **Data Upload Epson Hub** | ✅ Audit seluruh EPP/EPR | ✅ EPP sendiri per bulan | ❌ Tidak Ada |

### Aturan Sesi Login

- Sesi dashboard otomatis logout setelah **5 jam tanpa aktivitas**.
- Aktivitas yang dihitung meliputi klik/touch, keyboard, scroll, dan pergerakan mouse.
- Refresh halaman pada tab yang sama tetap mempertahankan sesi.
- Setelah tab atau browser ditutup, sesi lokal tidak dipulihkan ketika dashboard dibuka kembali.
- Logout manual dan logout otomatis menghapus sesi Supabase lokal.

---

## Fitur Upload Data Pembelian EPR (Khusus Admin)

Dashboard Admin dilengkapi tombol **"Upload Data EPR"** di bagian atas (topbar) dengan mesin verifikasi dan filter deduplikasi penuh yang mengadopsi engine dari repositori `ariswidodo/EPR` (`src/lib/epr_engine.ts`):

1. **Format & Template yang Didukung**:
   - **Template V3 (`Report Retail Q*`)**: Mendukung sheet laporan resmi kuartal Epson (Rebate Category & Total Price Net Exclude PPN).
   - **Template V2 (`Partner Hub*`)**: Sheet data Epson Partner Hub; struktur harga sama dengan V1 dan final price dibagi 1,11.
   - **Template V1 (`Sheet1`)**: Detail transaksi sell-out; final price dibagi 1,11.
   - **Sheet `RETAIL` (Summary Matrix)**: Rekapitulasi target dan pembelian bulanan 4 kategori (*Consumer, Scanner, Consumables, Dotmatrix*).

2. **Harga dan Verifikasi**:
   - **Validasi Master EPR**: Hanya transaksi dari EPR resmi yang diterima. Transaksi di luar master ditolak dengan status `LUAR DATABASE EPR`.
   - **Validasi kategori**: `SCN` menjadi Scanner, `CISS/SOHO` menjadi Consumer, `SIDM` menjadi Dotmatrix, dan kategori `*Cons` menjadi Consumables.
   - **Harga V1/V2**: sistem membandingkan harga jual EPP dengan `sku_price_database.json` berdasarkan Material Code, memakai harga yang lebih rendah, mengalikan Qty, lalu membagi 1,11 untuk mengeluarkan PPN.
   - **Tanggal invoice**: tanggal kalender invoice dipertahankan tanpa pergeseran zona waktu, termasuk tanggal 1 pada awal bulan.

3. **Ledger Anti-Duplikasi**:
   - Identitas transaksi menggunakan EPR, Invoice No, tanggal, Material Code, Qty, harga, UID/SN, total, dan EPP.
   - Upload file yang sama kembali ditolak sebagai `SUDAH TERVERIFIKASI`.
   - Baris kembar di file yang sama ditolak sebagai `KEMBAR DALAM INPUT`.
   - Ledger detail disimpan pada `program_transaction_items`; dashboard tidak hanya membandingkan total EPR.

4. **Penggabungan Data Akumulatif (Non-Destructive Merge)**:
   - File transaksi yang diunggah (misal kuartal berjalan atau bulanan) digabungkan di atas data baseline yang ada tanpa menghapus pencapaian bulan-bulan sebelumnya.
   - Perhitungan kuartal (Q1–Q4), semester (H1, H2), dan total tahun fiskal (FY) otomatis diperbarui secara akurat.
   - Data EPP/EPR/Admin membaca ledger yang sama sehingga rincian EPR, kategori, SKU, Qty, harga, dan tanggal invoice konsisten.
   - Apabila transaksi yang diunggah berada pada periode kuartal terdahulu, dashboard otomatis menyesuaikan tampilan agar data terlihat.

5. **Penyimpanan Live & Tombol Reset**:
   - Hasil upload disimpan sementara di `localStorage` Admin (`epr_custom_data_v2`) dan disinkronkan ke Supabase.
   - `sales_records` menyimpan agregat bulanan, `epp_contributions` menyimpan kontribusi EPP ke EPR, dan `program_transaction_items` menyimpan detail ledger.
   - Tombol **"Kembalikan ke Data Awal"** menghapus data pembelian bersama dan mengembalikan baseline master/target ke kondisi nol.
   - Setelah reset, upload ulang file sumber satu kali untuk membangun ledger baru.

### Alur upload yang direkomendasikan

```text
Reset Data ke bawaan sistem (jika mengganti sumber/struktur data)
        ↓
Upload file V1/V2/V3 dari akun Admin
        ↓
Verifikasi EPR, invoice, tanggal, SKU, Qty, harga, kategori, dan duplikasi
        ↓
Sinkronisasi Supabase
        ↓
Dashboard Admin, EPP, dan EPR membaca ledger yang sama
```

---

## Fitur Program Berjalan (Q3 Booster Up)

Tab **Program Berjalan** memantau pencapaian program periode 1 Okt – 31 Des 2026 berdasarkan peserta, ketentuan paket, dan master SKU lokal:

1. **Sumber konfigurasi program**:
   - `program_participants_current.json` menentukan EPR yang ikut program.
   - `program_rules.json` menentukan target per paket, subkategori, periode, dan EPP lokal yang dihitung.
   - `booster_consumables_sku.csv` menentukan SKU Consumables yang valid.
   - Pembelian hanya dihitung dari EPP lokal yang ditentukan ketentuan program.
2. **Tracking Progres Bulanan**:
   - Kolom **Okt 2026**, **Nov 2026**, dan **Des 2026** memantau qty pembelian bulanan.
3. **Sudah Beli vs Kurang Berapa**:
   - **Sudah Beli**: Menampilkan total qty terverifikasi beserta rincian subkategori (*Low End, Mid High, Ink Bottle* atau *664/003, Lainnya*).
   - **Kurang (Gap)**: Menghitung selisih real-time terhadap target paket. Jika sudah memenuhi target, berstatus `✓ Terpenuhi`.
4. **Detail audit**: pembelian yang dihitung harus cocok dengan EPR peserta, periode program, nama program, SKU kategori, dan EPP lokal yang diizinkan.

---

## Setup Lengkap Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → pilih project Anda.
2. **Authentication → Providers → Email** → nonaktifkan **"Confirm email"**.
3. Buka **SQL Editor**, jalankan file SQL **secara berurutan**:

   | # | File | Fungsi |
   |---|---|---|
   | 1 | `supabase_setup.sql` | Buat tabel `epr_stores`, RLS, trigger, insert 24 data EPR |
   | 2 | `seed_users.sql` | Buat 24 akun login EPR + perbaikan token NULL |
   | 3 | `setup_epp.sql` | Buat tabel `epp_stores`, RLS, insert 127 data EPP nasional |
   | 4 | `seed_epp_local.sql` | Akun Admin + 4 akun EPP lokal Jawa Tengah |
   | 5 | `update_epr_credentials.sql` | Update username & password 24 EPR |
   | 6 | `lockdown_readonly_rls.sql` | Kunci strict READ-ONLY EPR & EPP di level database |
   | 7 | `patch_user_metadata.sql` | Set `epr_code` ke `raw_user_meta_data` JWT semua akun EPR |
   | 8 | `shared_dashboard_data.sql` | Buat tabel data bersama, ledger transaksi, grants, dan izin sinkronisasi |

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
| `Desktop/Akun_Toko_EPR_FY26.xlsx` | Rekap username & password 24 EPR |
| `Desktop/Akun_EPP_FY26.xlsx` | Rekap username & password 4 EPP lokal |
