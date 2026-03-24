-- =============================================================================
-- GAME RUNTIME — CREATE TYPE / enum blocks
-- Split from 20260323000003_game_runtime.sql
-- Requires: 20260321000002_institution_admin (all parts), 20260323000002 (all parts)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE game_run_mode AS ENUM ('solo', 'versus', 'classroom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE game_run_status AS ENUM ('lobby', 'active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
