-- =============================================================================
-- NOTIFICATIONS — indexes (inbox, dedupe, scoped preferences, analytics)
-- Requires: 20260329000025_notifications_02_tables.sql
-- =============================================================================

CREATE UNIQUE INDEX idx_notification_events_institution_dedupe_key
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

CREATE INDEX idx_notification_events_category_created_at
  ON public.notification_events (category, created_at DESC);

CREATE INDEX idx_notification_deliveries_user_id_read_at_created_at
  ON public.notification_deliveries (user_id, read_at, created_at DESC);

CREATE INDEX idx_notification_deliveries_user_id_created_at
  ON public.notification_deliveries (user_id, created_at DESC);

CREATE INDEX idx_notification_deliveries_notification_event_id
  ON public.notification_deliveries (notification_event_id);

CREATE UNIQUE INDEX idx_notification_preferences_user_institution_category_base
  ON public.notification_preferences (user_id, institution_id, category)
  WHERE classroom_id IS NULL AND course_delivery_id IS NULL;

CREATE UNIQUE INDEX idx_notification_preferences_user_institution_category_classroom
  ON public.notification_preferences (user_id, institution_id, category, classroom_id)
  WHERE classroom_id IS NOT NULL AND course_delivery_id IS NULL;

CREATE UNIQUE INDEX idx_notification_preferences_user_institution_category_course_delivery
  ON public.notification_preferences (user_id, institution_id, category, course_delivery_id)
  WHERE course_delivery_id IS NOT NULL;

CREATE INDEX idx_notification_preferences_institution_id ON public.notification_preferences (institution_id);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences (user_id);
