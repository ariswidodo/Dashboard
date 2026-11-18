-- ================================================================
-- PATCH: Set epr_code & username ke raw_user_meta_data
-- Jalankan sekali di SQL Editor Supabase.
-- Diperlukan agar user_metadata.epr_code tersedia di JWT
-- sehingga dashboard dapat menampilkan nama toko yang tepat.
-- ================================================================

update auth.users u
set raw_user_meta_data = jsonb_build_object(
  'epr_code', s.epr_code,
  'username',  s.username
)
from public.epr_stores s
where s.user_id = u.id
  and u.email like '%@epr26.id';

-- Verifikasi hasil
select
  u.email,
  u.raw_user_meta_data->>'epr_code' as epr_code,
  u.raw_user_meta_data->>'username' as username
from auth.users u
where u.email like '%@epr26.id'
order by u.email;
