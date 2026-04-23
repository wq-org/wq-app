-- ===================================================================
-- INSERT STATEMENT: Bismarckschule Feuerbach
-- ===================================================================
-- Data gathered from:
-- - https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php
-- - https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php?idcat=67&lang=1
-- - https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php?idart=6&lang=1
-- - https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php?idcat=2&lang=1
-- - https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php?idcat=59&lang=1
-- - https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php?idcat=60&lang=1
-- - https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php?idcat=25&lang=1
-- - https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php?idcat=32&lang=1
-- ===================================================================

INSERT INTO public.institutions (
  -- Basic Information
  id,
  name,
  slug,
  type,
  status,
  description,

  -- Legal Information
  legal_name,
  legal_form,
  registration_number,
  tax_id,
  vat_id,

  -- Contact Information
  email,
  phone,
  website,

  -- Primary Contact
  primary_contact_name,
  primary_contact_role,
  primary_contact_email,
  primary_contact_phone,

  -- Billing Information
  billing_email,
  billing_contact_name,
  billing_contact_phone,
  invoice_language,
  payment_terms,

  -- Address (JSONB format)
  address,

  -- Institution-Specific Information
  institution_number,
  number_of_beds,
  departments,
  accreditation,

  -- Social Links (JSONB format)
  social_links,

  -- Metadata
  image_url,

  -- Timestamps
  created_at,
  updated_at
)
VALUES (
  -- Basic Information
  '7ff104cb-8121-4ceb-9a26-2c279ca216f7'::uuid,
  'Bismarckschule Feuerbach',
  'bismarckschule-feuerbach',
  'school',
  'active',
  'Die Bismarckschule Feuerbach ist eine ganztägige Werkrealschule in Stuttgart. Sie führt ihre Schülerinnen und Schüler je nach Begabung nach 5 bzw. 6 Schuljahren zum Hauptschulabschluss oder nach 6 Schuljahren zum Werkrealabschluss. Zum Schulprofil gehören Ganztag, individuelle Förderung, Vorbereitungsklassen, AES, Technik, Projektunterricht, Schulsozialarbeit sowie Berufsorientierung ab Klasse 8 mit Praktika und Kooperationsprojekten.',

  -- Legal Information
  'Bismarckschule Feuerbach',
  'koerperschaft_des_oeffentlichen_rechts',
  NULL,
  NULL,
  NULL,

  -- Contact Information
  'bismarckschule@stuttgart.de',
  '+49 711 216-60821',
  'https://www.bismarckschule-stuttgart.de/bsf/cms/front_content.php',

  -- Primary Contact
  'Cornelia Kaiser',
  'Schulleitung',
  'bismarckschule@stuttgart.de',
  '+49 711 216-60821',

  -- Billing Information
  'bismarckschule@stuttgart.de',
  'Schulverwaltung',
  '+49 711 216-60821',
  'de',
  30,

  -- Address
  jsonb_build_object(
    'street', 'Wiener Straße 76',
    'addressLine2', NULL,
    'postalCode', '70469',
    'city', 'Stuttgart',
    'state', 'Baden-Württemberg',
    'country', 'Germany'
  ),

  -- Institution-Specific Information
  NULL,
  NULL,
  ARRAY[
    'Werkrealschule mit Ganztagesschule',
    'Hauptschulabschluss nach 5 bzw. 6 Schuljahren',
    'Werkrealabschluss nach 6 Schuljahren',
    'Individuelle Förderung und differenziertes Unterstützungssystem',
    'Vorbereitungsklassen',
    'Stufe 5',
    'Lernformen',
    'Lernräume',
    'Experimentieren',
    'AES',
    'Technik',
    'Projektunterricht',
    'Moodle',
    'Berufsorientierung ab Klasse 8',
    'Praktika',
    'Berufsberatung',
    'ready-steady-go',
    'Schulsozialarbeit',
    'Kooperationsprojekte mit Schulen in Feuerbach',
    'Förderverein und Sponsoren'
  ],
  'Öffentliche Werkrealschule des Landes Baden-Württemberg mit Ganztagsprofil',

  -- Social Links
  jsonb_build_object(),

  -- Metadata
  NULL,

  -- Timestamps
  NOW(),
  NOW()
);
