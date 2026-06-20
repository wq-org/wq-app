-- =============================================================================
-- NOTIFICATIONS — audit trigger (events only)
-- notification_events are immutable after insert (no updated_at trigger), and
-- per-user user_notifications read/dismiss state is not audited (UI noise).
-- Requires: 20260000000071_notifications_04_functions_rpcs.sql
-- =============================================================================

DROP TRIGGER IF EXISTS trg_notification_events_audit_row ON public.notification_events;
CREATE TRIGGER trg_notification_events_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.notification_events
  FOR EACH ROW EXECUTE FUNCTION audit.log_notification_events_audit();
