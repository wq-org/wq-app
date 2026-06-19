-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-LESSON-PROGRESS | strip §1 lesson_progress delivery backfill | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- COURSE DELIVERY — lesson_progress + learning_events: data backfill
-- Expands each existing progress / learning event row to one row per
-- entitled course_delivery (member of classroom hosting the delivery).
-- Per principle_database.md §10 this is isolated from schema changes.
-- Requires: 20260329000005a_lesson_progress_learning_events_columns.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) lesson_progress — expand one row per entitled course_delivery
-- HETZNER_TEARDOWN (WQ-LESSON-PROGRESS): safe to omit on fresh DB
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
-- 2) learning_events — expand one row per entitled course_delivery
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
