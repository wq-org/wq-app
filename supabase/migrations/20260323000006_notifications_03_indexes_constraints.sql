-- =============================================================================
-- NOTIFICATIONS — CREATE INDEX / CREATE UNIQUE INDEX
-- Split from 20260323000006_notifications.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

CREATE INDEX idx_notifications_user        ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_institution ON public.notifications (institution_id);

CREATE UNIQUE INDEX idx_np_user_category
  ON public.notification_preferences (user_id, institution_id, category);

CREATE INDEX idx_np_institution ON public.notification_preferences (institution_id);
