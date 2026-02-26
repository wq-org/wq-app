-- Seed/reseed: institutions
-- Safe to re-run (UPSERT by institutions.id).
-- Run as postgres/service role in Supabase SQL Editor.

begin;

create temp table seed_institutions (
  id uuid,
  name text,
  slug text,
  description text,
  email text,
  phone text,
  website text,
  type public.institution_type,
  status public.institution_status,
  invoice_language text,
  payment_terms integer
) on commit drop;

-- TODO: replace with your old institutions
insert into seed_institutions (
  id, name, slug, description, email, phone, website, type, status, invoice_language, payment_terms
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Hospital A',
    'hospital-a',
    'Main campus',
    'info@hospital-a.de',
    '+49-111',
    'https://hospital-a.de',
    'hospital',
    'active',
    'de',
    30
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'School B',
    'school-b',
    'Training school',
    'info@school-b.de',
    '+49-222',
    'https://school-b.de',
    'school',
    'active',
    'en',
    30
  );

insert into public.institutions (
  id,
  name,
  slug,
  description,
  email,
  phone,
  website,
  type,
  status,
  invoice_language,
  payment_terms,
  updated_at
)
select
  s.id,
  s.name,
  s.slug,
  s.description,
  s.email,
  s.phone,
  s.website,
  s.type,
  s.status,
  s.invoice_language,
  s.payment_terms,
  now()
from seed_institutions s
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  email = excluded.email,
  phone = excluded.phone,
  website = excluded.website,
  type = excluded.type,
  status = excluded.status,
  invoice_language = excluded.invoice_language,
  payment_terms = excluded.payment_terms,
  updated_at = now();

commit;
