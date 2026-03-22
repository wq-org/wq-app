-- =============================================================================
-- PHASE E — Chat MVP (institution-scoped messaging)
--
-- Doc map:
--   11_Chat → conversations, conversation_members, messages
--   db_guide_line_en.md → FORCE RLS, institution_id, COMMENT ON
--
-- Moderation queue deferred to follow-up; reports logged via audit.log_event.
--
-- Requires: 20260321000002 (institution_memberships, app.*)
-- =============================================================================

-- =============================================================================
-- 1. ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE conversation_type AS ENUM ('direct', 'group');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 2. CONVERSATIONS
-- =============================================================================
CREATE TABLE public.conversations (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid              NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  type            conversation_type NOT NULL DEFAULT 'direct',
  title           text,
  created_by      uuid              NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  classroom_id    uuid              REFERENCES public.classrooms(id) ON DELETE SET NULL,
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.conversations                IS 'Institution-scoped chat conversation (doc 11).';
COMMENT ON COLUMN public.conversations.institution_id IS 'Tenant boundary — no cross-institution chat.';
COMMENT ON COLUMN public.conversations.type           IS 'direct = 1:1; group = multi-member.';
COMMENT ON COLUMN public.conversations.title          IS 'Display name for group chats; NULL for direct.';
COMMENT ON COLUMN public.conversations.classroom_id   IS 'Optional link to a classroom for group channels.';

CREATE INDEX idx_conversations_institution ON public.conversations (institution_id);
CREATE INDEX idx_conversations_created_by  ON public.conversations (created_by);
CREATE INDEX idx_conversations_classroom   ON public.conversations (classroom_id) WHERE classroom_id IS NOT NULL;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;

CREATE POLICY conv_super_admin ON public.conversations
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY conv_institution_admin ON public.conversations
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

CREATE POLICY conv_member_insert ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (select app.auth_uid())
    AND institution_id IN (select app.member_institution_ids())
  );

CREATE POLICY conv_participant_read ON public.conversations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT cm.conversation_id FROM public.conversation_members cm
      WHERE cm.user_id = (select app.auth_uid())
    )
  );

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. CONVERSATION_MEMBERS
-- =============================================================================
CREATE TABLE public.conversation_members (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  left_at         timestamptz,
  last_read_at    timestamptz,
  is_muted        boolean     NOT NULL DEFAULT false
);

COMMENT ON TABLE  public.conversation_members                IS 'Membership in a conversation (doc 11).';
COMMENT ON COLUMN public.conversation_members.institution_id IS 'Tenant boundary; must match conversation.';
COMMENT ON COLUMN public.conversation_members.last_read_at   IS 'Timestamp of last read for unread badge logic.';

CREATE UNIQUE INDEX idx_cm_conv_user
  ON public.conversation_members (conversation_id, user_id)
  WHERE left_at IS NULL;

CREATE INDEX idx_cm_user        ON public.conversation_members (user_id) WHERE left_at IS NULL;
CREATE INDEX idx_cm_institution ON public.conversation_members (institution_id);

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members FORCE ROW LEVEL SECURITY;

CREATE POLICY cm_super_admin ON public.conversation_members
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY cm_institution_admin ON public.conversation_members
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

CREATE POLICY cm_own ON public.conversation_members
  FOR ALL TO authenticated
  USING  (user_id = (select app.auth_uid()))
  WITH CHECK (user_id = (select app.auth_uid()));

CREATE POLICY cm_creator_manage ON public.conversation_members
  FOR ALL TO authenticated
  USING (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.created_by = (select app.auth_uid())
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.created_by = (select app.auth_uid())
    )
  );

-- =============================================================================
-- 4. MESSAGES
-- =============================================================================
CREATE TABLE public.messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  sender_id       uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content         text,
  attachments     jsonb,
  reply_to_id     uuid        REFERENCES public.messages(id) ON DELETE SET NULL,
  edited_at       timestamptz,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.messages                IS 'Chat message within a conversation (doc 11).';
COMMENT ON COLUMN public.messages.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.messages.attachments    IS 'Array of {type, url, name}: images, files, deep links.';
COMMENT ON COLUMN public.messages.reply_to_id    IS 'For reply-to-message threading.';

CREATE INDEX idx_messages_conversation ON public.messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender       ON public.messages (sender_id);
CREATE INDEX idx_messages_institution  ON public.messages (institution_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

CREATE POLICY msg_super_admin ON public.messages
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY msg_institution_admin_read ON public.messages
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

CREATE POLICY msg_participant_read ON public.messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT cm.conversation_id FROM public.conversation_members cm
      WHERE cm.user_id = (select app.auth_uid())
        AND cm.left_at IS NULL
    )
  );

CREATE POLICY msg_member_insert ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (select app.auth_uid())
    AND conversation_id IN (
      SELECT cm.conversation_id FROM public.conversation_members cm
      WHERE cm.user_id = (select app.auth_uid())
        AND cm.left_at IS NULL
    )
  );

CREATE POLICY msg_own_update ON public.messages
  FOR UPDATE TO authenticated
  USING  (sender_id = (select app.auth_uid()))
  WITH CHECK (sender_id = (select app.auth_uid()));
