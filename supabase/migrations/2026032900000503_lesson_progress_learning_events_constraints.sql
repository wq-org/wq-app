-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-LESSON-PROGRESS | strip lesson_progress constraints/indexes (keep learning_events) | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- COURSE DELIVERY — lesson_progress + learning_events: lock-down constraints
-- Promotes course_delivery_id to NOT NULL, adds FKs and indexes.
-- Requires: 20260329000005b_lesson_progress_learning_events_backfill.sql
-- =============================================================================

-- HETZNER_TEARDOWN (WQ-LESSON-PROGRESS): safe to omit on fresh DB
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

-- HETZNER_TEARDOWN (WQ-LESSON-PROGRESS): safe to omit on fresh DB
CREATE UNIQUE INDEX idx_lesson_progress_user_id_lesson_id_course_delivery_id
  ON public.lesson_progress (user_id, lesson_id, course_delivery_id);

CREATE INDEX idx_lesson_progress_course_delivery_id
  ON public.lesson_progress (course_delivery_id);

CREATE INDEX idx_lesson_progress_user_id_course_delivery_id
  ON public.lesson_progress (user_id, course_delivery_id);

CREATE INDEX idx_learning_events_course_delivery_id
  ON public.learning_events (course_delivery_id);

CREATE INDEX idx_learning_events_course_delivery_id_lesson_id_event_type
  ON public.learning_events (course_delivery_id, lesson_id, event_type);

CREATE INDEX idx_learning_events_user_id_course_delivery_id_created_at
  ON public.learning_events (user_id, course_delivery_id, created_at DESC);
