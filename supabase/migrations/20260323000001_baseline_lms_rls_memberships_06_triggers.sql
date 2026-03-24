-- =============================================================================
-- PHASE A — LMS + storage RLS retarget: triggers
-- Split from 20260323000001_baseline_lms_rls_memberships.sql
-- Requires: 20260321000001_super_admin (all parts), 20260321000002_institution_admin (all parts)
-- =============================================================================

DROP TRIGGER IF EXISTS games_course_institution_trg ON public.games;
CREATE TRIGGER games_course_institution_trg
  BEFORE INSERT OR UPDATE OF course_id, institution_id ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.games_enforce_course_institution_match();
