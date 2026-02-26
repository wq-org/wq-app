-- Seed/reseed: profiles + user_institutions
-- Safe to re-run (UPSERT by profiles.user_id).
-- Assumes auth.users exists for each seeded user_id.
-- Assumes institutions exist for each seeded institution_id.
-- Run as postgres/service role in Supabase SQL Editor.

begin;

create temp table seed_profiles (
  user_id uuid,
  email text,
  username text,
  display_name text,
  role text,
  is_onboarded boolean,
  linkedin_url text,
  avatar_url text,
  description text,
  follow_count integer
) on commit drop;

-- TODO: replace with your old profiles
insert into seed_profiles (
  user_id, email, username, display_name, role, is_onboarded, linkedin_url, avatar_url, description, follow_count
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'student1@example.com',
    'student1',
    'Student One',
    'student',
    true,
    '',
    null,
    'Learner',
    0
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'teacher1@example.com',
    'teacher1',
    'Teacher One',
    'teacher',
    true,
    '',
    null,
    'Instructor',
    0
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'admin1@example.com',
    'admin1',
    'Institution Admin',
    'institution_admin',
    true,
    '',
    null,
    'Admin',
    0
  );

insert into public.profiles (
  user_id,
  email,
  username,
  display_name,
  role,
  is_onboarded,
  linkedin_url,
  avatar_url,
  description,
  follow_count,
  updated_at
)
select
  sp.user_id,
  sp.email,
  sp.username,
  sp.display_name,
  sp.role,
  coalesce(sp.is_onboarded, false),
  coalesce(sp.linkedin_url, ''),
  sp.avatar_url,
  sp.description,
  coalesce(sp.follow_count, 0),
  now()
from seed_profiles sp
join auth.users au on au.id = sp.user_id
on conflict (user_id) do update
set
  email = excluded.email,
  username = excluded.username,
  display_name = excluded.display_name,
  role = excluded.role,
  is_onboarded = excluded.is_onboarded,
  linkedin_url = excluded.linkedin_url,
  avatar_url = excluded.avatar_url,
  description = excluded.description,
  follow_count = excluded.follow_count,
  updated_at = now();

create temp table seed_user_institutions (
  user_id uuid,
  institution_id uuid
) on commit drop;

-- TODO: map users to institutions
insert into seed_user_institutions (user_id, institution_id) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222');

insert into public.user_institutions (user_id, institution_id, joined_at)
select
  sui.user_id,
  sui.institution_id,
  now()
from seed_user_institutions sui
join public.profiles p on p.user_id = sui.user_id
join public.institutions i on i.id = sui.institution_id
on conflict (user_id, institution_id) do nothing;

-- Optional check: which profile rows were skipped because auth.users is missing?
select sp.user_id, sp.email
from seed_profiles sp
left join auth.users au on au.id = sp.user_id
where au.id is null;

commit;
