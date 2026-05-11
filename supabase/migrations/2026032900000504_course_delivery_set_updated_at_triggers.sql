-- =============================================================================
-- COURSE DELIVERY — updated_at triggers for versioning + delivery tables
-- These triggers were originally tacked onto the lesson_progress backfill
-- migration but are an unrelated concern; isolated here per db_principles §1.
-- Requires: course_versions, course_version_topics, course_version_lessons,
-- course_deliveries tables (created in earlier course_delivery_* migrations).
-- =============================================================================

DROP TRIGGER IF EXISTS trg_course_versions_set_updated_at ON public.course_versions;
CREATE TRIGGER trg_course_versions_set_updated_at
  BEFORE UPDATE ON public.course_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_course_version_topics_set_updated_at ON public.course_version_topics;
CREATE TRIGGER trg_course_version_topics_set_updated_at
  BEFORE UPDATE ON public.course_version_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_course_version_lessons_set_updated_at ON public.course_version_lessons;
CREATE TRIGGER trg_course_version_lessons_set_updated_at
  BEFORE UPDATE ON public.course_version_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_course_deliveries_set_updated_at ON public.course_deliveries;
CREATE TRIGGER trg_course_deliveries_set_updated_at
  BEFORE UPDATE ON public.course_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
