-- =============================================================================
-- CHAT — CREATE TYPE / enum blocks
-- Split from 20260323000005_chat.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE conversation_type AS ENUM ('direct', 'group');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
