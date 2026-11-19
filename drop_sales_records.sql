-- Hapus tabel database pembelian EPR yang sudah tidak digunakan.
-- Jalankan sekali di Supabase SQL Editor sebagai database owner.

drop table if exists public.sales_records;

notify pgrst, 'reload schema';
