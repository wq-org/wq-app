-- =============================================================================
-- LESSON DRAFT JSONB — 04_retire_legacy_blocks (DDL only)
-- Drops normalized lesson_blocks authoring path after JSONB migration.
-- Per docs/architecture/principle_database.md: schema/DDL changes are not mixed with
-- data backfills (see 20260516000002_lesson_draft_jsonb_03_backfill_cleanup.sql).
-- Order: tables first (drops triggers), then functions, then types.
-- =============================================================================

DROP TABLE IF EXISTS public.lesson_block_events CASCADE;
DROP TABLE IF EXISTS public.lesson_blocks CASCADE;

DROP FUNCTION IF EXISTS public.upsert_lesson_blocks(uuid, jsonb, boolean);
DROP FUNCTION IF EXISTS public.lesson_blocks_before_insert_set_institution();
DROP FUNCTION IF EXISTS app.serialize_lesson_blocks_to_lexical(uuid);

DROP TYPE IF EXISTS public.lesson_block_event_type;
