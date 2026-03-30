-- =============================================================================
-- CHAT — indexes (core + conversation_contexts)
-- Requires: 20260329000010_chat_02_tables.sql
-- =============================================================================

CREATE INDEX idx_conversations_institution_id ON public.conversations (institution_id);
CREATE INDEX idx_conversations_created_by ON public.conversations (created_by);
CREATE INDEX idx_conversations_classroom_id ON public.conversations (classroom_id) WHERE classroom_id IS NOT NULL;
CREATE INDEX idx_conversations_archived_at ON public.conversations (archived_at) WHERE archived_at IS NULL;

CREATE UNIQUE INDEX idx_conversation_members_conversation_id_user_id_active
  ON public.conversation_members (conversation_id, user_id)
  WHERE left_at IS NULL AND removed_at IS NULL;

CREATE INDEX idx_conversation_members_user_id_active
  ON public.conversation_members (user_id)
  WHERE left_at IS NULL AND removed_at IS NULL;

CREATE INDEX idx_conversation_members_institution_id ON public.conversation_members (institution_id);
CREATE INDEX idx_conversation_members_conversation_id ON public.conversation_members (conversation_id);

CREATE INDEX idx_messages_conversation_id_created_at ON public.messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX idx_messages_institution_id ON public.messages (institution_id);

CREATE INDEX idx_conversation_contexts_institution_id ON public.conversation_contexts (institution_id);
CREATE INDEX idx_conversation_contexts_classroom_id ON public.conversation_contexts (classroom_id)
  WHERE classroom_id IS NOT NULL;
CREATE INDEX idx_conversation_contexts_course_delivery_id ON public.conversation_contexts (course_delivery_id)
  WHERE course_delivery_id IS NOT NULL;
CREATE INDEX idx_conversation_contexts_task_id ON public.conversation_contexts (task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_conversation_contexts_game_session_id ON public.conversation_contexts (game_session_id)
  WHERE game_session_id IS NOT NULL;
