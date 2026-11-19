-- ============================================================================
-- SECURITY MIGRATION: gunakan app_metadata untuk authorization RLS
-- Jalankan sekali sebagai database owner di Supabase SQL Editor.
-- Setelah selesai, logout/login ulang seluruh akun agar JWT diperbarui.
-- ============================================================================

-- 1. Salin role yang selama ini berada di user_metadata ke app_metadata.
--    app_metadata tidak dapat diubah oleh user melalui Auth API.
update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || case
       when lower(u.email) = 'admin@epr26.id' then
         jsonb_build_object('role', 'admin', 'username', 'admin')
       when lower(u.email) like '%@epp26.id' then
         jsonb_build_object('role', 'epp', 'username', split_part(lower(u.email), '@', 1))
       else
         jsonb_build_object('role', 'epr', 'username', split_part(lower(u.email), '@', 1))
     end
where lower(u.email) = 'admin@epr26.id'
   or lower(u.email) like '%@epp26.id'
   or lower(u.email) like '%@epr26.id';

-- Tambahkan identitas EPR yang dipakai dashboard untuk pencocokan tampilan.
update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'epr', 'epr_code', s.epr_code, 'username', s.username)
from public.epr_stores s
where s.user_id = u.id
  and lower(u.email) like '%@epr26.id';

-- 2. Hapus policy lama yang dapat membaca user_metadata.
drop policy if exists "Store view own profile" on public.epr_stores;
drop policy if exists "Store update own profile" on public.epr_stores;
drop policy if exists "Allow all read epr_stores" on public.epr_stores;
drop policy if exists "Admin full access epr_stores" on public.epr_stores;
drop policy if exists "EPR view own profile" on public.epr_stores;
drop policy if exists "EPP view epr_stores" on public.epr_stores;

drop policy if exists "Store sales access" on public.sales_records;
drop policy if exists "Admin full access sales_records" on public.sales_records;
drop policy if exists "EPR view own sales" on public.sales_records;
drop policy if exists "EPP view all sales" on public.sales_records;

drop policy if exists "EPP view policy" on public.epp_stores;
drop policy if exists "Admin full access epp_stores" on public.epp_stores;
drop policy if exists "EPP view own profile" on public.epp_stores;

drop policy if exists "Shared admin sales full access" on public.sales_records;
drop policy if exists "Shared EPR sales read own" on public.sales_records;
drop policy if exists "Shared EPP sales read all" on public.sales_records;
drop policy if exists "Shared admin EPP contribution full access" on public.epp_contributions;
drop policy if exists "Shared EPP contribution read" on public.epp_contributions;
drop policy if exists "Shared admin program items full access" on public.program_transaction_items;
drop policy if exists "Shared program items read" on public.program_transaction_items;

-- 3. Recreate policies without user_metadata.
create policy "Admin full access epr_stores"
on public.epr_stores for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "EPR view own profile"
on public.epr_stores for select
using (
  auth.uid() = user_id
  or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
);

create policy "EPP view epr_stores"
on public.epr_stores for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'epp');

create policy "Admin full access sales_records"
on public.sales_records for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "EPR view own sales"
on public.sales_records for select
using (store_id in (
  select id from public.epr_stores
  where user_id = auth.uid()
     or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
));

create policy "EPP view all sales"
on public.sales_records for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'epp');

create policy "Admin full access epp_stores"
on public.epp_stores for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "EPP view own profile"
on public.epp_stores for select
using (
  auth.uid() = user_id
  or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'epp'
);

create policy "Shared admin EPP contribution full access"
on public.epp_contributions for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

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

create policy "Shared admin program items full access"
on public.program_transaction_items for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

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

create policy "Shared admin sales full access"
on public.sales_records for all
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Shared EPR sales read own"
on public.sales_records for select
using (store_id in (
  select id from public.epr_stores
  where user_id = auth.uid()
     or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
));

create policy "Shared EPP sales read all"
on public.sales_records for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'epp');

notify pgrst, 'reload schema';
