-- =============================================================================
-- CHAT — RLS (conversations, members, messages, conversation_contexts)
-- Requires: 20260329000012_chat_04_functions_rpcs.sql, 20260329000010_chat_02_tables.sql
-- =============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_all_super_admin ON public.conversations;
CREATE POLICY conversations_all_super_admin ON public.conversations
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS conversations_select_institution_admin ON public.conversations;
CREATE POLICY conversations_select_institution_admin ON public.conversations
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS conversations_insert_member ON public.conversations;
CREATE POLICY conversations_insert_member ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (SELECT app.auth_uid())
    AND institution_id IN (SELECT app.member_institution_ids())
  );

DROP POLICY IF EXISTS conversations_select_participant ON public.conversations;
CREATE POLICY conversations_select_participant ON public.conversations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT cm.conversation_id
      FROM public.conversation_members cm
      WHERE cm.user_id = (SELECT app.auth_uid())
        AND cm.left_at IS NULL
        AND cm.removed_at IS NULL
    )
    AND (SELECT app.caller_eligible_for_conversation_context(conversations.id))
  );

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_members_all_super_admin ON public.conversation_members;
CREATE POLICY conversation_members_all_super_admin ON public.conversation_members
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS conversation_members_select_institution_admin ON public.conversation_members;
CREATE POLICY conversation_members_select_institution_admin ON public.conversation_members
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS conversation_members_all_own ON public.conversation_members;
CREATE POLICY conversation_members_all_own ON public.conversation_members
  FOR ALL TO authenticated
  USING (user_id = (SELECT app.auth_uid()))
  WITH CHECK (user_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS conversation_members_all_conversation_creator ON public.conversation_members;
CREATE POLICY conversation_members_all_conversation_creator ON public.conversation_members
  FOR ALL TO authenticated
  USING (
    conversation_id IN (
      SELECT c.id
      FROM public.conversations c
      WHERE c.created_by = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT c.id
      FROM public.conversations c
      WHERE c.created_by = (SELECT app.auth_uid())
    )
  );

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS messages_all_super_admin ON public.messages;
CREATE POLICY messages_all_super_admin ON public.messages
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS messages_select_institution_admin ON public.messages;
CREATE POLICY messages_select_institution_admin ON public.messages
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS messages_select_participant ON public.messages;
CREATE POLICY messages_select_participant ON public.messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT cm.conversation_id
      FROM public.conversation_members cm
      WHERE cm.user_id = (SELECT app.auth_uid())
        AND cm.left_at IS NULL
        AND cm.removed_at IS NULL
    )
    AND (SELECT app.caller_eligible_for_conversation_context(messages.conversation_id))
  );

DROP POLICY IF EXISTS messages_insert_member ON public.messages;
CREATE POLICY messages_insert_member ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT app.auth_uid())
    AND conversation_id IN (
      SELECT cm.conversation_id
      FROM public.conversation_members cm
      WHERE cm.user_id = (SELECT app.auth_uid())
        AND cm.left_at IS NULL
        AND cm.removed_at IS NULL
    )
    AND (SELECT app.caller_eligible_for_conversation_context(messages.conversation_id))
  );

DROP POLICY IF EXISTS messages_update_own ON public.messages;
CREATE POLICY messages_update_own ON public.messages
  FOR UPDATE TO authenticated
  USING (sender_id = (SELECT app.auth_uid()))
  WITH CHECK (sender_id = (SELECT app.auth_uid()));

ALTER TABLE public.conversation_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_contexts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_contexts_all_super_admin ON public.conversation_contexts;
CREATE POLICY conversation_contexts_all_super_admin ON public.conversation_contexts
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS conversation_contexts_all_institution_admin ON public.conversation_contexts;
CREATE POLICY conversation_contexts_all_institution_admin ON public.conversation_contexts
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS conversation_contexts_select_member ON public.conversation_contexts;
CREATE POLICY conversation_contexts_select_member ON public.conversation_contexts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_contexts.conversation_id
        AND cm.user_id = (SELECT app.auth_uid())
        AND cm.left_at IS NULL
        AND cm.removed_at IS NULL
    )
    AND (SELECT app.caller_eligible_for_conversation_context(conversation_contexts.conversation_id))
  );

DROP POLICY IF EXISTS conversation_contexts_insert_conversation_creator ON public.conversation_contexts;
CREATE POLICY conversation_contexts_insert_conversation_creator ON public.conversation_contexts
  FOR INSERT TO authenticated
  WITH CHECK (
    institution_id IN (SELECT app.member_institution_ids())
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_contexts.conversation_id
        AND c.created_by = (SELECT app.auth_uid())
        AND c.institution_id = conversation_contexts.institution_id
    )
  );
