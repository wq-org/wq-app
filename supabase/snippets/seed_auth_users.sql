-- Seed/reseed auth.users
-- Safe to re-run by user id (UPSERT on auth.users.id).
-- IMPORTANT: If the same email exists with a different id, insert will fail due to unique email.
-- Run as postgres/service role in Supabase SQL Editor.

begin;

create temp table seed_auth_users (
  instance_id uuid,
  id uuid not null,
  aud text,
  role text,
  email text not null,
  encrypted_password text,
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token text,
  confirmation_sent_at timestamptz,
  recovery_token text,
  recovery_sent_at timestamptz,
  email_change_token_new text,
  email_change text,
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz,
  updated_at timestamptz,
  phone text,
  phone_confirmed_at timestamptz,
  phone_change text,
  phone_change_token text,
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz,
  email_change_token_current text,
  email_change_confirm_status integer,
  banned_until timestamptz,
  reauthentication_token text,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean,
  deleted_at timestamptz,
  is_anonymous boolean
) on commit drop;

-- TODO: replace these sample rows with your old auth users.
-- If encrypted_password is NULL, a temporary password hash is generated from 'ChangeMe123!'.
insert into seed_auth_users (
  id,
  email,
  aud,
  role,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user,
  is_anonymous,
  created_at,
  updated_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'student1@example.com',
    'authenticated',
    'authenticated',
    null,
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"student","display_name":"Student One"}'::jsonb,
    false,
    false,
    false,
    now(),
    now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'teacher1@example.com',
    'authenticated',
    'authenticated',
    null,
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"teacher","display_name":"Teacher One"}'::jsonb,
    false,
    false,
    false,
    now(),
    now()
  );

with default_instance as (
  select coalesce((select i.id from auth.instances i limit 1), '00000000-0000-0000-0000-000000000000'::uuid) as id
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous
)
select
  coalesce(s.instance_id, d.id),
  s.id,
  coalesce(s.aud, 'authenticated'),
  coalesce(s.role, 'authenticated'),
  s.email,
  coalesce(s.encrypted_password, crypt('ChangeMe123!', gen_salt('bf'))),
  coalesce(s.email_confirmed_at, now()),
  s.invited_at,
  coalesce(s.confirmation_token, ''),
  s.confirmation_sent_at,
  coalesce(s.recovery_token, ''),
  s.recovery_sent_at,
  coalesce(s.email_change_token_new, ''),
  coalesce(s.email_change, ''),
  s.email_change_sent_at,
  s.last_sign_in_at,
  coalesce(s.raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb),
  coalesce(s.raw_user_meta_data, '{}'::jsonb),
  coalesce(s.is_super_admin, false),
  coalesce(s.created_at, now()),
  coalesce(s.updated_at, now()),
  s.phone,
  s.phone_confirmed_at,
  coalesce(s.phone_change, ''),
  coalesce(s.phone_change_token, ''),
  s.phone_change_sent_at,
  coalesce(s.confirmed_at, s.email_confirmed_at, now()),
  coalesce(s.email_change_token_current, ''),
  coalesce(s.email_change_confirm_status, 0),
  s.banned_until,
  coalesce(s.reauthentication_token, ''),
  s.reauthentication_sent_at,
  coalesce(s.is_sso_user, false),
  s.deleted_at,
  coalesce(s.is_anonymous, false)
from seed_auth_users s
cross join default_instance d
on conflict (id) do update
set
  instance_id = coalesce(excluded.instance_id, auth.users.instance_id),
  aud = coalesce(excluded.aud, auth.users.aud),
  role = coalesce(excluded.role, auth.users.role),
  email = coalesce(excluded.email, auth.users.email),
  encrypted_password = coalesce(excluded.encrypted_password, auth.users.encrypted_password),
  email_confirmed_at = coalesce(excluded.email_confirmed_at, auth.users.email_confirmed_at),
  invited_at = coalesce(excluded.invited_at, auth.users.invited_at),
  confirmation_token = coalesce(excluded.confirmation_token, auth.users.confirmation_token),
  confirmation_sent_at = coalesce(excluded.confirmation_sent_at, auth.users.confirmation_sent_at),
  recovery_token = coalesce(excluded.recovery_token, auth.users.recovery_token),
  recovery_sent_at = coalesce(excluded.recovery_sent_at, auth.users.recovery_sent_at),
  email_change_token_new = coalesce(excluded.email_change_token_new, auth.users.email_change_token_new),
  email_change = coalesce(excluded.email_change, auth.users.email_change),
  email_change_sent_at = coalesce(excluded.email_change_sent_at, auth.users.email_change_sent_at),
  last_sign_in_at = coalesce(excluded.last_sign_in_at, auth.users.last_sign_in_at),
  raw_app_meta_data = coalesce(excluded.raw_app_meta_data, auth.users.raw_app_meta_data),
  raw_user_meta_data = coalesce(excluded.raw_user_meta_data, auth.users.raw_user_meta_data),
  is_super_admin = coalesce(excluded.is_super_admin, auth.users.is_super_admin),
  updated_at = coalesce(excluded.updated_at, now()),
  phone = coalesce(excluded.phone, auth.users.phone),
  phone_confirmed_at = coalesce(excluded.phone_confirmed_at, auth.users.phone_confirmed_at),
  phone_change = coalesce(excluded.phone_change, auth.users.phone_change),
  phone_change_token = coalesce(excluded.phone_change_token, auth.users.phone_change_token),
  phone_change_sent_at = coalesce(excluded.phone_change_sent_at, auth.users.phone_change_sent_at),
  confirmed_at = coalesce(excluded.confirmed_at, auth.users.confirmed_at),
  email_change_token_current = coalesce(excluded.email_change_token_current, auth.users.email_change_token_current),
  email_change_confirm_status = coalesce(excluded.email_change_confirm_status, auth.users.email_change_confirm_status),
  banned_until = excluded.banned_until,
  reauthentication_token = coalesce(excluded.reauthentication_token, auth.users.reauthentication_token),
  reauthentication_sent_at = coalesce(excluded.reauthentication_sent_at, auth.users.reauthentication_sent_at),
  is_sso_user = coalesce(excluded.is_sso_user, auth.users.is_sso_user),
  deleted_at = excluded.deleted_at,
  is_anonymous = coalesce(excluded.is_anonymous, auth.users.is_anonymous);

commit;

-- Optional verification
select id, email, aud, role, created_at, updated_at
from auth.users
where id in (select id from seed_auth_users)
order by created_at desc;
