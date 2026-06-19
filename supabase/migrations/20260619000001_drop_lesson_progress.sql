-- HETZNER_TEARDOWN: WQ-LESSON-PROGRESS | Strategy 1 — DROP lesson_progress (current-state snapshot; never used in app; use learning_events for history) | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- LESSON PROGRESS — teardown (Strategy 1: existing DBs)
-- Fresh Hetzner DB (Strategy 2): omit all lesson_progress CREATE/RLS/index sections
-- tagged PARTIAL_SAFE_TO_DELETE_LATER in earlier migrations instead of applying this drop.
-- =============================================================================

DROP TABLE IF EXISTS public.lesson_progress CASCADE;
