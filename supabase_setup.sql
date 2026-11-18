-- ==============================================================
-- SETUP DATABASE & KEAMANAN SUPABASE UNTUK PORTAL EPR FY26
-- ==============================================================

-- 1. Tabel Master Toko EPR FY26
create table if not exists public.epr_stores (
  id uuid primary key default gen_random_uuid(),
  epr_code text unique not null,
  epr_name text not null,
  city text,
  category text,
  username text unique not null,
  original_target numeric default 0,
  target_inc_tax numeric default 0,
  category_target numeric default 0,
  target_h1 numeric default 0,
  target_h2 numeric default 0,
  target_monthly numeric default 0,
  am text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabel Realisasi Penjualan Bulanan (Sales Tracking)
create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.epr_stores(id) on delete cascade not null,
  month integer not null check (month between 1 and 12),
  year integer not null default 2026,
  achievement_amount numeric default 0,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, month, year)
);

-- 3. Aktifkan Row-Level Security (RLS)
alter table public.epr_stores enable row level security;
alter table public.sales_records enable row level security;

-- 4. Kebijakan RLS (Hanya Toko yang Login yang Bisa Akses Data Miliknya)
drop policy if exists "Store view own profile" on public.epr_stores;
create policy "Store view own profile"
on public.epr_stores for select
using (auth.uid() = user_id);

drop policy if exists "Store update own profile" on public.epr_stores;
create policy "Store update own profile"
on public.epr_stores for update
using (auth.uid() = user_id);

drop policy if exists "Store sales access" on public.sales_records;
create policy "Store sales access"
on public.sales_records for all
using (store_id in (select id from public.epr_stores where user_id = auth.uid()))
with check (store_id in (select id from public.epr_stores where user_id = auth.uid()));

-- 5. Trigger Otomatis Menautkan user_id saat Akun Login Dibuat
create or replace function public.handle_new_epr_user()
returns trigger as $$
declare
  clean_username text;
begin
  clean_username := lower(split_part(new.email, '@', 1));
  update public.epr_stores
  set user_id = new.id
  where username = clean_username;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_epr_user();

-- 6. Masukkan 24 Master Data Toko dari Excel EPR FY26
insert into public.epr_stores (
  epr_code, epr_name, city, category, username,
  original_target, target_inc_tax, category_target, target_h1, target_h2, target_monthly, am
) values
  ('EPR-0038', 'SINAR JAYA COMPUTER / CV PINDITECH MAJU ABADI', 'KUDUS', 'MOON', 'sinarjaya', 2149300000, 2385723000, 1500000000, 1240575960, 1145147040, 195390909, 'ARIS'),
  ('EPR-0054', 'PT HETERO NIAGA GLOBAL', 'SEMARANG', 'SUN', 'heteroniaga', 19783100000, 21959241000, 6000000000, 11418805320, 10540435680, 1798463636, 'ARIS'),
  ('EPR-0267', 'PT HARRISMA PRATAMAJAYA', 'SEMARANG', 'SUN', 'harrisma', 18535000000, 20573850000, 6000000000, 10698402000, 9875448000, 1685000000, 'ARIS'),
  ('EPR-0650', 'CV RAJA PRINT SOLUTION', 'SEMARANG', 'STAR', 'rajaprint', 5232500000, 5808075000, 4000000000, 3020199000, 2787876000, 475681818, 'ARIS'),
  ('EPR-0733', 'MICRO PRINTER', 'PATI', 'CRESCENT', 'microprinter', 928000000, 1030080000, 200000000, 535641600, 494438400, 84363636, 'ARIS'),
  ('EPR-0881', 'UD PIXEL', 'SEMARANG', 'CRESCENT', 'pixel', 252800000, 280608000, 200000000, 145916160, 134691840, 22981818, 'ARIS'),
  ('EPR-1002', 'AL BUMI IT STORE', 'KENDAL', 'CRESCENT', 'albumi', 200000000, 222000000, 200000000, 115440000, 106560000, 18181818, 'ARIS'),
  ('EPR-1005', 'CV PRIBUMI JAYA KOMPUTAMA', 'PATI', 'MOON', 'pribumijaya', 2416500000, 2682315000, 1500000000, 1394803800, 1287511200, 219681818, 'ARIS'),
  ('EPR-1197', 'CV YESTOYA ABADI', 'SEMARANG', 'SUN', 'yestoya', 7121000000, 7904310000, 6000000000, 4110241200, 3794068800, 647363636, 'ARIS'),
  ('EPR-1409', 'PRIMA KOMPUTER', 'DEMAK', 'CRESCENT', 'primakomputer', 562800000, 624708000, 200000000, 324848160, 299859840, 51163636, 'ARIS'),
  ('EPR-1410', 'CV SAFRINDO PERKASA', 'JEPARA', 'CRESCENT', 'safrindo', 555800000, 616938000, 200000000, 320807760, 296130240, 50527273, 'ARIS'),
  ('EPR-1413', 'PT INFOKOM PUTRA KENCANA', 'SEMARANG', 'SUN', 'infokom', 11944600000, 13258506000, 6000000000, 6894423120, 6364082880, 1085872727, 'ARIS'),
  ('EPR-1570', 'CV MITRA PRATAMA KOMPUTINDO', 'BLORA', 'CRESCENT', 'mitrapratama', 200000000, 222000000, 200000000, 115440000, 106560000, 18181818, 'ARIS'),
  ('EPR-1628', 'CV ARTADINATA PERKASA ABADI', 'JEPARA', 'CRESCENT', 'artadinata', 985600000, 1094016000, 200000000, 568888320, 525127680, 89600000, 'ARIS'),
  ('EPR-1768', 'CV KARYA HIDUP MULYA', 'SEMARANG', 'SUN', 'karyahidupmulya', 13471900000, 14953809000, 6000000000, 7775980680, 7177828320, 1224718182, 'ARIS'),
  ('EPR-1770', 'CV PUTRA MANDIRI', 'PATI', 'CRESCENT', 'putramandiri', 200000000, 222000000, 200000000, 115440000, 106560000, 18181818, 'ARIS'),
  ('EPR-1816', 'CV SALAM JAYA KOMPUTINDO', 'KUDUS', 'EARTH', 'salamjaya', 3231700000, 3587187000, 2500000000, 1865337240, 1721849760, 293790909, 'ARIS'),
  ('EPR-1845', 'CV Bumi Raya Indonesia', 'SEMARANG', 'CRESCENT', 'bumiraya', 578600000, 642246000, 200000000, 333967920, 308278080, 52600000, 'ARIS'),
  ('EPR-1906', 'ELLITE COMPUTER WELERI', 'WELERI', 'CRESCENT', 'ellite', 493200000, 547452000, 200000000, 284675040, 262776960, 44836364, 'ARIS'),
  ('EPR-1907', 'PT HAIGA CITRA DIGITAL', 'SEMARANG', 'CRESCENT', 'haiga', 200000000, 222000000, 200000000, 115440000, 106560000, 18181818, 'ARIS'),
  ('EPR-1966', 'CV MITRA SARANA TEKNIK', 'AMBARAWA', 'CRESCENT', 'mitrasarana', 257900000, 286269000, 200000000, 148859880, 137409120, 23445455, 'ARIS'),
  ('EPR-1967', 'CV DIAMOND INDO', 'SEMARANG', 'CRESCENT', 'diamondindo', 864900000, 960039000, 200000000, 499220280, 460818720, 78627273, 'ARIS'),
  ('EPR-1999', 'CV NAFIRI', 'SEMARANG', 'CRESCENT', 'nafiri', 200000000, 222000000, 200000000, 115440000, 106560000, 18181818, 'ARIS'),
  ('EPR-2013', 'CV JAYA MAKMUR STATIONARY', 'SEMARANG', 'CRESCENT', 'jayamakmur', 200000000, 222000000, 200000000, 115440000, 106560000, 18181818, 'ARIS')
on conflict (epr_code) do update set
  epr_name = excluded.epr_name,
  city = excluded.city,
  category = excluded.category,
  username = excluded.username,
  original_target = excluded.original_target,
  target_inc_tax = excluded.target_inc_tax,
  category_target = excluded.category_target,
  target_h1 = excluded.target_h1,
  target_h2 = excluded.target_h2,
  target_monthly = excluded.target_monthly,
  am = excluded.am;
