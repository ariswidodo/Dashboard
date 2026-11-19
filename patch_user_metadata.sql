-- ================================================================
-- PATCH: Set role, epr_code & username ke raw_app_meta_data
-- Jalankan sekali di SQL Editor Supabase.
-- Diperlukan agar app_metadata.epr_code tersedia di JWT
-- sehingga dashboard dapat menampilkan nama toko yang tepat.
-- ================================================================

update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
  'role', 'epr',
  'epr_code', s.epr_code,
  'username',  s.username
)
from public.epr_stores s
where s.user_id = u.id
  and u.email like '%@epr26.id';

-- Verifikasi hasil
select
  u.email,
  u.raw_app_meta_data->>'epr_code' as epr_code,
  u.raw_app_meta_data->>'username' as username,
  u.raw_app_meta_data->>'role' as role
from auth.users u
where u.email like '%@epr26.id'
order by u.email;
