-- =============================================================================
-- NOTIFICATIONS — notification_events + user_notifications (in-app only)
-- Simplified to in-app delivery: one canonical event fact + one per-user inbox
-- row carrying read/dismiss state. No channels, no preferences, no categories
-- (removed for the minimal core; see the notification simplification note).
-- Requires: institutions, profiles, classrooms, course_deliveries,
--           task_deliveries, game_sessions, conversations.
-- =============================================================================

-- Replace any legacy notification tables (intentional migration-identity break).
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notification_deliveries CASCADE;

-- -----------------------------------------------------------------------------
-- notification_events — canonical domain event (one fact, many recipients)
-- -----------------------------------------------------------------------------
CREATE TABLE public.notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_user_id uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  title text NOT NULL,
  body text,
  dedupe_key text,
  link_payload jsonb,
  classroom_id uuid REFERENCES public.classrooms (id) ON DELETE SET NULL,
  course_delivery_id uuid REFERENCES public.course_deliveries (id) ON DELETE SET NULL,
  task_delivery_id uuid REFERENCES public.task_deliveries (id) ON DELETE SET NULL,
  game_session_id uuid REFERENCES public.game_sessions (id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.conversations (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notification_events IS
  'Canonical in-app notification fact; per-user read state lives on user_notifications.';
COMMENT ON COLUMN public.notification_events.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.notification_events.event_type IS 'Fine-grained code, e.g. chat_message, course_updated, game_updated.';
COMMENT ON COLUMN public.notification_events.actor_user_id IS 'User who caused the event, if any.';
COMMENT ON COLUMN public.notification_events.dedupe_key IS 'Optional stable key for idempotent emission (partial unique with institution_id).';
COMMENT ON COLUMN public.notification_events.link_payload IS 'UI routing only (route, tab, anchor).';
COMMENT ON COLUMN public.notification_events.classroom_id IS 'Optional classroom scope for deep links.';
COMMENT ON COLUMN public.notification_events.course_delivery_id IS 'Optional course delivery scope.';
COMMENT ON COLUMN public.notification_events.task_delivery_id IS 'Optional task delivery scope.';
COMMENT ON COLUMN public.notification_events.game_session_id IS 'Optional game session scope.';
COMMENT ON COLUMN public.notification_events.conversation_id IS 'Optional chat thread scope.';

-- -----------------------------------------------------------------------------
-- user_notifications — one row per recipient (in-app inbox + read/dismiss state)
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_event_id uuid NOT NULL REFERENCES public.notification_events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  read_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_notifications_event_user UNIQUE (notification_event_id, user_id)
);

COMMENT ON TABLE public.user_notifications IS
  'Per-user in-app inbox item for a notification_event (unread/read/dismiss state).';
COMMENT ON COLUMN public.user_notifications.notification_event_id IS 'Parent canonical event.';
COMMENT ON COLUMN public.user_notifications.user_id IS 'Recipient.';
COMMENT ON COLUMN public.user_notifications.read_at IS 'When the user marked read (NULL = unread).';
COMMENT ON COLUMN public.user_notifications.dismissed_at IS 'When the user dismissed the item.';
