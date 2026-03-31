-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Triggers
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DROP TRIGGER IF EXISTS trg_classroom_course_links_set_updated_at ON public.classroom_course_links;
CREATE TRIGGER trg_classroom_course_links_set_updated_at
  BEFORE UPDATE ON public.classroom_course_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS lp_updated_at ON public.lesson_progress;
DROP TRIGGER IF EXISTS trg_lesson_progress_set_updated_at ON public.lesson_progress;
CREATE TRIGGER trg_lesson_progress_set_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
