-- =============================================================================
-- NOTIFICATIONS — trigger functions + DROP / CREATE TRIGGER
-- Split from 20260323000006_notifications.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DROP TRIGGER IF EXISTS np_updated_at ON public.notification_preferences;
DROP TRIGGER IF EXISTS trg_notification_preferences_set_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_set_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
