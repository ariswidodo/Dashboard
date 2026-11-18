-- ==============================================================
-- UPDATE USERNAME & PASSWORD 24 TOKO EPR FY26
-- Jalankan skrip ini di SQL Editor Supabase untuk memperbarui:
-- 1. Username di tabel public.epr_stores
-- 2. Password & data akun di auth.users & auth.identities
-- 3. Tautan user_id antara epr_stores dan auth.users
-- ==============================================================

create extension if not exists pgcrypto;

do $$
declare
  acc record;
  target_uid uuid;
begin
  for acc in (
    select * from (values
      ('EPR-0038', 'sinarjaya',   'sinarjaya@epr26.id',     'Epr2026!SinarJaya'),
      ('EPR-0054', 'hetero',      'heteroniaga@epr26.id',   'Epr2026!HeteroNiaga'),
      ('EPR-0267', 'harrisma',    'harrisma@epr26.id',      'Epr2026!Harrisma'),
      ('EPR-0650', 'rajaink',     'rajaprint@epr26.id',     'Epr2026!RajaPrint'),
      ('EPR-0733', 'micro',       'microprinter@epr26.id',  'Epr2026!MicroPrinter'),
      ('EPR-0881', 'pixel',       'pixel@epr26.id',         'Epr2026!PixelSemarang'),
      ('EPR-1002', 'albumi',      'albumi@epr26.id',        'Epr2026!AlBumi'),
      ('EPR-1005', 'kodoescom',   'pribumijaya@epr26.id',   'Epr2026!PribumiJaya'),
      ('EPR-1197', 'yestoya',     'yestoya@epr26.id',       'Epr2026!YestoyaAbadi'),
      ('EPR-1409', 'primakom',    'primakomputer@epr26.id', 'Epr2026!PrimaKomputer'),
      ('EPR-1410', 'safrindo',    'safrindo@epr26.id',      'Epr2026!Safrindo'),
      ('EPR-1413', 'ipk',         'infokom@epr26.id',       'Epr2026!InfokomPutra'),
      ('EPR-1570', 'sedardigital','mitrapratama@epr26.id',  'Epr2026!MitraPratama'),
      ('EPR-1628', 'artadinata',  'artadinata@epr26.id',    'Epr2026!Artadinata'),
      ('EPR-1768', 'khm',         'karyahidupmulya@epr26.id','Epr2026!KaryaHidupMulya'),
      ('EPR-1770', 'putramandiri','putramandiri@epr26.id',  'Epr2026!PutraMandiri'),
      ('EPR-1816', 'ungu',        'salamjaya@epr26.id',     'Epr2026!SalamJaya'),
      ('EPR-1845', 'bumiraya',    'bumiraya@epr26.id',      'Epr2026!BumiRaya'),
      ('EPR-1906', 'ellite',      'ellite@epr26.id',        'Epr2026!ElliteWeleri'),
      ('EPR-1907', 'haiga',       'haiga@epr26.id',         'Epr2026!HaigaCitra'),
      ('EPR-1966', 'afa',         'mitrasarana@epr26.id',   'Epr2026!MitraSarana'),
      ('EPR-1967', 'diamondindo', 'diamondindo@epr26.id',   'Epr2026!DiamondIndo'),
      ('EPR-1999', 'nafiri',      'nafiri@epr26.id',        'Epr2026!NafiriSemarang'),
      ('EPR-2013', 'jayamakmur',  'jayamakmur@epr26.id',    'Epr2026!JayaMakmur')
    ) as t(code, username, email, raw_password)
  ) loop
    -- 1. Perbarui username di tabel public.epr_stores
    update public.epr_stores
    set username = acc.username
    where epr_code = acc.code;

    -- 2. Cek apakah user sudah ada di auth.users
    select id into target_uid
    from auth.users
    where email = acc.email
    limit 1;

    if target_uid is not null then
      -- Jika user sudah ada, perbarui password dan metadata
      update auth.users
      set
        encrypted_password = crypt(acc.raw_password, gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object('username', acc.username, 'epr_code', acc.code),
        confirmation_token = coalesce(confirmation_token, ''),
        recovery_token = coalesce(recovery_token, ''),
        email_change = coalesce(email_change, ''),
        email_change_token_new = coalesce(email_change_token_new, ''),
        updated_at = now()
      where id = target_uid;

      -- Pastikan identities sinkron
      if not exists (select 1 from auth.identities where user_id = target_uid and provider = 'email') then
        insert into auth.identities (
          id, user_id, identity_data, provider, provider_id,
          last_sign_in_at, created_at, updated_at
        ) values (
          target_uid, target_uid,
          jsonb_build_object('sub', target_uid::text, 'email', acc.email),
          'email', acc.email,
          now(), now(), now()
        );
      end if;

      raise notice 'Updated credentials for: % (%)', acc.email, acc.code;
    else
      -- Jika user belum ada, buat baru
      target_uid := gen_random_uuid();

      insert into auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, recovery_token,
        email_change, email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000',
        target_uid, 'authenticated', 'authenticated',
        acc.email,
        crypt(acc.raw_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('username', acc.username, 'epr_code', acc.code),
        now(), now(), '', '', '', ''
      );

      insert into auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) values (
        target_uid, target_uid,
        jsonb_build_object('sub', target_uid::text, 'email', acc.email),
        'email', acc.email,
        now(), now(), now()
      );

      raise notice 'Created new user: % (%)', acc.email, acc.code;
    end if;

    -- 3. Tautkan user_id ke epr_stores
    update public.epr_stores
    set user_id = target_uid
    where epr_code = acc.code;

  end loop;
end $$;

-- 4. Reload PostgREST schema cache
notify pgrst, 'reload schema';

-- 5. Tabel Verifikasi Hasil Update
select 
  s.epr_code,
  s.epr_name,
  s.username,
  u.email,
  case when s.user_id is not null then '✅ Terhubung' else '❌ Belum Terhubung' end as status_akun
from public.epr_stores s
left join auth.users u on s.user_id = u.id
order by s.epr_code;
