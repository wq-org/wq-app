-- =============================================================================
-- PHASE F — Notifications MVP
--
-- Doc map:
--   12_Notification → notifications, notification_preferences
--   db_guide_line_en.md → FORCE RLS, institution_id, COMMENT ON
--
-- In-app notification centre; email digest opt-in per preferences.
-- Service role / edge functions insert notifications; users read/update own.
--
-- Requires: 20260321000002 (institution_memberships, app.*)
-- =============================================================================

-- =============================================================================
-- 1. NOTIFICATIONS — in-app notification items
-- =============================================================================
CREATE TABLE public.notifications (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  category        text        NOT NULL,
  title           text        NOT NULL,
  body            text,
  data            jsonb,
  is_read         boolean     NOT NULL DEFAULT false,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.notifications                IS 'In-app notification items (doc 12).';
COMMENT ON COLUMN public.notifications.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.notifications.category       IS 'Notification category: learning, task, reward, social, system.';
COMMENT ON COLUMN public.notifications.data           IS 'Structured payload for deep linking: {type, ref_id, action_url}.';

CREATE INDEX idx_notifications_user        ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_institution ON public.notifications (institution_id);

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

-- =============================================================================
-- 2. NOTIFICATION_PREFERENCES — per-user settings
-- =============================================================================
CREATE TABLE public.notification_preferences (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  category        text        NOT NULL,
  enabled         boolean     NOT NULL DEFAULT true,
  email_digest    text        NOT NULL DEFAULT 'never'
    CHECK (email_digest IN ('daily', 'weekly', 'never')),
  quiet_start     time,
  quiet_end       time,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.notification_preferences                IS 'Per-user notification preferences per category (doc 12).';
COMMENT ON COLUMN public.notification_preferences.institution_id IS 'Tenant boundary; preferences are institution-scoped.';
COMMENT ON COLUMN public.notification_preferences.category       IS 'Matches notifications.category for filtering.';
COMMENT ON COLUMN public.notification_preferences.email_digest   IS 'Email digest frequency: daily, weekly, or never.';
COMMENT ON COLUMN public.notification_preferences.quiet_start    IS 'Start of quiet hours (no notifications).';
COMMENT ON COLUMN public.notification_preferences.quiet_end      IS 'End of quiet hours.';

CREATE UNIQUE INDEX idx_np_user_category
  ON public.notification_preferences (user_id, institution_id, category);

CREATE INDEX idx_np_institution ON public.notification_preferences (institution_id);

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

DROP TRIGGER IF EXISTS np_updated_at ON public.notification_preferences;
CREATE TRIGGER np_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
