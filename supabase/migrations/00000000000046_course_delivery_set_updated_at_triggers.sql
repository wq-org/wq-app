-- =============================================================================
-- COURSE DELIVERY — updated_at triggers for versioning + delivery tables
-- These triggers were originally tacked onto the lesson_progress backfill
-- migration but are an unrelated concern; isolated here per principle_database.md §1.
-- Requires: course_versions, course_version_topics, course_version_lessons,
-- course_deliveries tables (created in earlier course_delivery_* migrations).
-- =============================================================================

CREATE OR REPLACE FUNCTION app.set_course_version_topic_institution_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, pg_temp
AS $$
BEGIN
  SELECT cv.institution_id
  INTO NEW.institution_id
  FROM public.course_versions cv
  WHERE cv.id = NEW.course_version_id;

  IF NEW.institution_id IS NULL THEN
    RAISE EXCEPTION 'course_version % not found when inserting course_version_topic', NEW.course_version_id;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION app.set_course_version_topic_institution_id IS
  'Trigger function: auto-populates institution_id on course_version_topics from parent course_versions row.';

CREATE OR REPLACE FUNCTION app.set_course_version_lesson_denorm_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, pg_temp
AS $$
BEGIN
  SELECT cvt.course_version_id, cv.institution_id
  INTO NEW.course_version_id, NEW.institution_id
  FROM public.course_version_topics cvt
  INNER JOIN public.course_versions cv ON cv.id = cvt.course_version_id
  WHERE cvt.id = NEW.course_version_topic_id;

  IF NEW.institution_id IS NULL THEN
    RAISE EXCEPTION 'course_version_topic % not found when inserting course_version_lesson', NEW.course_version_topic_id;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION app.set_course_version_lesson_denorm_fields IS
  'Trigger function: auto-populates institution_id and course_version_id on course_version_lessons from parent topic/version chain.';

DROP TRIGGER IF EXISTS trg_course_versions_set_updated_at ON public.course_versions;
CREATE TRIGGER trg_course_versions_set_updated_at
  BEFORE UPDATE ON public.course_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_course_version_topics_set_updated_at ON public.course_version_topics;
CREATE TRIGGER trg_course_version_topics_set_updated_at
  BEFORE UPDATE ON public.course_version_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_course_version_topics_set_institution_id ON public.course_version_topics;
CREATE TRIGGER trg_course_version_topics_set_institution_id
  BEFORE INSERT ON public.course_version_topics
  FOR EACH ROW
  WHEN (NEW.institution_id IS NULL)
  EXECUTE FUNCTION app.set_course_version_topic_institution_id();

DROP TRIGGER IF EXISTS trg_course_version_lessons_set_updated_at ON public.course_version_lessons;
CREATE TRIGGER trg_course_version_lessons_set_updated_at
  BEFORE UPDATE ON public.course_version_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_course_version_lessons_set_denorm_fields ON public.course_version_lessons;
CREATE TRIGGER trg_course_version_lessons_set_denorm_fields
  BEFORE INSERT ON public.course_version_lessons
  FOR EACH ROW
  WHEN (NEW.institution_id IS NULL OR NEW.course_version_id IS NULL)
  EXECUTE FUNCTION app.set_course_version_lesson_denorm_fields();

DROP TRIGGER IF EXISTS trg_course_deliveries_set_updated_at ON public.course_deliveries;
CREATE TRIGGER trg_course_deliveries_set_updated_at
  BEFORE UPDATE ON public.course_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
