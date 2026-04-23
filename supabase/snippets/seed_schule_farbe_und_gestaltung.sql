-- ===================================================================
-- UPSERT SEED: Schule für Farbe und Gestaltung Stuttgart
-- ===================================================================
-- Schema alignment based on existing institution seed structure
-- from seed_kreiskliniken_reutlingen_gGmbH.sql
--
-- Public web sources used:
-- - https://www.farbegestaltung.de/
-- - https://www.farbegestaltung.de/impressum/
-- - https://www.farbegestaltung.de/kontakt-anfahrt/
-- - https://www.farbegestaltung.de/organisation/
-- - programme pages under /allgemeinbildung, /ausbildung, /weiterbildung
--
-- Notes:
-- 1) This seed assumes public.institutions.slug is unique.
-- 2) legal_form / registration_number / tax_id / vat_id were not clearly published
--    on the public school website, so they are set to NULL.
-- 3) If your institutions.type column is an enum and does not accept 'school',
--    replace it with your project's actual education institution enum value.
-- ===================================================================

INSERT INTO public.institutions (
  id,
  name,
  slug,
  type,
  status,
  description,

  legal_name,
  legal_form,
  registration_number,
  tax_id,
  vat_id,

  email,
  phone,
  website,

  primary_contact_name,
  primary_contact_role,
  primary_contact_email,
  primary_contact_phone,

  billing_email,
  billing_contact_name,
  billing_contact_phone,
  invoice_language,
  payment_terms,

  address,

  institution_number,
  number_of_beds,
  departments,
  accreditation,

  social_links,
  image_url,

  created_at,
  updated_at
)
VALUES (
  'd9916918-45cb-44a8-ab2e-ac2c11dcf194'::uuid,
  'Schule für Farbe und Gestaltung Stuttgart',
  'schule-fuer-farbe-und-gestaltung-stuttgart',
  'school',
  'active',
  'Die Schule für Farbe und Gestaltung in Stuttgart ist ein deutschlandweit einzigartiges Kompetenzzentrum für Farbtechnik und Raumgestaltung. Sie bietet Allgemeinbildung, duale und schulische Ausbildung sowie vielfältige Weiterbildungsangebote für Farbtechnik, Lacktechnik, Gestaltung, visuelles Marketing und verwandte Handwerks- und Industrieberufe.',

  'Schule für Farbe und Gestaltung Stuttgart',
  NULL,
  NULL,
  NULL,
  NULL,

  'schule@farbegestaltung.de',
  '+49 711 216-35200',
  'https://www.farbegestaltung.de/',

  'Felix Winkler',
  'Schulleiter',
  'schule@farbegestaltung.de',
  '+49 711 216-35200',

  'schule@farbegestaltung.de',
  'Martina Schardt und Paula Campanaro',
  '+49 711 216-35202',
  'de',
  30,

  jsonb_build_object(
    'street', 'Leobener Straße 97',
    'addressLine2', NULL,
    'postalCode', '70469',
    'city', 'Stuttgart',
    'state', 'Baden-Württemberg',
    'country', 'Germany'
  ),

  NULL,
  NULL,
  ARRAY[
    'Allgemeinbildung',
    'VABO',
    'Duale Ausbildungsvorbereitung (AVdual)',
    'Technisches Berufskolleg',
    'Maler und Lackierer*in',
    'Fachpraktiker*in für Maler und Lackierer',
    'Fahrzeuglackierer*in',
    'Gestalter*in für visuelles Marketing',
    'Lacklaborant*in',
    'Schilder- und Lichtreklamehersteller*in',
    'Akademie für Betriebsmanagement',
    'Fachschule für Gestaltung',
    'Fachschule für Lacktechnik',
    'Fachschule für Werbegestaltung',
    'Meisterschule für Fahrzeuglackierer*innen',
    'Meisterschule für Maler und Lackierer*innen',
    'Weiterbildung zum/zur Geprüften Vorarbeiter*in im Maler- und Lackiererhandwerk'
  ],
  'Öffentliche berufliche Schule / Kompetenzzentrum für Farbtechnik und Raumgestaltung',

  jsonb_build_object(
    'homepage', 'https://www.farbegestaltung.de/'
  ),
  NULL,

  NOW(),
  NOW()
)
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  legal_name = EXCLUDED.legal_name,
  legal_form = EXCLUDED.legal_form,
  registration_number = EXCLUDED.registration_number,
  tax_id = EXCLUDED.tax_id,
  vat_id = EXCLUDED.vat_id,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  website = EXCLUDED.website,
  primary_contact_name = EXCLUDED.primary_contact_name,
  primary_contact_role = EXCLUDED.primary_contact_role,
  primary_contact_email = EXCLUDED.primary_contact_email,
  primary_contact_phone = EXCLUDED.primary_contact_phone,
  billing_email = EXCLUDED.billing_email,
  billing_contact_name = EXCLUDED.billing_contact_name,
  billing_contact_phone = EXCLUDED.billing_contact_phone,
  invoice_language = EXCLUDED.invoice_language,
  payment_terms = EXCLUDED.payment_terms,
  address = EXCLUDED.address,
  institution_number = EXCLUDED.institution_number,
  number_of_beds = EXCLUDED.number_of_beds,
  departments = EXCLUDED.departments,
  accreditation = EXCLUDED.accreditation,
  social_links = EXCLUDED.social_links,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();
