-- =============================================================================
-- PHASE A — LMS + storage RLS retarget: indexes & constraints
-- Split from 20260323000001_baseline_lms_rls_memberships.sql
-- Requires: 20260321000001_super_admin (all parts), 20260321000002_institution_admin (all parts)
-- =============================================================================

DROP INDEX IF EXISTS idx_games_institution;
DROP INDEX IF EXISTS idx_games_topic;

CREATE INDEX IF NOT EXISTS idx_games_institution_id
  ON public.games (institution_id) WHERE institution_id IS NOT NULL;

DROP INDEX IF EXISTS idx_games_course;

CREATE INDEX IF NOT EXISTS idx_games_course_id
  ON public.games (course_id) WHERE course_id IS NOT NULL;
