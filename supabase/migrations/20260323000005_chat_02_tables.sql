-- =============================================================================
-- CHAT — CREATE TABLE / ALTER TABLE ADD COLUMN
-- Split from 20260323000005_chat.sql
-- Requires: 20260321000002_institution_admin (all parts)
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
