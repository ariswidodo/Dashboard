-- ==============================================================
-- IMPORT REALISASI PEMBELIAN BULANAN DARI REPO GITHUB EPR FY26
-- Sumber: git@github.com:ariswidodo/EPR.git (data/epr_data.json)
-- 24 Toko Retail x 12 Bulan (Apr 2026 s/d Mar 2027)
-- ==============================================================

create extension if not exists pgcrypto;

do $$
declare
  v_store_id uuid;
begin
  -- EPR-0038: SINAR JAYA COMPUTER / CV PINDITECH MAJU ABADI
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-0038';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 158676000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 449668000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 335350000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 75818300.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 192476000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 116363000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 154961261.26, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-0054: PT HETERO NIAGA GLOBAL
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-0054';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 1702163940.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 1364887074.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 3300610120.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 1083265220.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 1170153150.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 2124245814.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 1617907657.66, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-0267: PT HARRISMA PRATAMAJAYA
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-0267';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 2002373950.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 1190247250.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 1760474000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 762712000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 935170000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 696800000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 883166666.66, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-0650: CV RAJA PRINT SOLUTION
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-0650';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 54974820.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 195071590.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 481340180.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 242954760.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 86600000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 615755000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 239391891.89, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-0733: MICRO PRINTER
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-0733';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 459971000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 34350000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 108791390.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 64687440.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 31710000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 19233000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 116370270.27, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-0881: UD PIXEL
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-0881';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 37353000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 39800000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 24500000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 11260000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 15735000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 49851000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 148518018.02, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1002: AL BUMI IT STORE
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1002';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 4740000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 26500000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 106675000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 18720000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 33265000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 15909909.91, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1005: CV PRIBUMI JAYA KOMPUTAMA
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1005';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 131152000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 423210010.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 29200000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 478921814.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 100610000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 436367895.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 105779279.28, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1197: CV YESTOYA ABADI
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1197';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 469011730.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 430393190.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 246385001.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 386185000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 293926500.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 253886950.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 420854051.35, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1409: PRIMA KOMPUTER
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1409';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 91276000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 40686000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 47883000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 13368000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 28228000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 69605000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 86890090.09, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1410: CV SAFRINDO PERKASA
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1410';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 16397000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 47137000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 8400000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 33710000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 44786000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 60902000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 103432432.44, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1413: PT INFOKOM PUTRA KENCANA
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1413';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 870900001.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 785683000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 1051290000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 1052214160.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 1386385000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 2460466000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 727646846.84, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1570: CV MITRA PRATAMA KOMPUTINDO
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1570';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 9540000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 4770000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 10080000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 20919985.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 15707000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 30034000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 42601801.8, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1628: CV ARTADINATA PERKASA ABADI
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1628';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 106055000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 67345000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 71287000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 59880000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 103133000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 103320000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1768: CV KARYA HIDUP MULYA
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1768';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 214231000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 554018000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 275381000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 1358783590.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 248886720.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 1021506392.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 1321912252.25, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1770: CV PUTRA MANDIRI
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1770';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 26754000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 11077000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 11570000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 5880000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 16788288.29, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1816: CV SALAM JAYA KOMPUTINDO
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1816';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 394595800.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 308117800.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 336167000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 325097840.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 309462690.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 354019000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 282085585.59, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1845: CV Bumi Raya Indonesia
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1845';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 75596000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 24320400.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 47038000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 88828000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 49819000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 21758400.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 33281981.98, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1906: ELLITE COMPUTER WELERI
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1906';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 57890000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 104745000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 40069500.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 6322000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 79829000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1907: PT HAIGA CITRA DIGITAL
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1907';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 45678599.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 31582000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 52340000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 28864999.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 18108000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 55894594.59, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1966: CV MITRA SARANA TEKNIK
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1966';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 46036000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 115661500.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 27432000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 40520000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 106928000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 94994000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 132368472.98, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1967: CV DIAMOND INDO
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1967';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 70743800.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 77790800.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 32311000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 58775852.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 104333000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 82035000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 41268468.47, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-1999: CV NAFIRI
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-1999';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 48315000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 49145000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 40325000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 85230000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 128441441.44, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

  -- EPR-2013: CV JAYA MAKMUR STATIONARY
  select id into v_store_id from public.epr_stores where epr_code = 'EPR-2013';
  if v_store_id is not null then
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 1, 2026, 113550000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 2, 2026, 57575000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 3, 2026, 11245000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 4, 2026, 41471000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 5, 2026, 27469000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 6, 2026, 49240000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 7, 2026, 90600000.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 8, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 9, 2026, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 10, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 11, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
    insert into public.sales_records (store_id, month, year, achievement_amount, updated_at)
    values (v_store_id, 12, 2027, 0.0, now())
    on conflict (store_id, month, year) do update set
      achievement_amount = excluded.achievement_amount,
      updated_at = now();
  end if;

end $$;

notify pgrst, 'reload schema';

-- Verifikasi total akumulasi pembelian per toko yang berhasil di-import
select
  s.epr_code,
  s.epr_name,
  s.city,
  s.category,
  count(r.id) as total_bulan,
  coalesce(sum(r.achievement_amount), 0) as total_realisasi,
  s.target_inc_tax,
  round((coalesce(sum(r.achievement_amount), 0) / nullif(s.target_inc_tax, 0)) * 100, 2) as persen_capaian
from public.epr_stores s
left join public.sales_records r on s.id = r.store_id
group by s.id, s.epr_code, s.epr_name, s.city, s.category, s.target_inc_tax
order by s.epr_code;