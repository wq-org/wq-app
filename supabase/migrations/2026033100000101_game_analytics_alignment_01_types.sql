-- =============================================================================
-- GAME ANALYTICS ALIGNMENT — types
-- Requires: 20260326000003_game_versions_06_rls_policies.sql,
--           20260329000007_course_delivery_07_rls_policies.sql
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'game_delivery_status'
  ) THEN
    CREATE TYPE public.game_delivery_status AS ENUM (
      'draft',
      'published',
      'archived',
      'canceled'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'game_run_context'
  ) THEN
    CREATE TYPE public.game_run_context AS ENUM (
      'delivery_assigned',
      'solo_library',
      'versus_invite',
      'teacher_launched_session'
    );
  END IF;
END;
$$;
