# Portal Partner EPR & EPP FY26 — Dashboard Toko

Website dashboard multi-tenant untuk monitoring target penjualan dan realisasi bulanan seluruh partner retail (EPR) dan partner premier (EPP) FY26, dibangun dengan **React + Vite + Tailwind CSS**, backend **Supabase PostgreSQL + RLS**, dan hosting gratis di **Cloudflare Pages**.

---

## Arsitektur Sistem

```
Login  ──► Sistem deteksi peran otomatis
              │
              ├─► ADMIN  (admin@epr26.id)
              │     • Tab EPR: Lihat & inspeksi 24 toko retail
              │     • Tab EPP: Lihat 127 master data EPP nasional
              │     • Klik "Lihat Detail" untuk inspeksi tiap toko
              │
              ├─► EPP (computa, compumart, dst...)
              │     • Profil identitas EPP sendiri
              │     • Monitoring performa pembelian 24 toko retail (EPR)
              │     • TIDAK menampilkan identitas EPP pemasok lainnya
              │     • Filter per kota, kategori, search nama toko
              │     • Modal detail pembelian bulanan per toko EPR
              │
              └─► EPR (sinarjaya, harrisma, dst...)
                    • Dashboard target & profil toko sendiri
                    • Kartu metrik: Target FY26, H1/H2, Bulanan
                    • Input & tracking realisasi penjualan per bulan
                    • Progress bar pencapaian (% Achievement)
                    • Ganti password mandiri
```

---

## Stack Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Backend / Auth | Supabase (PostgreSQL + GoTrue Auth) |
| Keamanan Data | Row-Level Security (RLS) PostgreSQL |
| Hosting | Cloudflare Pages (Free Tier) |
| Repositori | GitHub |

---

## Data Master

| Program | Jumlah | Wilayah | File Excel Sumber |
|---|---|---|---|
| **EPR** (Retail) | 24 Toko | Jawa Tengah (AM: ARIS) | `EPR FY26.xlsx` |
| **EPP** (Partner Premier) | 127 Toko | Seluruh Indonesia | `EPP FY26.xlsx` |

### Kategori Tier EPR

| Tier | Warna | Category Target |
|---|---|---|
| ☀️ SUN | Amber | Rp 6.000.000.000 |
| ⭐ STAR | Purple | Rp 4.000.000.000 |
| 🌙 MOON | Sky Blue | Rp 1.500.000.000 |
| 🌍 EARTH | Emerald | Rp 2.500.000.000 |
| 🌙 CRESCENT | Slate | Rp 200.000.000 |

---

## Akun Default

### Admin
| Username | Domain Internal | Password Default | Akses |
|---|---|---|---|
| `admin` | `admin@epr26.id` | `AdminEpr2026!` | Seluruh data EPR + EPP (Full Access) |

### EPR — Toko Retail (24 Akun)
> Pengguna dapat login menggunakan **Username** saja (sistem otomatis mengarahkan ke akun yang tepat) atau menggunakan **Email Akun**.

| Kode | Nama Toko | Username | Email Akun | Password Default |
|---|---|---|---|---|
| EPR-0038 | SINAR JAYA COMPUTER / CV PINDITECH MAJU ABADI | `sinarjaya` | `sinarjaya@epr26.id` | `Epr2026!SinarJaya` |
| EPR-0054 | PT HETERO NIAGA GLOBAL | `hetero` | `heteroniaga@epr26.id` | `Epr2026!HeteroNiaga` |
| EPR-0267 | PT HARRISMA PRATAMAJAYA | `harrisma` | `harrisma@epr26.id` | `Epr2026!Harrisma` |
| EPR-0650 | CV RAJA PRINT SOLUTION | `rajaink` | `rajaprint@epr26.id` | `Epr2026!RajaPrint` |
| EPR-0733 | MICRO PRINTER | `micro` | `microprinter@epr26.id` | `Epr2026!MicroPrinter` |
| EPR-0881 | UD PIXEL | `pixel` | `pixel@epr26.id` | `Epr2026!PixelSemarang` |
| EPR-1002 | AL BUMI IT STORE | `albumi` | `albumi@epr26.id` | `Epr2026!AlBumi` |
| EPR-1005 | CV PRIBUMI JAYA KOMPUTAMA | `kodoescom` | `pribumijaya@epr26.id` | `Epr2026!PribumiJaya` |
| EPR-1197 | CV YESTOYA ABADI | `yestoya` | `yestoya@epr26.id` | `Epr2026!YestoyaAbadi` |
| EPR-1409 | PRIMA KOMPUTER | `primakom` | `primakomputer@epr26.id` | `Epr2026!PrimaKomputer` |
| EPR-1410 | CV SAFRINDO PERKASA | `safrindo` | `safrindo@epr26.id` | `Epr2026!Safrindo` |
| EPR-1413 | PT INFOKOM PUTRA KENCANA | `ipk` | `infokom@epr26.id` | `Epr2026!InfokomPutra` |
| EPR-1570 | CV MITRA PRATAMA KOMPUTINDO | `sedardigital` | `mitrapratama@epr26.id` | `Epr2026!MitraPratama` |
| EPR-1628 | CV ARTADINATA PERKASA ABADI | `artadinata` | `artadinata@epr26.id` | `Epr2026!Artadinata` |
| EPR-1768 | CV KARYA HIDUP MULYA | `khm` | `karyahidupmulya@epr26.id` | `Epr2026!KaryaHidupMulya` |
| EPR-1770 | CV PUTRA MANDIRI | `putramandiri` | `putramandiri@epr26.id` | `Epr2026!PutraMandiri` |
| EPR-1816 | CV SALAM JAYA KOMPUTINDO | `ungu` | `salamjaya@epr26.id` | `Epr2026!SalamJaya` |
| EPR-1845 | CV Bumi Raya Indonesia | `bumiraya` | `bumiraya@epr26.id` | `Epr2026!BumiRaya` |
| EPR-1906 | ELLITE COMPUTER WELERI | `ellite` | `ellite@epr26.id` | `Epr2026!ElliteWeleri` |
| EPR-1907 | PT HAIGA CITRA DIGITAL | `haiga` | `haiga@epr26.id` | `Epr2026!HaigaCitra` |
| EPR-1966 | CV MITRA SARANA TEKNIK | `afa` | `mitrasarana@epr26.id` | `Epr2026!MitraSarana` |
| EPR-1967 | CV DIAMOND INDO | `diamondindo` | `diamondindo@epr26.id` | `Epr2026!DiamondIndo` |
| EPR-1999 | CV NAFIRI | `nafiri` | `nafiri@epr26.id` | `Epr2026!NafiriSemarang` |
| EPR-2013 | CV JAYA MAKMUR STATIONARY | `jayamakmur` | `jayamakmur@epr26.id` | `Epr2026!JayaMakmur` |

### EPP — Partner Premier Aktif (4 Akun Lokal Jawa Tengah)
> Username cukup diinput namanya saja. Sistem otomatis mencoba domain `@epr26.id` lalu fallback ke `@epp26.id`. Pengguna juga bisa memasukkan email lengkap.

| Kode | Nama EPP | Kota | Username | Domain Internal | Password Default |
|---|---|---|---|---|---|
| EPP-0050 | COMPUTA | Yogyakarta | `computa` | `computa@epp26.id` | `Epp2026!Computa` |
| EPP-0055 | TOP DISTRIBUSI | Yogyakarta | `topdistribusi` | `topdistribusi@epp26.id` | `Epp2026!TopDistribusi` |
| EPP-0056 | COMPUMART | Semarang | `compumart` | `compumart@epp26.id` | `Epp2026!Compumart` |
| EPP-0245 | PT RAKA PERKASA TEKNOLOGI | Yogyakarta | `rakaperkasa` | `rakaperkasa@epp26.id` | `Epp2026!RakaPerkasa` |

> 💡 **Fitur Ganti Password**: Semua pengguna dapat mengganti password mandiri kapan saja melalui tombol **"Ganti Password"** di sudut kanan atas dashboard masing-masing.

---

## Setup Lengkap (Langkah Demi Langkah)

### Langkah 1 — Setup Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan pilih project Anda.
2. Buka **Authentication → Providers → Email** → **Nonaktifkan "Confirm email"**.
3. Buka **SQL Editor**, jalankan file berikut **secara berurutan**:

   | Urutan | File | Fungsi |
   |---|---|---|
   | 1 | `supabase_setup.sql` | Buat tabel EPR, RLS, trigger, insert 24 data toko EPR |
   | 2 | `seed_users.sql` | Buat 24 akun login EPR + perbaikan token NULL |
   | 3 | `setup_epp.sql` | Buat tabel EPP, RLS, insert 127 data EPP |
   | 4 | `seed_epp_local.sql` | Buat akun Admin + 4 akun EPP lokal Jawa Tengah |
   | 5 | `update_epr_credentials.sql` | Update username & password 24 toko EPR |
   | 6 | `import_pembelian_sales.sql` | Import data realisasi pembelian dari repo GitHub EPR (288 catatan bulanan) |

4. Jalankan query perbaikan token (jika muncul error `Database error querying schema`):
   ```sql
   update auth.users
   set
     confirmation_token = coalesce(confirmation_token, ''),
     recovery_token = coalesce(recovery_token, ''),
     email_change = coalesce(email_change, ''),
     email_change_token_new = coalesce(email_change_token_new, '');
   notify pgrst, 'reload schema';
   ```

5. Jalankan query untuk grant akses & tautkan akun ke data toko:
   ```sql
   grant usage on schema public to anon, authenticated;
   grant all on table public.epr_stores to anon, authenticated;
   grant all on table public.sales_records to anon, authenticated;
   grant all on table public.epp_stores to anon, authenticated;
   grant all on all sequences in schema public to anon, authenticated;

   update public.epr_stores s
   set user_id = u.id
   from auth.users u
   where lower(split_part(u.email, '@', 1)) = lower(s.username);

   notify pgrst, 'reload schema';
   ```

#### 💡 Troubleshooting Umum Supabase

- **`Database error querying schema`**: Disebabkan token NULL pada tabel `auth.users`. Jalankan query langkah 4 di atas untuk mengisi nilai default string kosong `''`.
- **`null value in column provider_id`**: Pada Supabase GoTrue versi terbaru, pastikan `provider_id` pada `auth.identities` diisi dengan email/string (sudah ditangani otomatis di file `seed_*.sql`).
- **"Akun ini belum terhubung dengan data toko"**: Dashboard memiliki mekanisme auto-link otomatis saat login pertama berdasarkan kecocokan username. Jika masih muncul, jalankan query langkah 5 di atas.

---

### Langkah 2 — Konfigurasi Environment

Salin `.env.example` menjadi `.env` lalu isi dengan kredensial dari **Supabase → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbg...
```

---

### Langkah 3 — Uji Coba Lokal

```powershell
npm install
npm run dev
```

Buka browser di **`http://localhost:5173`** dan login dengan salah satu akun di atas.

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
4. Tambahkan **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Klik **Save and Deploy** → website aktif di `https://epr-dashboard.pages.dev`

---

## Struktur File Proyek

```
epr-dashboard/
├── .env.example                  ← Template variabel environment
├── .gitignore                    ← .env dikecualikan dari git
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
│
├── supabase_setup.sql            ← [1] Setup tabel EPR + 24 data toko
├── seed_users.sql                ← [2] Buat 24 akun login EPR
├── setup_epp.sql                 ← [3] Setup tabel EPP + 127 data EPP
├── seed_epp_local.sql            ← [4] Akun Admin + 4 EPP lokal
├── register_users.py             ← Script Python alternatif (Service Role)
│
└── src/
    ├── main.tsx
    ├── App.tsx                   ← Routing peran: Admin / EPP / EPR
    ├── index.css
    ├── types.ts                  ← TypeScript interfaces
    ├── vite-env.d.ts
    ├── lib/
    │   └── supabase.ts           ← Inisialisasi Supabase client
    └── components/
        ├── Login.tsx             ← Halaman login (username + password)
        ├── Dashboard.tsx         ← Dashboard toko EPR
        ├── AdminDashboard.tsx    ← Dashboard Admin (tab EPR + EPP)
        ├── EppDashboard.tsx      ← Dashboard EPP (monitoring EPR)
        └── ChangePasswordModal.tsx ← Modal ganti password mandiri
```

---

## Keamanan (Row-Level Security)

Seluruh keamanan data dikunci langsung di tingkat database PostgreSQL Supabase:

- **Toko EPR**: Hanya bisa membaca & menulis data tokonya sendiri (`auth.uid() = user_id`)
- **EPP**: Bisa membaca performa seluruh toko EPR, **tidak** menampilkan identitas EPP pemasok lain
- **Admin**: Akses penuh ke semua tabel EPR dan EPP
- **Tanpa RLS bypass**: Sekalipun seseorang mengutak-atik kode browser, database PostgreSQL tetap menolak

---

## File Excel Referensi (Desktop)

| File | Keterangan |
|---|---|
| `EPR FY26.xlsx` | Sumber data master 24 toko EPR + target keuangan |
| `EPP FY26.xlsx` | Sumber data master 127 EPP nasional |
| `Akun_Toko_EPR_FY26.xlsx` | Rekap username & password 24 toko EPR |
| `Akun_EPP_FY26.xlsx` | Rekap username & password 127 EPP |
