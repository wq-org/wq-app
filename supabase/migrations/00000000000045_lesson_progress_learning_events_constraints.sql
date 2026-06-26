-- =============================================================================
-- COURSE DELIVERY — learning_events: lock-down constraints
-- Promotes course_delivery_id to NOT NULL, adds FK and indexes.
-- Requires: 20260000000050_lesson_progress_learning_events_columns.sql
-- =============================================================================

ALTER TABLE public.learning_events
  ALTER COLUMN course_delivery_id SET NOT NULL;

ALTER TABLE public.learning_events
  ADD CONSTRAINT fk_learning_events_course_deliveries
  FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE CASCADE;

CREATE INDEX idx_learning_events_course_delivery_id
  ON public.learning_events (course_delivery_id);

CREATE INDEX idx_learning_events_course_delivery_id_lesson_id_event_type
  ON public.learning_events (course_delivery_id, lesson_id, event_type);

CREATE INDEX idx_learning_events_user_id_course_delivery_id_created_at
  ON public.learning_events (user_id, course_delivery_id, created_at DESC);
