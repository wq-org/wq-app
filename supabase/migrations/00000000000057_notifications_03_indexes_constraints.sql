-- =============================================================================
-- NOTIFICATIONS — indexes (inbox + dedupe)
-- Requires: 20260000000069_notifications_02_tables.sql
-- =============================================================================

CREATE UNIQUE INDEX idx_notification_events_institution_id_dedupe_key
  ON public.notification_events (institution_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;

CREATE INDEX idx_notification_events_institution_id_created_at
  ON public.notification_events (institution_id, created_at DESC);

CREATE INDEX idx_notification_events_classroom_id_created_at
  ON public.notification_events (classroom_id, created_at DESC)
  WHERE classroom_id IS NOT NULL;

CREATE INDEX idx_notification_events_course_delivery_id_created_at
  ON public.notification_events (course_delivery_id, created_at DESC)
  WHERE course_delivery_id IS NOT NULL;

CREATE INDEX idx_user_notifications_user_id_read_at_created_at
  ON public.user_notifications (user_id, read_at, created_at DESC);

CREATE INDEX idx_user_notifications_user_id_created_at
  ON public.user_notifications (user_id, created_at DESC);

CREATE INDEX idx_user_notifications_notification_event_id
  ON public.user_notifications (notification_event_id);
