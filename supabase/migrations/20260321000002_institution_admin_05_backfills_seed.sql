-- =============================================================================
-- INSTITUTION ADMIN — Backfills & Seed Data
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

-- Backfill from legacy user_institutions (safe for fresh and existing DBs).
INSERT INTO public.institution_memberships
  (user_id, institution_id, membership_role, status, created_at)
SELECT
  ui.user_id,
  ui.institution_id,
  CASE
    WHEN p.role = 'institution_admin' THEN 'institution_admin'::membership_role
    WHEN p.role = 'teacher' THEN 'teacher'::membership_role
    ELSE 'student'::membership_role
  END,
  'active'::membership_status,
  COALESCE(ui.joined_at, NOW())
FROM public.user_institutions ui
INNER JOIN public.profiles p ON ui.user_id = p.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.institution_memberships m
  WHERE m.user_id = ui.user_id
    AND m.institution_id = ui.institution_id
    AND m.deleted_at IS NULL
);

COMMENT ON TABLE public.user_institutions IS
  'DEPRECATED — use institution_memberships. Kept for backward compat during transition.';

-- Derive initial offering rows from stable hierarchy (safe on fresh and existing DBs).
INSERT INTO public.programme_offerings (
  institution_id, programme_id, academic_year, term_code, status, starts_at, created_at, updated_at
)
SELECT
  p.institution_id,
  p.id,
  COALESCE(c.academic_year, EXTRACT(YEAR FROM NOW())::integer) AS academic_year,
  NULL::text,
  'active',
  NULL::timestamptz,
  NOW(),
  NOW()
FROM public.programmes p
LEFT JOIN public.cohorts c ON p.id = c.programme_id AND c.deleted_at IS NULL
WHERE p.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.cohort_offerings (
  institution_id, programme_offering_id, cohort_id, status, starts_at, created_at, updated_at
)
SELECT
  c.institution_id,
  po.id,
  c.id,
  'active',
  NULL::timestamptz,
  NOW(),
  NOW()
FROM public.cohorts c
INNER JOIN public.programme_offerings po
  ON c.programme_id = po.programme_id
  AND c.institution_id = po.institution_id
  AND po.deleted_at IS NULL
  AND po.academic_year = COALESCE(c.academic_year, po.academic_year)
WHERE c.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.class_group_offerings (
  institution_id, cohort_offering_id, class_group_id, status, starts_at, created_at, updated_at
)
SELECT
  cg.institution_id,
  co.id,
  cg.id,
  'active',
  NULL::timestamptz,
  NOW(),
  NOW()
FROM public.class_groups cg
INNER JOIN public.cohort_offerings co
  ON cg.cohort_id = co.cohort_id
  AND cg.institution_id = co.institution_id
  AND co.deleted_at IS NULL
WHERE cg.deleted_at IS NULL
ON CONFLICT DO NOTHING;

UPDATE public.classrooms cr
SET class_group_offering_id = cgo.id
FROM public.class_group_offerings cgo
WHERE cgo.class_group_id = cr.class_group_id
  AND cgo.institution_id = cr.institution_id
  AND cgo.deleted_at IS NULL
  AND cr.class_group_offering_id IS NULL;

COMMENT ON TABLE public.course_enrollments IS
  'Legacy/compatibility enrollment surface. Canonical student access is classroom_members + course_deliveries.';
