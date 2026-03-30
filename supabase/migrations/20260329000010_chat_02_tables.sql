-- =============================================================================
-- CHAT — conversations, members, messages, conversation_contexts
-- Requires: 20260329000009_chat_01_types.sql, 20260329000002_course_delivery_02_tables.sql,
--           20260323000004_tasks_notes_02_tables.sql, 20260323000003_game_runtime_02_tables.sql
-- =============================================================================

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  type public.conversation_type NOT NULL DEFAULT 'direct',
  title text,
  created_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  classroom_id uuid REFERENCES public.classrooms (id) ON DELETE SET NULL,
  archived_at timestamptz,
  is_moderated boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.conversations IS 'Institution-scoped typed chat thread.';
COMMENT ON COLUMN public.conversations.id IS 'Primary key.';
COMMENT ON COLUMN public.conversations.institution_id IS 'Tenant boundary; RLS and policies scope by institution membership.';
COMMENT ON COLUMN public.conversations.type IS 'Channel kind (direct, group, classroom_channel, course_delivery_channel, etc.).';
COMMENT ON COLUMN public.conversations.title IS 'Display title for group channels; often NULL for direct threads.';
COMMENT ON COLUMN public.conversations.created_by IS 'User who created the thread.';
COMMENT ON COLUMN public.conversations.classroom_id IS 'Legacy optional classroom link; prefer conversation_contexts for scope.';
COMMENT ON COLUMN public.conversations.archived_at IS 'Soft archive timestamp; NULL when active.';
COMMENT ON COLUMN public.conversations.is_moderated IS 'Product flag for moderation workflows.';
COMMENT ON COLUMN public.conversations.created_at IS 'Creation time.';
COMMENT ON COLUMN public.conversations.updated_at IS 'Last metadata update.';

CREATE TABLE public.conversation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  membership_role public.conversation_membership_role NOT NULL DEFAULT 'participant',
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  removed_at timestamptz,
  removed_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  last_read_at timestamptz,
  is_muted boolean NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE public.conversation_members IS 'Membership in a conversation with role and lifecycle.';
COMMENT ON COLUMN public.conversation_members.id IS 'Primary key.';
COMMENT ON COLUMN public.conversation_members.conversation_id IS 'Parent conversation.';
COMMENT ON COLUMN public.conversation_members.institution_id IS 'Tenant boundary; must match conversation.';
COMMENT ON COLUMN public.conversation_members.user_id IS 'Member user.';
COMMENT ON COLUMN public.conversation_members.membership_role IS 'owner, moderator, or participant.';
COMMENT ON COLUMN public.conversation_members.joined_at IS 'When the user joined.';
COMMENT ON COLUMN public.conversation_members.left_at IS 'Voluntary leave; NULL while active.';
COMMENT ON COLUMN public.conversation_members.removed_at IS 'Removal time when moderated or revoked.';
COMMENT ON COLUMN public.conversation_members.removed_by IS 'Actor who removed the member, if applicable.';
COMMENT ON COLUMN public.conversation_members.last_read_at IS 'Last read cursor for unread counts.';
COMMENT ON COLUMN public.conversation_members.is_muted IS 'Muted state for this user in the thread.';

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  content jsonb DEFAULT '{}'::jsonb,
  attachments jsonb,
  reply_to_id uuid REFERENCES public.messages (id) ON DELETE SET NULL,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.messages IS 'Chat message within a conversation.';
COMMENT ON COLUMN public.messages.id IS 'Primary key.';
COMMENT ON COLUMN public.messages.conversation_id IS 'Parent thread.';
COMMENT ON COLUMN public.messages.institution_id IS 'Tenant boundary; must match conversation.';
COMMENT ON COLUMN public.messages.sender_id IS 'Author of the message.';
COMMENT ON COLUMN public.messages.content IS 'Lexical rich-text JSONB body.';
COMMENT ON COLUMN public.messages.attachments IS 'Structured attachment metadata.';
COMMENT ON COLUMN public.messages.reply_to_id IS 'Optional reply parent message.';
COMMENT ON COLUMN public.messages.edited_at IS 'Last edit time; NULL if never edited.';
COMMENT ON COLUMN public.messages.deleted_at IS 'Soft delete for retention/safeguarding.';
COMMENT ON COLUMN public.messages.created_at IS 'Insert time.';

CREATE TABLE public.conversation_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  context_type public.conversation_context_type NOT NULL DEFAULT 'none',
  classroom_id uuid,
  course_delivery_id uuid,
  task_id uuid,
  game_session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_conversation_contexts_conversations FOREIGN KEY (conversation_id) REFERENCES public.conversations (id) ON DELETE CASCADE,
  CONSTRAINT fk_conversation_contexts_institutions FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_conversation_contexts_classrooms FOREIGN KEY (classroom_id) REFERENCES public.classrooms (id) ON DELETE SET NULL,
  CONSTRAINT fk_conversation_contexts_course_deliveries FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE SET NULL,
  CONSTRAINT fk_conversation_contexts_tasks FOREIGN KEY (task_id) REFERENCES public.tasks (id) ON DELETE SET NULL,
  CONSTRAINT fk_conversation_contexts_game_sessions FOREIGN KEY (game_session_id) REFERENCES public.game_sessions (id) ON DELETE SET NULL,
  CONSTRAINT uq_conversation_contexts_conversation_id UNIQUE (conversation_id),
  CONSTRAINT chk_conversation_contexts_single_binding CHECK (
    (
      (classroom_id IS NOT NULL)::integer
      + (course_delivery_id IS NOT NULL)::integer
      + (task_id IS NOT NULL)::integer
      + (game_session_id IS NOT NULL)::integer
    ) <= 1
  )
);

COMMENT ON TABLE public.conversation_contexts IS
  'Optional structured binding for a conversation: at most one of classroom, course delivery, task, or game session.';
COMMENT ON COLUMN public.conversation_contexts.id IS 'Primary key.';
COMMENT ON COLUMN public.conversation_contexts.conversation_id IS 'Parent thread; one context row per conversation when used.';
COMMENT ON COLUMN public.conversation_contexts.institution_id IS 'Tenant boundary; must match parent conversation.institution_id (enforced by trigger).';
COMMENT ON COLUMN public.conversation_contexts.context_type IS 'Discriminator aligned with which optional FK is set.';
COMMENT ON COLUMN public.conversation_contexts.classroom_id IS 'Classroom-scoped channel context.';
COMMENT ON COLUMN public.conversation_contexts.course_delivery_id IS 'Course rollout instance for delivery-scoped chat.';
COMMENT ON COLUMN public.conversation_contexts.task_id IS 'Task-scoped collaboration (tasks table; no task_deliveries yet).';
COMMENT ON COLUMN public.conversation_contexts.game_session_id IS 'Game session / round context.';
COMMENT ON COLUMN public.conversation_contexts.created_at IS 'Row creation time.';
COMMENT ON COLUMN public.conversation_contexts.updated_at IS 'Last update time.';
