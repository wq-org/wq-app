-- HETZNER_TEARDOWN: SAFE_TO_DELETE_LATER | WQ-ATTENDANCE | attendance_topic_gates suite | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- ATTENDANCE + TOPIC GATES — backfills & seed
-- Requires: 20260326000004_attendance_topic_gates_04_functions_rpcs
-- =============================================================================

-- No required backfill for existing data.
-- Default behavior remains unlocked topics when no topic_availability_rules row exists.
