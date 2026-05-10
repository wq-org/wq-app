-- =============================================================================
-- lesson_blocks size guard — final defense against malformed clients.
-- Client side: PasteGuardPlugin (10k chars / 50KB per paste) +
--              useLessonAutosave (200KB whole-document hard cap).
-- DB side: hard cap on per-block serialized JSONB.
-- =============================================================================

ALTER TABLE public.lesson_blocks
DROP CONSTRAINT IF EXISTS chk_lesson_blocks_value_size;

ALTER TABLE public.lesson_blocks
ADD CONSTRAINT chk_lesson_blocks_value_size
CHECK (octet_length(value::text) <= 102400);

COMMENT ON CONSTRAINT chk_lesson_blocks_value_size ON public.lesson_blocks IS
  'Hard cap: a single serialized Lexical block must not exceed 100 KB. '
  'Paired with client-side PasteGuardPlugin (~50KB per paste, 10k chars) and '
  'useLessonAutosave (200KB whole-document UX guard). DB constraint is the final '
  'safety net so a malformed client cannot corrupt rows or balloon storage.';
