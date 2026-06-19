-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-BLOCK-ANALYTICS | DROP lesson_block_events + lesson_block_event_type (no-ops if suite skipped); KEEP lesson_blocks drops unless legacy blocks suite also removed | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- LESSON DRAFT JSONB — 04_retire_legacy_blocks (DDL only)
-- Drops normalized lesson_blocks authoring path after JSONB migration.
-- Per docs/architecture/principle_database.md: schema/DDL changes are not mixed with
-- data backfills (see 20260516000002_lesson_draft_jsonb_03_backfill_cleanup.sql).
-- Order: tables first (drops triggers), then functions, then types.
-- =============================================================================

-- HETZNER_TEARDOWN (WQ-BLOCK-ANALYTICS): omit when 2026050812010001/0002 never applied
DROP TABLE IF EXISTS public.lesson_block_events CASCADE;
DROP TABLE IF EXISTS public.lesson_blocks CASCADE;

DROP FUNCTION IF EXISTS public.upsert_lesson_blocks(uuid, jsonb, boolean);
DROP FUNCTION IF EXISTS public.lesson_blocks_before_insert_set_institution();
DROP FUNCTION IF EXISTS app.serialize_lesson_blocks_to_lexical(uuid);

-- HETZNER_TEARDOWN (WQ-BLOCK-ANALYTICS): omit when 2026050812010001 never applied
DROP TYPE IF EXISTS public.lesson_block_event_type;
