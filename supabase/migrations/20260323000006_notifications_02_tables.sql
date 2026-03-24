-- =============================================================================
-- NOTIFICATIONS — CREATE TABLE / ALTER TABLE ADD COLUMN
-- Split from 20260323000006_notifications.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- 1. NOTIFICATIONS — in-app notification items
CREATE TABLE public.notifications (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  category        text        NOT NULL
    CHECK (category IN ('learning', 'task', 'reward', 'social', 'system')),
  title           text        NOT NULL,
  body            text,
  data            jsonb,
  is_read         boolean     NOT NULL DEFAULT false,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.notifications                IS 'In-app notification items (doc 12).';
COMMENT ON COLUMN public.notifications.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.notifications.category       IS 'Channel bucket: learning | task | reward | social | system (CHECK).';
COMMENT ON COLUMN public.notifications.data           IS 'Structured payload for deep linking: {type, ref_id, action_url}.';

-- 2. NOTIFICATION_PREFERENCES — per-user settings
CREATE TABLE public.notification_preferences (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  category        text        NOT NULL
    CHECK (category IN ('learning', 'task', 'reward', 'social', 'system')),
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
COMMENT ON COLUMN public.notification_preferences.category       IS 'Same allowed values as notifications.category (CHECK); one row per (user, institution, category).';
COMMENT ON COLUMN public.notification_preferences.email_digest   IS 'Email digest frequency: daily, weekly, or never.';
COMMENT ON COLUMN public.notification_preferences.quiet_start    IS 'Start of quiet hours (no notifications).';
COMMENT ON COLUMN public.notification_preferences.quiet_end      IS 'End of quiet hours.';
