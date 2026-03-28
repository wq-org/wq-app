-- =============================================================================
-- CHAT — CREATE INDEX / CREATE UNIQUE INDEX
-- Split from 20260323000005_chat.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- conversations
CREATE INDEX idx_conversations_institution_id ON public.conversations (institution_id);
CREATE INDEX idx_conversations_created_by ON public.conversations (created_by);
CREATE INDEX idx_conversations_classroom_id ON public.conversations (classroom_id) WHERE classroom_id IS NOT NULL;

-- conversation_members
CREATE UNIQUE INDEX idx_conversation_members_conversation_id_user_id
  ON public.conversation_members (conversation_id, user_id)
  WHERE left_at IS NULL;

CREATE INDEX idx_conversation_members_user_id ON public.conversation_members (user_id) WHERE left_at IS NULL;
CREATE INDEX idx_conversation_members_institution_id ON public.conversation_members (institution_id);

-- messages
CREATE INDEX idx_messages_conversation_id_created_at ON public.messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX idx_messages_institution_id ON public.messages (institution_id);
