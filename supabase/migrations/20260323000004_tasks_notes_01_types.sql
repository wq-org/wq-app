-- =============================================================================
-- TASKS & NOTES — Types & enums
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'draft', 'published', 'not_started', 'in_progress',
    'submitted', 'overdue', 'reviewed', 'returned'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE note_scope AS ENUM ('personal', 'collaborative');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('submitted', 'reviewed', 'returned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
