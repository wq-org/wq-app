-- supabase/seeds/dev_fixtures.sql
-- =============================================================================
-- DEV FIXTURES — Teacher + Student + Institution + Classroom + Courses + Games
--
-- Alle UUIDs sind fest (idempotent). Mehrfaches Ausführen ist sicher.
-- Läuft als postgres-Superuser (supabase db reset), also kein RLS-Problem.
--
-- Hierarchie:
--   institution → faculty → programme → cohort → class_group → classroom
--   teacher_profile → institution_membership (teacher)
--   student_profile → institution_membership (student) → classroom_member
--   courses (2) → topics → lessons
--   games (2)
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. KONSTANTEN (alle UUIDs einmal oben, leicht zu ändern)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  -- Nur zur Dokumentation — die INSERT-Blöcke benutzen die Literale direkt
  -- damit PostgreSQL keine DO-Block-Variable-Grenzen hat.
  RAISE NOTICE 'dev_fixtures: starting seed';
END $$;

-- ---------------------------------------------------------------------------
-- 1. AUTH USERS (direkt in auth.users — nur lokal, nie in Produktion)
-- GoTrue rejects password login when instance_id is NULL. Re-runs must upsert
-- instance_id + token columns, not only the password (see seed_auth_users.sql).
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role,
  is_sso_user,
  is_anonymous
) VALUES
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'teacher@wq-dev.local',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Max Mustermann"}'::jsonb,
    now(), now(),
    'authenticated',
    'authenticated',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'aaaaaaaa-0002-0002-0002-000000000002'::uuid,
    'student@wq-dev.local',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Anna Schüler"}'::jsonb,
    now(), now(),
    'authenticated',
    'authenticated',
    false,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  instance_id        = EXCLUDED.instance_id,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  confirmation_token = EXCLUDED.confirmation_token,
  recovery_token     = EXCLUDED.recovery_token,
  email_change       = EXCLUDED.email_change,
  email_change_token_new = EXCLUDED.email_change_token_new,
  updated_at         = now();

-- GoTrue looks up email/password via auth.identities for seeded users.
INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    '11111111-0001-0001-0001-000000000001'::uuid,
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    jsonb_build_object(
      'sub', 'aaaaaaaa-0001-0001-0001-000000000001',
      'email', 'teacher@wq-dev.local',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  ),
  (
    '11111111-0002-0002-0002-000000000002'::uuid,
    'aaaaaaaa-0002-0002-0002-000000000002'::uuid,
    'aaaaaaaa-0002-0002-0002-000000000002'::uuid,
    jsonb_build_object(
      'sub', 'aaaaaaaa-0002-0002-0002-000000000002',
      'email', 'student@wq-dev.local',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  )
ON CONFLICT (provider_id, provider) DO UPDATE SET
  user_id         = EXCLUDED.user_id,
  identity_data   = EXCLUDED.identity_data,
  updated_at      = now();

-- ---------------------------------------------------------------------------
-- 2. PROFILES
-- ---------------------------------------------------------------------------
-- handle_new_user() fires on the auth.users inserts above and pre-creates both
-- profiles with role='student', is_onboarded=false (privileged roles are never
-- trusted from signup metadata). DO NOTHING would leave the teacher stuck as a
-- student, so DO UPDATE to assert the intended role/name/onboarded state.
INSERT INTO public.profiles (user_id, email, display_name, role, is_onboarded)
VALUES
  (
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'teacher@wq-dev.local',
    'Max Mustermann',
    'teacher',
    true
  ),
  (
    'aaaaaaaa-0002-0002-0002-000000000002'::uuid,
    'student@wq-dev.local',
    'Anna Schüler',
    'student',
    true
  )
ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      role = EXCLUDED.role,
      is_onboarded = EXCLUDED.is_onboarded;

-- ---------------------------------------------------------------------------
-- 3. INSTITUTION
-- ---------------------------------------------------------------------------
INSERT INTO public.institutions (id, name, status, slug, type)
VALUES (
  'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
  'WQ Demo Schule',
  'active',
  'wq-demo-schule',
  'school'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.institution_settings (institution_id)
VALUES ('bbbbbbbb-0001-0001-0001-000000000001'::uuid)
ON CONFLICT (institution_id) DO NOTHING;

INSERT INTO public.institution_quotas_usage (institution_id)
VALUES ('bbbbbbbb-0001-0001-0001-000000000001'::uuid)
ON CONFLICT (institution_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. INSTITUTION MEMBERSHIPS
-- ---------------------------------------------------------------------------
INSERT INTO public.institution_memberships (user_id, institution_id, membership_role)
VALUES
  (
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
    'teacher'
  ),
  (
    'aaaaaaaa-0002-0002-0002-000000000002'::uuid,
    'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
    'student'
  )
-- Uniqueness is a PARTIAL index: UNIQUE (user_id, institution_id) WHERE deleted_at IS NULL.
-- ON CONFLICT must repeat that predicate to match the index.
ON CONFLICT (user_id, institution_id) WHERE deleted_at IS NULL DO NOTHING;

-- active_institution_id auf Profil setzen
UPDATE public.profiles
SET active_institution_id = 'bbbbbbbb-0001-0001-0001-000000000001'::uuid
WHERE user_id IN (
  'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
  'aaaaaaaa-0002-0002-0002-000000000002'::uuid
);

-- ---------------------------------------------------------------------------
-- 5. AKADEMISCHE HIERARCHIE: Faculty → Programme → Cohort → ClassGroup
-- ---------------------------------------------------------------------------
INSERT INTO public.faculties (id, institution_id, name)
VALUES (
  'cccccccc-0001-0001-0001-000000000001'::uuid,
  'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
  'Pflegewissenschaften'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.programmes (id, institution_id, faculty_id, name, duration_years, progression_type)
VALUES (
  'cccccccc-0002-0002-0002-000000000002'::uuid,
  'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
  'cccccccc-0001-0001-0001-000000000001'::uuid,
  'Gesundheits- und Krankenpflege',
  3,
  'year_group'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cohorts (id, institution_id, programme_id, name, academic_year)
VALUES (
  'cccccccc-0003-0003-0003-000000000003'::uuid,
  'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
  'cccccccc-0002-0002-0002-000000000002'::uuid,
  'Jahrgang 2025',
  2025
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.class_groups (id, institution_id, cohort_id, name)
VALUES (
  'cccccccc-0004-0004-0004-000000000004'::uuid,
  'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
  'cccccccc-0003-0003-0003-000000000003'::uuid,
  'Klasse GKP-2025-A'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. CLASSROOM
-- ---------------------------------------------------------------------------
INSERT INTO public.classrooms (
  id, institution_id, class_group_id, primary_teacher_id, title, status
)
VALUES (
  'dddddddd-0001-0001-0001-000000000001'::uuid,
  'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
  'cccccccc-0004-0004-0004-000000000004'::uuid,
  'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
  'GKP 2025 – Wundversorgung',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Teacher als classroom_member (co_teacher-Rolle, damit RLS greift)
INSERT INTO public.classroom_members (
  institution_id, classroom_id, user_id, membership_role
)
VALUES
  (
    'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
    'dddddddd-0001-0001-0001-000000000001'::uuid,
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'co_teacher'
  ),
  (
    'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
    'dddddddd-0001-0001-0001-000000000001'::uuid,
    'aaaaaaaa-0002-0002-0002-000000000002'::uuid,
    'student'
  )
-- Uniqueness is a PARTIAL index: UNIQUE (classroom_id, user_id) WHERE withdrawn_at IS NULL.
ON CONFLICT (classroom_id, user_id) WHERE withdrawn_at IS NULL DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. COURSES (2 Demo-Kurse)
-- ---------------------------------------------------------------------------
INSERT INTO public.courses (id, title, description, teacher_id, institution_id, theme_id, is_published)
VALUES
  (
    'eeeeeeee-0001-0001-0001-000000000001'::uuid,
    'Grundlagen der Wundversorgung',
    'Einführung in Wundarten, Heilungsprozesse und Verbandtechniken.',
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
    'teal',
    true
  ),
  (
    'eeeeeeee-0002-0002-0002-000000000002'::uuid,
    'Chronische Wunden & Komplikationen',
    'Vertiefung: Diabetisches Fußsyndrom, Dekubitus, Ulcus cruris.',
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
    'indigo',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Topics für Kurs 1
INSERT INTO public.topics (id, title, course_id, order_index)
VALUES
  (
    'eeeeeeee-0011-0011-0011-000000000011'::uuid,
    'Wundarten & Klassifikation',
    'eeeeeeee-0001-0001-0001-000000000001'::uuid,
    0
  ),
  (
    'eeeeeeee-0012-0012-0012-000000000012'::uuid,
    'Wundheilung & Phasen',
    'eeeeeeee-0001-0001-0001-000000000001'::uuid,
    1
  )
ON CONFLICT (id) DO NOTHING;

-- Topics für Kurs 2
INSERT INTO public.topics (id, title, course_id, order_index)
VALUES
  (
    'eeeeeeee-0021-0021-0021-000000000021'::uuid,
    'Diabetisches Fußsyndrom',
    'eeeeeeee-0002-0002-0002-000000000002'::uuid,
    0
  )
ON CONFLICT (id) DO NOTHING;

-- Lessons
INSERT INTO public.lessons (id, title, topic_id, content, pages, order_index)
VALUES
  (
    'eeeeeeee-0101-0101-0101-000000000101'::uuid,
    'Einführung: Akute vs. chronische Wunden',
    'eeeeeeee-0011-0011-0011-000000000011'::uuid,
    '{"type":"doc","content":[]}'::jsonb,
    '[]'::jsonb,
    0
  ),
  (
    'eeeeeeee-0102-0102-0102-000000000102'::uuid,
    'Inflammationsphase verstehen',
    'eeeeeeee-0012-0012-0012-000000000012'::uuid,
    '{"type":"doc","content":[]}'::jsonb,
    '[]'::jsonb,
    0
  ),
  (
    'eeeeeeee-0201-0201-0201-000000000201'::uuid,
    'Wagner-Armstrong-Klassifikation',
    'eeeeeeee-0021-0021-0021-000000000021'::uuid,
    '{"type":"doc","content":[]}'::jsonb,
    '[]'::jsonb,
    0
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. GAMES (2 Demo-Games)
-- ---------------------------------------------------------------------------
-- NOTE: column is game_content (renamed from game_config in 20260326000002).
-- institution_id is required for the published game to be visible to students
-- (games_select policy scopes by institution membership).
-- A BEFORE INSERT trigger (trg_games_sync_game_versions) creates a game_versions
-- row per game and fires even under ON CONFLICT DO NOTHING, so guard re-runs with
-- WHERE NOT EXISTS to stay idempotent.
INSERT INTO public.games (
  id, title, description, game_type, teacher_id, institution_id, theme_id,
  game_content, status, is_draft
)
SELECT v.id, v.title, v.description, v.game_type, v.teacher_id, v.institution_id,
       v.theme_id, v.game_content, v.status, v.is_draft
FROM (VALUES
  (
    'ffffffff-0001-0001-0001-000000000001'::uuid,
    'Wundarten zuordnen'::text,
    'Ordne Bilder den richtigen Wundarten zu.'::text,
    'image_term_match'::text,
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
    'teal'::text,
    '{
      "rounds": [
        {
          "image_url": "",
          "terms": ["Dekubitus", "Ulcus cruris", "Diabetische Fußwunde"],
          "correct_term": "Dekubitus"
        }
      ]
    }'::jsonb,
    'published'::public.game_status,
    false
  ),
  (
    'ffffffff-0002-0002-0002-000000000002'::uuid,
    'Wundphasen markieren',
    'Markiere die korrekte Phase im Wundheilungsbild.',
    'image_marker',
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'bbbbbbbb-0001-0001-0001-000000000001'::uuid,
    'indigo',
    '{
      "image_url": "",
      "markers": [
        { "label": "Inflammationsphase", "x": 0.25, "y": 0.50 },
        { "label": "Proliferationsphase", "x": 0.60, "y": 0.50 }
      ]
    }'::jsonb,
    'draft'::public.game_status,
    true
  )
) AS v (
  id, title, description, game_type, teacher_id, institution_id, theme_id,
  game_content, status, is_draft
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.games g WHERE g.id = v.id
);

COMMIT;

-- ---------------------------------------------------------------------------
-- ZUSAMMENFASSUNG (sichtbar in supabase db reset output)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'DEV FIXTURES geladen:';
  RAISE NOTICE '  Institution : WQ Demo Schule';
  RAISE NOTICE '  Teacher     : teacher@wq-dev.local  / Password123!';
  RAISE NOTICE '  Student     : student@wq-dev.local  / Password123!';
  RAISE NOTICE '  Classroom   : GKP 2025 – Wundversorgung';
  RAISE NOTICE '  Kurse       : 2 (1 published, 1 draft)';
  RAISE NOTICE '  Games       : 2 (1 published, 1 draft)';
  RAISE NOTICE '==================================================';
END $$;
