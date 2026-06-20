-- =============================================================================
-- NOTIFICATIONS — RLS (notification_events, user_notifications)
-- Requires: 20260000000072_notifications_06_triggers.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- notification_events
-- -----------------------------------------------------------------------------
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notification_events_all_super_admin ON public.notification_events;
CREATE POLICY notification_events_all_super_admin ON public.notification_events
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS notification_events_select_institution_admin ON public.notification_events;
CREATE POLICY notification_events_select_institution_admin ON public.notification_events
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS notification_events_select_recipient ON public.notification_events;
CREATE POLICY notification_events_select_recipient ON public.notification_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_notifications un
      WHERE un.notification_event_id = notification_events.id
        AND un.user_id = (SELECT app.auth_uid())
    )
  );

-- -----------------------------------------------------------------------------
-- user_notifications
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_notifications_all_super_admin ON public.user_notifications;
CREATE POLICY user_notifications_all_super_admin ON public.user_notifications
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS user_notifications_select_institution_admin ON public.user_notifications;
CREATE POLICY user_notifications_select_institution_admin ON public.user_notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.notification_events ne
      WHERE ne.id = user_notifications.notification_event_id
        AND ne.institution_id IN (SELECT app.admin_institution_ids())
    )
  );

DROP POLICY IF EXISTS user_notifications_select_own ON public.user_notifications;
CREATE POLICY user_notifications_select_own ON public.user_notifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS user_notifications_update_own ON public.user_notifications;
CREATE POLICY user_notifications_update_own ON public.user_notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT app.auth_uid()))
  WITH CHECK (user_id = (SELECT app.auth_uid()));
