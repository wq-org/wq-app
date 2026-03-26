-- =============================================================================
-- NOTIFICATIONS — CREATE INDEX / CREATE UNIQUE INDEX
-- Split from 20260323000006_notifications.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

CREATE INDEX idx_notifications_user_id_is_read_created_at        ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_institution_id ON public.notifications (institution_id);

CREATE UNIQUE INDEX idx_notification_preferences_user_id_institution_id_category
  ON public.notification_preferences (user_id, institution_id, category);

CREATE INDEX idx_notification_preferences_institution_id ON public.notification_preferences (institution_id);
