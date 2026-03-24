-- =============================================================================
-- PHASE A — LMS + storage RLS retarget: backfills & seed data
-- Split from 20260323000001_baseline_lms_rls_memberships.sql
-- Requires: 20260321000001_super_admin (all parts), 20260321000002_institution_admin (all parts)
-- =============================================================================

-- Backfill from teacher's primary active membership.
UPDATE public.games g
SET institution_id = (
  SELECT m.institution_id
  FROM public.institution_memberships m
  WHERE m.user_id = g.teacher_id
    AND m.status = 'active'
    AND m.deleted_at IS NULL
    AND m.left_institution_at IS NULL
  ORDER BY m.created_at ASC
  LIMIT 1
)
WHERE g.institution_id IS NULL;

-- Carry topic-based linkage forward as course placement before dropping topic_id.
UPDATE public.games g
SET course_id = t.course_id
FROM public.topics t
WHERE g.topic_id IS NOT NULL
  AND t.id = g.topic_id;

-- Align institution_id with the linked course (fixes cross-tenant mismatch before FK/trigger).
UPDATE public.games g
SET institution_id = c.institution_id
FROM public.courses c
WHERE g.course_id = c.id
  AND (g.institution_id IS DISTINCT FROM c.institution_id);
