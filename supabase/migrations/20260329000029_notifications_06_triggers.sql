-- =============================================================================
-- NOTIFICATIONS — audit + updated_at triggers
-- Requires: 20260329000028_notifications_05_backfills_seed.sql
-- =============================================================================

DROP TRIGGER IF EXISTS trg_notification_events_set_updated_at ON public.notification_events;
CREATE TRIGGER trg_notification_events_set_updated_at
  BEFORE UPDATE ON public.notification_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_notification_deliveries_set_updated_at ON public.notification_deliveries;
CREATE TRIGGER trg_notification_deliveries_set_updated_at
  BEFORE UPDATE ON public.notification_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_notification_events_audit_row ON public.notification_events;
CREATE TRIGGER trg_notification_events_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.notification_events
  FOR EACH ROW EXECUTE FUNCTION audit.log_notification_events_audit();

DROP TRIGGER IF EXISTS trg_notification_deliveries_audit_row ON public.notification_deliveries;
CREATE TRIGGER trg_notification_deliveries_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.notification_deliveries
  FOR EACH ROW EXECUTE FUNCTION audit.log_notification_deliveries_audit();

DROP TRIGGER IF EXISTS trg_notification_preferences_set_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_set_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_notification_preferences_audit_row ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION audit.log_notification_preferences_audit();
