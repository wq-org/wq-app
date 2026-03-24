-- =============================================================================
-- PHASE A — LMS + storage RLS retarget: tables
-- Split from 20260323000001_baseline_lms_rls_memberships.sql
-- Requires: 20260321000001_super_admin (all parts), 20260321000002_institution_admin (all parts)
-- =============================================================================

-- =============================================================================
-- 1a. ADD institution_id to games (marketplace-ready; consistent with courses)
-- =============================================================================
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS institution_id uuid
    REFERENCES public.institutions(id) ON DELETE SET NULL;

-- =============================================================================
-- 1a2. Games → optional course link (one game, one course); drop legacy topic_id
--       Tenant safety: trigger enforces games.institution_id matches courses.institution_id.
-- =============================================================================
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS course_id uuid;

ALTER TABLE public.games DROP COLUMN IF EXISTS topic_id;

ALTER TABLE public.games
  DROP CONSTRAINT IF EXISTS games_course_id_fkey;

ALTER TABLE public.games
  ADD CONSTRAINT games_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.games.institution_id IS 'Owning institution. Nullable for legacy rows; new inserts should always set this.';

COMMENT ON COLUMN public.games.course_id IS
  'Optional course placement; NULL = standalone. When set, institution_id must match courses.institution_id (enforced by trigger).';
