-- Penyimpanan bersama hasil upload Admin untuk dashboard EPP/EPR.
-- Jalankan sekali di Supabase SQL Editor sebagai database owner.

create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.epr_stores(id) on delete cascade not null,
  month integer not null check (month between 1 and 12),
  year integer not null default 2026,
  achievement_amount numeric default 0,
  category_totals jsonb not null default '{}'::jsonb,
  tx_count integer not null default 0,
  qty_total numeric not null default 0,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, month, year)
);

alter table public.sales_records add column if not exists category_totals jsonb not null default '{}'::jsonb;
alter table public.sales_records add column if not exists tx_count integer not null default 0;
alter table public.sales_records add column if not exists qty_total numeric not null default 0;

create table if not exists public.epp_contributions (
  epp_code text not null,
  epp_name text not null,
  epp_city text,
  epr_code text not null,
  epr_name text not null,
  epr_city text,
  total numeric not null default 0,
  tx_count integer not null default 0,
  categories jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (epp_code, epr_code)
);

create table if not exists public.program_transaction_items (
  item_key text primary key,
  epr_code text not null,
  program_name text not null,
  invoice_date date not null,
  material_code text,
  description text,
  category text,
  epp_code text,
  epp_name text,
  qty numeric not null default 0,
  net_amount numeric not null default 0,
  counted boolean not null default true,
  upload_status text not null default 'Terhitung',
  reject_reason text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.program_transaction_items add column if not exists counted boolean not null default true;
alter table public.program_transaction_items add column if not exists upload_status text not null default 'Terhitung';
alter table public.program_transaction_items add column if not exists reject_reason text;

-- RLS hanya menyaring baris; role API tetap membutuhkan privilege tabel.
-- Dashboard menggunakan role authenticated setelah login, sedangkan anon
-- tetap diberi akses dasar agar pembacaan tidak gagal sebelum sesi aktif.
grant select, insert, update, delete on table public.sales_records to anon, authenticated;
grant select, insert, update, delete on table public.epp_contributions to anon, authenticated;
grant select, insert, update, delete on table public.program_transaction_items to anon, authenticated;

alter table public.sales_records enable row level security;
alter table public.epp_contributions enable row level security;
alter table public.program_transaction_items enable row level security;

drop policy if exists "Shared admin sales full access" on public.sales_records;
create policy "Shared admin sales full access"
on public.sales_records for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Shared EPR sales read own" on public.sales_records;
create policy "Shared EPR sales read own"
on public.sales_records for select
using (store_id in (
  select id from public.epr_stores
  where user_id = auth.uid()
     or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
));

drop policy if exists "Shared EPP sales read all" on public.sales_records;
create policy "Shared EPP sales read all"
on public.sales_records for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'epp');

drop policy if exists "Shared admin EPP contribution full access" on public.epp_contributions;
create policy "Shared admin EPP contribution full access"
on public.epp_contributions for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Shared EPP contribution read" on public.epp_contributions;
create policy "Shared EPP contribution read"
on public.epp_contributions for select
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'epp'
  or epr_code in (
    select epr_code from public.epr_stores
    where user_id = auth.uid()
       or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
  )
);

drop policy if exists "Shared admin program items full access" on public.program_transaction_items;
create policy "Shared admin program items full access"
on public.program_transaction_items for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Shared program items read" on public.program_transaction_items;
create policy "Shared program items read"
on public.program_transaction_items for select
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'epp'
  or epr_code in (
    select epr_code from public.epr_stores
    where user_id = auth.uid()
       or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
  )
);

notify pgrst, 'reload schema';
