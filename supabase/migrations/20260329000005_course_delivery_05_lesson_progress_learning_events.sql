-- =============================================================================
-- COURSE DELIVERY — lesson_progress + learning_events scoped by course_delivery_id
-- Requires: 20260329000004_course_delivery_04_backfill_versions_deliveries.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Columns (nullable until backfill completes)
-- -----------------------------------------------------------------------------
ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS course_delivery_id uuid;

ALTER TABLE public.learning_events
  ADD COLUMN IF NOT EXISTS course_delivery_id uuid;

-- -----------------------------------------------------------------------------
-- 2) Replace old uniqueness on lesson_progress before repopulating rows
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS public.idx_lesson_progress_user_id_lesson_id;

-- -----------------------------------------------------------------------------
-- 3) lesson_progress — expand one row per entitled course_delivery
-- -----------------------------------------------------------------------------
CREATE TEMP TABLE _tmp_lesson_progress_course_delivery ON COMMIT DROP AS
SELECT * FROM public.lesson_progress;

DELETE FROM public.lesson_progress;

INSERT INTO public.lesson_progress (
  id,
  user_id,
  lesson_id,
  institution_id,
  last_position,
  completed_at,
  created_at,
  updated_at,
  course_delivery_id
)
SELECT
  gen_random_uuid(),
  b.user_id,
  b.lesson_id,
  b.institution_id,
  b.last_position,
  b.completed_at,
  b.created_at,
  b.updated_at,
  cd.id
FROM _tmp_lesson_progress_course_delivery b
INNER JOIN public.lessons l ON b.lesson_id = l.id
INNER JOIN public.topics t ON l.topic_id = t.id
INNER JOIN public.course_deliveries cd
  ON t.course_id = cd.course_id
 AND cd.deleted_at IS NULL
INNER JOIN public.classroom_members cm
  ON cd.classroom_id = cm.classroom_id
 AND b.user_id = cm.user_id
 AND cm.withdrawn_at IS NULL
INNER JOIN public.course_version_lessons cvl
  ON b.lesson_id = cvl.source_lesson_id
INNER JOIN public.course_version_topics cvt
  ON cvl.course_version_topic_id = cvt.id
 AND cd.course_version_id = cvt.course_version_id;

-- -----------------------------------------------------------------------------
-- 4) learning_events — expand one row per entitled course_delivery
-- -----------------------------------------------------------------------------
CREATE TEMP TABLE _tmp_learning_events_course_delivery ON COMMIT DROP AS
SELECT * FROM public.learning_events;

DELETE FROM public.learning_events;

INSERT INTO public.learning_events (
  id,
  institution_id,
  user_id,
  course_id,
  lesson_id,
  event_type,
  slide_index,
  duration_ms,
  direction,
  metadata,
  created_at,
  course_delivery_id
)
SELECT
  gen_random_uuid(),
  b.institution_id,
  b.user_id,
  b.course_id,
  b.lesson_id,
  b.event_type,
  b.slide_index,
  b.duration_ms,
  b.direction,
  b.metadata,
  b.created_at,
  cd.id
FROM _tmp_learning_events_course_delivery b
INNER JOIN public.course_deliveries cd
  ON b.course_id = cd.course_id
 AND cd.deleted_at IS NULL
INNER JOIN public.classroom_members cm
  ON cd.classroom_id = cm.classroom_id
 AND b.user_id = cm.user_id
 AND cm.withdrawn_at IS NULL
INNER JOIN public.course_version_lessons cvl
  ON b.lesson_id = cvl.source_lesson_id
INNER JOIN public.course_version_topics cvt
  ON cvl.course_version_topic_id = cvt.id
 AND cd.course_version_id = cvt.course_version_id;

-- -----------------------------------------------------------------------------
-- 5) Constraints + indexes
-- -----------------------------------------------------------------------------
ALTER TABLE public.lesson_progress
  ALTER COLUMN course_delivery_id SET NOT NULL;

ALTER TABLE public.lesson_progress
  ADD CONSTRAINT fk_lesson_progress_course_deliveries
  FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE CASCADE;

ALTER TABLE public.learning_events
  ALTER COLUMN course_delivery_id SET NOT NULL;

ALTER TABLE public.learning_events
  ADD CONSTRAINT fk_learning_events_course_deliveries
  FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE CASCADE;

CREATE UNIQUE INDEX idx_lesson_progress_user_id_lesson_id_course_delivery_id
  ON public.lesson_progress (user_id, lesson_id, course_delivery_id);

CREATE INDEX idx_lesson_progress_course_delivery_id ON public.lesson_progress (course_delivery_id);
CREATE INDEX idx_lesson_progress_user_id_course_delivery_id ON public.lesson_progress (user_id, course_delivery_id);

CREATE INDEX idx_learning_events_course_delivery_id ON public.learning_events (course_delivery_id);
CREATE INDEX idx_learning_events_course_delivery_id_lesson_id_event_type
  ON public.learning_events (course_delivery_id, lesson_id, event_type);
CREATE INDEX idx_learning_events_user_id_course_delivery_id_created_at
  ON public.learning_events (user_id, course_delivery_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 6) updated_at triggers for course_versions, snapshot tables, course_deliveries
-- -----------------------------------------------------------------------------
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
