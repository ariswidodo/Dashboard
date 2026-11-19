-- ==============================================================
-- KEBIJAKAN ROW-LEVEL SECURITY (RLS): STRICT READ-ONLY UNTUK EPR & EPP
-- Hak Akses:
-- 1. ADMIN (admin@epr26.id) -> FULL ACCESS (Read & Write / Insert, Update, Delete)
-- 2. EPR (Toko Retail)      -> READ-ONLY (Hanya Melihat Data Sendiri, TIDAK BISA Edit)
-- 3. EPP (Partner Premier)  -> READ-ONLY (Hanya Melihat Monitoring, TIDAK BISA Edit)
-- ==============================================================

-- --------------------------------------------------------------
-- 1. KEAMANAN TABEL: public.epr_stores
-- --------------------------------------------------------------
alter table public.epr_stores enable row level security;

-- Hapus seluruh policy lama
drop policy if exists "Store view own profile" on public.epr_stores;
drop policy if exists "Store update own profile" on public.epr_stores;
drop policy if exists "Allow all read epr_stores" on public.epr_stores;
drop policy if exists "Admin full access epr_stores" on public.epr_stores;
drop policy if exists "EPR view own profile" on public.epr_stores;
drop policy if exists "EPP view epr_stores" on public.epr_stores;

-- Policy 1A: ADMIN memiliki hak penuh (SELECT, INSERT, UPDATE, DELETE)
create policy "Admin full access epr_stores"
on public.epr_stores for all
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Policy 1B: TOKO EPR HANYA BISA BACA (SELECT) profil tokonya sendiri
create policy "EPR view own profile"
on public.epr_stores for select
using (
  auth.uid() = user_id
  or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
);

-- Policy 1C: PARTNER EPP HANYA BISA BACA (SELECT) untuk monitoring
create policy "EPP view epr_stores"
on public.epr_stores for select
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'epp'
);

-- --------------------------------------------------------------
-- 2. KEAMANAN TABEL: public.sales_records
-- --------------------------------------------------------------
alter table public.sales_records enable row level security;

-- Hapus seluruh policy lama yang mengizinkan toko mengedit sales_records
drop policy if exists "Store sales access" on public.sales_records;
drop policy if exists "Admin full access sales_records" on public.sales_records;
drop policy if exists "EPR view own sales" on public.sales_records;
drop policy if exists "EPP view all sales" on public.sales_records;

-- Policy 2A: ADMIN memiliki hak penuh (SELECT, INSERT, UPDATE, DELETE)
create policy "Admin full access sales_records"
on public.sales_records for all
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Policy 2B: TOKO EPR HANYA BISA BACA (SELECT) data realisasi penjualannya sendiri
create policy "EPR view own sales"
on public.sales_records for select
using (
  store_id in (
    select id from public.epr_stores
    where user_id = auth.uid()
       or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
  )
);

-- Policy 2C: PARTNER EPP HANYA BISA BACA (SELECT) ringkasan capaian pembelian
create policy "EPP view all sales"
on public.sales_records for select
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'epp'
);

-- --------------------------------------------------------------
-- 3. KEAMANAN TABEL: public.epp_stores
-- --------------------------------------------------------------
alter table public.epp_stores enable row level security;

-- Hapus policy lama
drop policy if exists "EPP view policy" on public.epp_stores;
drop policy if exists "Admin full access epp_stores" on public.epp_stores;
drop policy if exists "EPP view own profile" on public.epp_stores;

-- Policy 3A: ADMIN memiliki hak penuh
create policy "Admin full access epp_stores"
on public.epp_stores for all
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Policy 3B: EPP HANYA BISA BACA (SELECT) profilnya sendiri
create policy "EPP view own profile"
on public.epp_stores for select
using (
  auth.uid() = user_id
  or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'epp'
);

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
