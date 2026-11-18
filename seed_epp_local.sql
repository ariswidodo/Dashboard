-- ==============================================================
-- Buat 4 Akun EPP Lokal Jawa Tengah
-- EPP-0050 COMPUTA, EPP-0055 TOP DISTRIBUSI,
-- EPP-0056 COMPUMART, EPP-0245 PT RAKA PERKASA TEKNOLOGI
-- ==============================================================

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
  uid1 uuid := gen_random_uuid();
  uid2 uuid := gen_random_uuid();
  uid3 uuid := gen_random_uuid();
  uid4 uuid := gen_random_uuid();

  accounts text[][] := ARRAY[
    ARRAY['computa@epp26.id',      'Epp2026!Computa',      'computa',       'EPP-0050'],
    ARRAY['topdistribusi@epp26.id','Epp2026!TopDistribusi','topdistribusi', 'EPP-0055'],
    ARRAY['compumart@epp26.id',    'Epp2026!Compumart',    'compumart',     'EPP-0056'],
    ARRAY['rakaperkasa@epp26.id',  'Epp2026!RakaPerkasa',  'rakaperkasa',   'EPP-0245']
  ];

  uids uuid[] := ARRAY[uid1, uid2, uid3, uid4];
  acc text[];
  new_uid uuid;
begin
  for i in 1..array_length(accounts, 1) loop
    acc := accounts[i];
    new_uid := uids[i];

    if not exists (select 1 from auth.users where email = acc[1]) then
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
        acc[1],
        crypt(acc[2], gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('role', 'epp', 'username', acc[3], 'epp_code', acc[4]),
        now(), now(), '', '', '', ''
      );

      -- Insert ke auth.identities
      insert into auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) values (
        new_uid, new_uid,
        jsonb_build_object('sub', new_uid::text, 'email', acc[1]),
        'email', acc[1], now(), now(), now()
      );

      -- Tautkan ke epp_stores
      update public.epp_stores
      set user_id = new_uid
      where username = acc[3];

      raise notice 'Created: % (%)', acc[1], acc[4];
    else
      raise notice 'Already exists: %', acc[1];
    end if;
  end loop;
end $$;

-- 3. Verifikasi
select epp_code, epp_name, city, username, 
       case when user_id is not null then 'Akun Aktif' else 'Belum Login' end as status
from public.epp_stores
where epp_code in ('EPP-0050','EPP-0055','EPP-0056','EPP-0245')
order by epp_code;
