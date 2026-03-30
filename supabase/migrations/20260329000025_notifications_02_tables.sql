-- =============================================================================
-- NOTIFICATIONS — notification_events, notification_deliveries, notification_preferences
-- Requires: 20260329000024_notifications_01_types.sql,
--           20260329000002_course_delivery_02_tables.sql,
--           20260329000010_chat_02_tables.sql,
--           20260323000004_tasks_notes_02_tables.sql,
--           20260323000003_game_runtime_02_tables.sql
-- =============================================================================

-- Replace legacy single-row-per-user model (intentional migration-identity break; see plan).
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;

-- -----------------------------------------------------------------------------
-- notification_events — canonical domain event (one fact, many deliveries)
-- -----------------------------------------------------------------------------
CREATE TABLE public.notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  event_type text NOT NULL,
  category text NOT NULL,
  actor_user_id uuid,
  title text NOT NULL,
  body text,
  dedupe_key text,
  link_payload jsonb,
  classroom_id uuid,
  course_delivery_id uuid,
  task_id uuid,
  game_session_id uuid,
  conversation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_notification_events_category CHECK (category IN ('learning', 'task', 'reward', 'social', 'system')),
  CONSTRAINT fk_notification_events_institutions FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_events_profiles_actor FOREIGN KEY (actor_user_id) REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_events_classrooms FOREIGN KEY (classroom_id) REFERENCES public.classrooms (id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_events_course_deliveries FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_events_tasks FOREIGN KEY (task_id) REFERENCES public.tasks (id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_events_game_sessions FOREIGN KEY (game_session_id) REFERENCES public.game_sessions (id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_events_conversations FOREIGN KEY (conversation_id) REFERENCES public.conversations (id) ON DELETE SET NULL
);

COMMENT ON TABLE public.notification_events IS
  'Canonical notification fact; per-user read state lives on notification_deliveries.';
COMMENT ON COLUMN public.notification_events.id IS 'Primary key.';
COMMENT ON COLUMN public.notification_events.institution_id IS
  'Tenant boundary (institution_id; aligns with platform-wide institution-scoped tenancy per db_design_principles).';
COMMENT ON COLUMN public.notification_events.event_type IS 'Fine-grained code (e.g. task_due_soon); not the user-facing category bucket.';
COMMENT ON COLUMN public.notification_events.category IS 'UI bucket: learning | task | reward | social | system.';
COMMENT ON COLUMN public.notification_events.actor_user_id IS 'User who caused the event, if any.';
COMMENT ON COLUMN public.notification_events.title IS 'Short headline shown in notification centre.';
COMMENT ON COLUMN public.notification_events.body IS 'Optional longer text.';
COMMENT ON COLUMN public.notification_events.dedupe_key IS 'Optional stable key for idempotent emission (partial unique with institution_id).';
COMMENT ON COLUMN public.notification_events.link_payload IS 'UI routing only (route, tab, anchor); not the sole source of context.';
COMMENT ON COLUMN public.notification_events.classroom_id IS 'Optional classroom scope for muting, analytics, and deep links.';
COMMENT ON COLUMN public.notification_events.course_delivery_id IS 'Optional course delivery scope.';
COMMENT ON COLUMN public.notification_events.task_id IS 'Optional task scope.';
COMMENT ON COLUMN public.notification_events.game_session_id IS 'Optional game session scope.';
COMMENT ON COLUMN public.notification_events.conversation_id IS 'Optional chat thread scope.';
COMMENT ON COLUMN public.notification_events.created_at IS 'Event creation time.';
COMMENT ON COLUMN public.notification_events.updated_at IS 'Last row update time; events are normally immutable after insert.';

-- -----------------------------------------------------------------------------
-- notification_deliveries — one row per recipient × channel
-- -----------------------------------------------------------------------------
CREATE TABLE public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  channel public.notification_delivery_channel NOT NULL DEFAULT 'in_app',
  delivered_at timestamptz,
  read_at timestamptz,
  dismissed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_notification_deliveries_notification_events FOREIGN KEY (notification_event_id) REFERENCES public.notification_events (id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_deliveries_profiles FOREIGN KEY (user_id) REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  CONSTRAINT uq_notification_deliveries_event_user_channel UNIQUE (notification_event_id, user_id, channel)
);

COMMENT ON TABLE public.notification_deliveries IS
  'Per-user delivery and read/dismiss state for a notification_event.';
COMMENT ON COLUMN public.notification_deliveries.notification_event_id IS 'Parent canonical event.';
COMMENT ON COLUMN public.notification_deliveries.user_id IS 'Recipient.';
COMMENT ON COLUMN public.notification_deliveries.channel IS 'in_app, email, or push.';
COMMENT ON COLUMN public.notification_deliveries.delivered_at IS 'When the channel considered delivery complete.';
COMMENT ON COLUMN public.notification_deliveries.read_at IS 'When the user marked read (in-app).';
COMMENT ON COLUMN public.notification_deliveries.dismissed_at IS 'When the user dismissed the item.';
COMMENT ON COLUMN public.notification_deliveries.failed_at IS 'When async delivery failed (email/push).';
COMMENT ON COLUMN public.notification_deliveries.created_at IS 'Row creation time.';
COMMENT ON COLUMN public.notification_deliveries.updated_at IS 'Last update time (e.g. read_at / dismissed_at changes).';

-- -----------------------------------------------------------------------------
-- notification_preferences — scoped overrides (base + classroom + delivery)
-- -----------------------------------------------------------------------------
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  category text NOT NULL,
  classroom_id uuid,
  course_delivery_id uuid,
  enabled boolean NOT NULL DEFAULT TRUE,
  email_digest text NOT NULL DEFAULT 'never',
  quiet_start time,
  quiet_end time,
  mute_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_notification_preferences_category CHECK (category IN ('learning', 'task', 'reward', 'social', 'system')),
  CONSTRAINT chk_notification_preferences_email_digest CHECK (email_digest IN ('daily', 'weekly', 'never')),
  CONSTRAINT fk_notification_preferences_profiles FOREIGN KEY (user_id) REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_preferences_institutions FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_preferences_classrooms FOREIGN KEY (classroom_id) REFERENCES public.classrooms (id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_preferences_course_deliveries FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE CASCADE,
  CONSTRAINT chk_notification_preferences_scope_shape CHECK (
    (classroom_id IS NULL AND course_delivery_id IS NULL)
    OR (classroom_id IS NOT NULL AND course_delivery_id IS NULL)
    OR (course_delivery_id IS NOT NULL)
  )
);

COMMENT ON TABLE public.notification_preferences IS
  'User notification settings: base row (no scope), classroom override, or course-delivery override.';
COMMENT ON COLUMN public.notification_preferences.id IS 'Primary key.';
COMMENT ON COLUMN public.notification_preferences.user_id IS 'Preference owner.';
COMMENT ON COLUMN public.notification_preferences.institution_id IS
  'Tenant boundary (institution_id; aligns with platform-wide institution-scoped tenancy).';
COMMENT ON COLUMN public.notification_preferences.category IS 'Same five buckets as notification_events.category.';
COMMENT ON COLUMN public.notification_preferences.classroom_id IS 'Set for classroom-level override; null on base rows.';
COMMENT ON COLUMN public.notification_preferences.course_delivery_id IS 'Set for delivery-level override; may coexist with classroom_id for denormalized context.';
COMMENT ON COLUMN public.notification_preferences.enabled IS 'Category (and scope) enabled when true.';
COMMENT ON COLUMN public.notification_preferences.email_digest IS 'Email digest frequency: daily, weekly, or never.';
COMMENT ON COLUMN public.notification_preferences.quiet_start IS 'Start of quiet hours (local wall time; interpretation is app-defined).';
COMMENT ON COLUMN public.notification_preferences.quiet_end IS 'End of quiet hours.';
COMMENT ON COLUMN public.notification_preferences.mute_until IS 'Temporary mute until this timestamp (UTC).';
COMMENT ON COLUMN public.notification_preferences.created_at IS 'Row creation time.';
COMMENT ON COLUMN public.notification_preferences.updated_at IS 'Last update time.';
