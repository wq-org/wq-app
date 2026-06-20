-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-LESSON-PROGRESS | strip trg_lesson_progress_set_updated_at | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Triggers
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DROP TRIGGER IF EXISTS trg_classroom_course_links_set_updated_at ON public.classroom_course_links;
CREATE TRIGGER trg_classroom_course_links_set_updated_at
  BEFORE UPDATE ON public.classroom_course_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
