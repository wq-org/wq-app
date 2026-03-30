-- =============================================================================
-- CHAT — enums (core + conversation_context_type; runs after course_delivery)
-- Requires: 20260329000008_course_delivery_08_attendance_functions.sql,
--           20260321000002_institution_admin (all parts)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.conversation_type AS ENUM (
    'direct',
    'group',
    'institution_group',
    'classroom_channel',
    'course_delivery_channel',
    'task_group_channel',
    'support_thread'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.conversation_membership_role AS ENUM (
    'owner',
    'moderator',
    'participant'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.conversation_context_type AS ENUM (
    'none',
    'classroom',
    'course_delivery',
    'task',
    'game_session'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
