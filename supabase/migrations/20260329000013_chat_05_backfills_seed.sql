-- =============================================================================
-- CHAT — backfill conversation_contexts from legacy conversations.classroom_id
-- Requires: 20260329000010_chat_02_tables.sql
-- =============================================================================

INSERT INTO public.conversation_contexts (
  id,
  conversation_id,
  institution_id,
  context_type,
  classroom_id,
  course_delivery_id,
  task_id,
  game_session_id,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  c.id,
  c.institution_id,
  'classroom'::public.conversation_context_type,
  c.classroom_id,
  NULL,
  NULL,
  NULL,
  now(),
  now()
FROM public.conversations c
WHERE c.classroom_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.conversation_contexts cc
    WHERE cc.conversation_id = c.id
  );
