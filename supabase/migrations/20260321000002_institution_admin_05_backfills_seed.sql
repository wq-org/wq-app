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
    WHEN p.role = 'teacher'           THEN 'teacher'::membership_role
    ELSE 'student'::membership_role
  END,
  'active'::membership_status,
  COALESCE(ui.joined_at, now())
FROM public.user_institutions ui
JOIN public.profiles p ON p.user_id = ui.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.institution_memberships m
  WHERE m.user_id = ui.user_id
    AND m.institution_id = ui.institution_id
    AND m.deleted_at IS NULL
);

COMMENT ON TABLE public.user_institutions IS
  'DEPRECATED — use institution_memberships. Kept for backward compat during transition.';
