-- =============================================================================
-- COURSE DELIVERY — learning_events: add course_delivery_id
-- Schema-only step. Lock-down happens in 20260000000051.
-- Requires: 20260329000004_course_delivery_04_backfill_versions_deliveries.sql
-- =============================================================================

ALTER TABLE public.learning_events
  ADD COLUMN IF NOT EXISTS course_delivery_id uuid;

COMMENT ON COLUMN public.learning_events.course_delivery_id IS
  'Course delivery scope for delivery-aware learning analytics.';
