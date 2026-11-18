-- ==============================================================
-- INSERT 24 USERS LANGSUNG KE AUTH SUPABASE (TANPA EMAIL RATE LIMIT)
-- Jalankan skrip ini di SQL Editor Supabase
-- ==============================================================

create extension if not exists pgcrypto;

do $$
declare
  acc record;
  new_uid uuid;
begin
  for acc in (
    select * from (values
      ('EPR-0038', 'sinarjaya', 'sinarjaya@epr26.id', 'Epr2026!SinarJaya'),
      ('EPR-0054', 'hetero', 'heteroniaga@epr26.id', 'Epr2026!HeteroNiaga'),
      ('EPR-0267', 'harrisma', 'harrisma@epr26.id', 'Epr2026!Harrisma'),
      ('EPR-0650', 'rajaink', 'rajaprint@epr26.id', 'Epr2026!RajaPrint'),
      ('EPR-0733', 'micro', 'microprinter@epr26.id', 'Epr2026!MicroPrinter'),
      ('EPR-0881', 'pixel', 'pixel@epr26.id', 'Epr2026!PixelSemarang'),
      ('EPR-1002', 'albumi', 'albumi@epr26.id', 'Epr2026!AlBumi'),
      ('EPR-1005', 'kodoescom', 'pribumijaya@epr26.id', 'Epr2026!PribumiJaya'),
      ('EPR-1197', 'yestoya', 'yestoya@epr26.id', 'Epr2026!YestoyaAbadi'),
      ('EPR-1409', 'primakom', 'primakomputer@epr26.id', 'Epr2026!PrimaKomputer'),
      ('EPR-1410', 'safrindo', 'safrindo@epr26.id', 'Epr2026!Safrindo'),
      ('EPR-1413', 'ipk', 'infokom@epr26.id', 'Epr2026!InfokomPutra'),
      ('EPR-1570', 'sedardigital', 'mitrapratama@epr26.id', 'Epr2026!MitraPratama'),
      ('EPR-1628', 'artadinata', 'artadinata@epr26.id', 'Epr2026!Artadinata'),
      ('EPR-1768', 'khm', 'karyahidupmulya@epr26.id', 'Epr2026!KaryaHidupMulya'),
      ('EPR-1770', 'putramandiri', 'putramandiri@epr26.id', 'Epr2026!PutraMandiri'),
      ('EPR-1816', 'ungu', 'salamjaya@epr26.id', 'Epr2026!SalamJaya'),
      ('EPR-1845', 'bumiraya', 'bumiraya@epr26.id', 'Epr2026!BumiRaya'),
      ('EPR-1906', 'ellite', 'ellite@epr26.id', 'Epr2026!ElliteWeleri'),
      ('EPR-1907', 'haiga', 'haiga@epr26.id', 'Epr2026!HaigaCitra'),
      ('EPR-1966', 'afa', 'mitrasarana@epr26.id', 'Epr2026!MitraSarana'),
      ('EPR-1967', 'diamondindo', 'diamondindo@epr26.id', 'Epr2026!DiamondIndo'),
      ('EPR-1999', 'nafiri', 'nafiri@epr26.id', 'Epr2026!NafiriSemarang'),
      ('EPR-2013', 'jayamakmur', 'jayamakmur@epr26.id', 'Epr2026!JayaMakmur')
    ) as t(code, username, email, raw_password)
  ) loop
    -- Lewati jika email sudah pernah terdaftar
    if not exists (select 1 from auth.users where email = acc.email) then
      new_uid := gen_random_uuid();

      -- 1. Insert ke auth.users
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change,
        email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000',
        new_uid,
        'authenticated',
        'authenticated',
        acc.email,
        crypt(acc.raw_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('username', acc.username, 'epr_code', acc.code),
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      -- 2. Insert ke auth.identities (id = text = email, bukan uuid)
      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) values (
        acc.email,
        new_uid,
        jsonb_build_object('sub', new_uid::text, 'email', acc.email),
        'email',
        acc.email,
        now(),
        now(),
        now()
      );

      -- 3. Tautkan langsung ke tabel epr_stores
      update public.epr_stores
      set user_id = new_uid
      where username = acc.username;

    else
      -- Jika user sudah ada, pastikan tertaut ke epr_stores
      update public.epr_stores
      set user_id = (select id from auth.users where email = acc.email limit 1)
      where username = acc.username and user_id is null;
    end if;
  end loop;
end $$;
