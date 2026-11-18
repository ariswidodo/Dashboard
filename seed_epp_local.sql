-- ==============================================================
-- Buat 4 Akun EPP Lokal Jawa Tengah
-- EPP-0050 COMPUTA, EPP-0055 TOP DISTRIBUSI,
-- EPP-0056 COMPUMART, EPP-0245 PT RAKA PERKASA TEKNOLOGI
-- Compatible dengan Supabase GoTrue versi baru (provider_id = text)
-- ==============================================================

create extension if not exists pgcrypto;

-- 1. Update nama EPP-0245 dari PT PARON INDONESIA -> PT RAKA PERKASA TEKNOLOGI
update public.epp_stores
set 
  epp_name = 'PT RAKA PERKASA TEKNOLOGI',
  company_name = 'PT RAKA PERKASA TEKNOLOGI',
  username = 'rakaperkasa'
where epp_code = 'EPP-0245';

-- 2. Buat 4 Akun Login EPP
do $$
declare
  acc record;
  new_uid uuid;
begin
  for acc in (
    select * from (values
      ('computa@epp26.id',       'Epp2026!Computa',       'computa',       'EPP-0050'),
      ('topdistribusi@epp26.id', 'Epp2026!TopDistribusi', 'topdistribusi', 'EPP-0055'),
      ('compumart@epp26.id',     'Epp2026!Compumart',     'compumart',     'EPP-0056'),
      ('rakaperkasa@epp26.id',   'Epp2026!RakaPerkasa',   'rakaperkasa',   'EPP-0245')
    ) as t(email, raw_password, uname, epp_code)
  ) loop
    if not exists (select 1 from auth.users where email = acc.email) then
      new_uid := gen_random_uuid();

      -- Insert ke auth.users
      insert into auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, recovery_token,
        email_change, email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000',
        new_uid, 'authenticated', 'authenticated',
        acc.email,
        crypt(acc.raw_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('role', 'epp', 'username', acc.uname, 'epp_code', acc.epp_code),
        now(), now(), '', '', '', ''
      );

      -- Insert ke auth.identities (id = uuid, provider_id = email text)
      insert into auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) values (
        new_uid,
        new_uid,
        jsonb_build_object('sub', new_uid::text, 'email', acc.email),
        'email',
        acc.email,
        now(), now(), now()
      );

      -- Tautkan ke epp_stores
      update public.epp_stores
      set user_id = new_uid
      where username = acc.uname;

      raise notice 'Created EPP: % (%)', acc.email, acc.epp_code;
    else
      raise notice 'Already exists: %', acc.email;
    end if;
  end loop;
end $$;

-- 3. Buat akun Admin (jika belum ada)
do $$
declare
  admin_uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email = 'admin@epr26.id') then
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token,
      email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_uid, 'authenticated', 'authenticated',
      'admin@epr26.id',
      crypt('AdminEpr2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"admin","username":"admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      admin_uid,
      admin_uid,
      jsonb_build_object('sub', admin_uid::text, 'email', 'admin@epr26.id'),
      'email',
      'admin@epr26.id',
      now(), now(), now()
    );

    raise notice 'Admin account created: admin@epr26.id';
  else
    raise notice 'Admin already exists';
  end if;
end $$;

-- 4. Verifikasi
select epp_code, epp_name, city, username, 
       case when user_id is not null then '✅ Akun Aktif' else '❌ Belum Login' end as status
from public.epp_stores
where epp_code in ('EPP-0050','EPP-0055','EPP-0056','EPP-0245')
order by epp_code;
