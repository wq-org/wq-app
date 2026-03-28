-- =============================================================================
-- NOTIFICATIONS — ENABLE / FORCE RLS, DROP / CREATE POLICY
-- Split from 20260323000006_notifications.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notif_super_admin ON public.notifications;
DROP POLICY IF EXISTS notifications_all_super_admin ON public.notifications;
CREATE POLICY notifications_all_super_admin ON public.notifications
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS notif_own ON public.notifications;
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS notif_own_update ON public.notifications;
DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT app.auth_uid()))
  WITH CHECK (user_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS notif_institution_admin_read ON public.notifications;
DROP POLICY IF EXISTS notifications_select_institution_admin ON public.notifications;
CREATE POLICY notifications_select_institution_admin ON public.notifications
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS np_super_admin ON public.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_all_super_admin ON public.notification_preferences;
CREATE POLICY notification_preferences_all_super_admin ON public.notification_preferences
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS np_own ON public.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_all_own ON public.notification_preferences;
CREATE POLICY notification_preferences_all_own ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = (SELECT app.auth_uid()))
  WITH CHECK (user_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS np_institution_admin_read ON public.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_select_institution_admin ON public.notification_preferences;
CREATE POLICY notification_preferences_select_institution_admin ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));
