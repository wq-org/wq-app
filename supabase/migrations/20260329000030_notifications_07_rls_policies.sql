-- =============================================================================
-- NOTIFICATIONS — RLS (events, deliveries, preferences)
-- Requires: 20260329000029_notifications_06_triggers.sql
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
      FROM public.notification_deliveries nd
      WHERE nd.notification_event_id = notification_events.id
        AND nd.user_id = (SELECT app.auth_uid())
    )
  );

-- -----------------------------------------------------------------------------
-- notification_deliveries
-- -----------------------------------------------------------------------------
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notification_deliveries_all_super_admin ON public.notification_deliveries;
CREATE POLICY notification_deliveries_all_super_admin ON public.notification_deliveries
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS notification_deliveries_select_institution_admin ON public.notification_deliveries;
CREATE POLICY notification_deliveries_select_institution_admin ON public.notification_deliveries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.notification_events ne
      WHERE ne.id = notification_deliveries.notification_event_id
        AND ne.institution_id IN (SELECT app.admin_institution_ids())
    )
  );

DROP POLICY IF EXISTS notification_deliveries_select_own ON public.notification_deliveries;
CREATE POLICY notification_deliveries_select_own ON public.notification_deliveries
  FOR SELECT TO authenticated
  USING (user_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS notification_deliveries_update_own ON public.notification_deliveries;
CREATE POLICY notification_deliveries_update_own ON public.notification_deliveries
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT app.auth_uid()))
  WITH CHECK (user_id = (SELECT app.auth_uid()));

-- -----------------------------------------------------------------------------
-- notification_preferences
-- -----------------------------------------------------------------------------
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notification_preferences_all_super_admin ON public.notification_preferences;
CREATE POLICY notification_preferences_all_super_admin ON public.notification_preferences
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS notification_preferences_all_own ON public.notification_preferences;
CREATE POLICY notification_preferences_all_own ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = (SELECT app.auth_uid()))
  WITH CHECK (user_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS notification_preferences_select_institution_admin ON public.notification_preferences;
CREATE POLICY notification_preferences_select_institution_admin ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));
