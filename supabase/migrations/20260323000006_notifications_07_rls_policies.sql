-- =============================================================================
-- NOTIFICATIONS — ENABLE / FORCE RLS, DROP / CREATE POLICY
-- Split from 20260323000006_notifications.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

CREATE POLICY notif_super_admin ON public.notifications
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY notif_own ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

CREATE POLICY notif_own_update ON public.notifications
  FOR UPDATE TO authenticated
  USING  (user_id = (select app.auth_uid()))
  WITH CHECK (user_id = (select app.auth_uid()));

CREATE POLICY notif_institution_admin_read ON public.notifications
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

-- notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences FORCE ROW LEVEL SECURITY;

CREATE POLICY np_super_admin ON public.notification_preferences
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY np_own ON public.notification_preferences
  FOR ALL TO authenticated
  USING  (user_id = (select app.auth_uid()))
  WITH CHECK (user_id = (select app.auth_uid()));

CREATE POLICY np_institution_admin_read ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));
