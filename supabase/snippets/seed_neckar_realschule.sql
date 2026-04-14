-- ===================================================================
-- INSERT STATEMENT: Neckar-Realschule Stuttgart
-- ===================================================================
-- Data gathered from:
-- - https://neckar-realschule.de/
-- - https://neckar-realschule.de/kontakt/
-- - https://neckar-realschule.de/schulstruktur/
-- - https://neckar-realschule.de/wahlpflichtfaecher/
-- - https://neckar-realschule.de/partner/
-- - https://neckar-realschule.de/vkl/
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
  'fb6cb5c3-6ea1-4d0d-a982-c3d74b065339'::uuid,
  'Neckar-Realschule',
  'neckar-realschule',
  'school',
  'active',
  'Die Neckar-Realschule ist eine öffentliche Realschule in Stuttgart mit 452 Schüler*innen und 40 Lehrer*innen. Sie liegt an der Heilbronner Straße nahe der Innenstadt in Richtung Pragsattel, arbeitet mit 70-Minuten-Unterrichtsblöcken und bietet neben dem Realschulcurriculum unter anderem Wahlpflichtfächer, Berufsorientierung, SMV-Arbeit, Vorbereitungsklassen und verschiedene Kooperationsangebote.',

  -- Legal Information
  'Neckar-Realschule',
  'koerperschaft_des_oeffentlichen_rechts',
  NULL,
  NULL,
  NULL,

  -- Contact Information
  'nrs@stuttgart.de',
  '+49 711 216-57730',
  'https://neckar-realschule.de',

  -- Primary Contact
  'Vanessa Kieser',
  'Schulleiterin',
  'nrs@stuttgart.de',
  '+49 711 216-57730',

  -- Billing Information
  'nrs@stuttgart.de',
  'Sekretariat',
  '+49 711 216-57730',
  'de',
  30,

  -- Address
  jsonb_build_object(
    'street', 'Heilbronner Straße 159',
    'addressLine2', NULL,
    'postalCode', '70191',
    'city', 'Stuttgart',
    'state', 'Baden-Württemberg',
    'country', 'Germany'
  ),

  -- Institution-Specific Information
  NULL,
  NULL,
  ARRAY[
    'Klassenstufen 5 bis 10',
    'M-Niveau und G-Niveau im Realschulmodell Baden-Württemberg',
    'Wahlpflichtfach Französisch',
    'Wahlpflichtfach Technik',
    'Wahlpflichtfach AES',
    'Berufsorientierung',
    'Vorbereitungsklasse (VKL)',
    'SMV und Schülermentoring',
    'Kooperation mit der Bundesagentur für Arbeit',
    'Kooperation Schule und Sport / TVB Stuttgart',
    'Präventions- und Beratungsangebote'
  ],
  'Öffentliche Realschule des Landes Baden-Württemberg nach dem Bildungsplan 2016',

  -- Social Links
  jsonb_build_object(),

  -- Metadata
  NULL,

  -- Timestamps
  NOW(),
  NOW()
);
