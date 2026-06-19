-- HETZNER_TEARDOWN: SAFE_TO_DELETE_LATER | WQ-BLOCK-ANALYTICS | lesson_block_events + lesson_block_event_type (retired; never used in app; dropped in 20260516000003) | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- ⚠️ RETIRED TABLE — DO NOT USE. lesson_block_events no longer exists in the
-- live schema. It is created here, then DROPPED by:
--   20260516000003_lesson_draft_jsonb_04_retire_legacy_blocks.sql
-- (after a one-time data copy into learning_events in
--   20260516000002_lesson_draft_jsonb_03_backfill_cleanup.sql).
-- Block-level analytics now live as optional columns / metadata on
-- learning_events (event_type 'interaction_recorded'). No app code reads this.
--
-- This file is kept ONLY as immutable migration history so fresh databases can
-- replay the create→backfill→drop sequence in order. Do NOT delete this file
-- (the backfill in …03 reads FROM lesson_block_events during replay), and do
-- NOT add new references to this table.
-- =============================================================================
-- LESSON BLOCK EVENTS — type, table, indexes
-- Append-only block-level analytics. RLS lives in sibling _02 file.
-- Requires: 20260508120000_lesson_blocks_01_tables.sql
-- =============================================================================

CREATE TYPE public.lesson_block_event_type AS ENUM (
  'block_viewed',
  'block_time_spent',
  'block_skipped',
  'block_revisited',
  'block_focused',
  'block_copied',
  'block_link_clicked'
);

COMMENT ON TYPE public.lesson_block_event_type IS
  'RETIRED — dropped in 20260516000003. HETZNER_TEARDOWN: SAFE_TO_DELETE_LATER (WQ-BLOCK-ANALYTICS). Use learning_events.block_index/block_type instead.';

CREATE TABLE IF NOT EXISTS public.lesson_block_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  block_id UUID NOT NULL,
  course_delivery_id UUID,
  user_id UUID NOT NULL,
  event_type public.lesson_block_event_type NOT NULL,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_lesson_block_events PRIMARY KEY (id),
  CONSTRAINT fk_lesson_block_events_institutions FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_block_events_lessons FOREIGN KEY (lesson_id) REFERENCES public.lessons (id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_block_events_lesson_blocks FOREIGN KEY (block_id) REFERENCES public.lesson_blocks (id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_block_events_course_deliveries FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE SET NULL,
  CONSTRAINT fk_lesson_block_events_users FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

COMMENT ON TABLE public.lesson_block_events IS
  'RETIRED — append-only block analytics; dropped in 20260516000003. HETZNER_TEARDOWN: SAFE_TO_DELETE_LATER (WQ-BLOCK-ANALYTICS). Never used in app; use learning_events instead.';

COMMENT ON COLUMN public.lesson_block_events.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.lesson_block_events.lesson_id IS 'Lesson containing the block.';
COMMENT ON COLUMN public.lesson_block_events.block_id IS 'lesson_blocks row the event refers to.';
COMMENT ON COLUMN public.lesson_block_events.course_delivery_id IS 'Delivery scope; NULL for teacher preview.';
COMMENT ON COLUMN public.lesson_block_events.user_id IS 'Actor (student); GDPR anonymise on erasure.';
COMMENT ON COLUMN public.lesson_block_events.event_type IS 'Interaction kind.';
COMMENT ON COLUMN public.lesson_block_events.duration_ms IS 'Visible/active ms for block_time_spent.';
COMMENT ON COLUMN public.lesson_block_events.metadata IS 'Non-PII payload (scroll depth, link URL, etc.).';
COMMENT ON COLUMN public.lesson_block_events.created_at IS 'Insert time.';

CREATE INDEX IF NOT EXISTS idx_lesson_block_events_lesson_created_at
  ON public.lesson_block_events (lesson_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_block_events_block_event_type
  ON public.lesson_block_events (block_id, event_type);

CREATE INDEX IF NOT EXISTS idx_lesson_block_events_user_lesson
  ON public.lesson_block_events (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_block_events_delivery_id
  ON public.lesson_block_events (course_delivery_id)
  WHERE course_delivery_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lesson_block_events_institution_id
  ON public.lesson_block_events (institution_id);
