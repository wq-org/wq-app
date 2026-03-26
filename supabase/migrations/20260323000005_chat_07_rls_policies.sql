-- =============================================================================
-- CHAT — ENABLE/FORCE RLS, DROP/CREATE POLICY
-- Split from 20260323000005_chat.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conv_super_admin ON public.conversations;
DROP POLICY IF EXISTS conversations_all_super_admin ON public.conversations;
CREATE POLICY conversations_all_super_admin ON public.conversations
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS conv_institution_admin ON public.conversations;
DROP POLICY IF EXISTS conversations_select_institution_admin ON public.conversations;
CREATE POLICY conversations_select_institution_admin ON public.conversations
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

DROP POLICY IF EXISTS conv_member_insert ON public.conversations;
DROP POLICY IF EXISTS conversations_insert_member ON public.conversations;
CREATE POLICY conversations_insert_member ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (select app.auth_uid())
    AND institution_id IN (select app.member_institution_ids())
  );

DROP POLICY IF EXISTS conv_participant_read ON public.conversations;
DROP POLICY IF EXISTS conversations_select_participant ON public.conversations;
CREATE POLICY conversations_select_participant ON public.conversations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT cm.conversation_id FROM public.conversation_members cm
      WHERE cm.user_id = (select app.auth_uid())
    )
  );

-- conversation_members
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cm_super_admin ON public.conversation_members;
DROP POLICY IF EXISTS conversation_members_all_super_admin ON public.conversation_members;
CREATE POLICY conversation_members_all_super_admin ON public.conversation_members
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS cm_institution_admin ON public.conversation_members;
DROP POLICY IF EXISTS conversation_members_select_institution_admin ON public.conversation_members;
CREATE POLICY conversation_members_select_institution_admin ON public.conversation_members
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

DROP POLICY IF EXISTS cm_own ON public.conversation_members;
DROP POLICY IF EXISTS conversation_members_all_own ON public.conversation_members;
CREATE POLICY conversation_members_all_own ON public.conversation_members
  FOR ALL TO authenticated
  USING  (user_id = (select app.auth_uid()))
  WITH CHECK (user_id = (select app.auth_uid()));

DROP POLICY IF EXISTS cm_creator_manage ON public.conversation_members;
DROP POLICY IF EXISTS conversation_members_all_conversation_creator ON public.conversation_members;
CREATE POLICY conversation_members_all_conversation_creator ON public.conversation_members
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

-- messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS msg_super_admin ON public.messages;
DROP POLICY IF EXISTS messages_all_super_admin ON public.messages;
CREATE POLICY messages_all_super_admin ON public.messages
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS msg_institution_admin_read ON public.messages;
DROP POLICY IF EXISTS messages_select_institution_admin ON public.messages;
CREATE POLICY messages_select_institution_admin ON public.messages
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

DROP POLICY IF EXISTS msg_participant_read ON public.messages;
DROP POLICY IF EXISTS messages_select_participant ON public.messages;
CREATE POLICY messages_select_participant ON public.messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT cm.conversation_id FROM public.conversation_members cm
      WHERE cm.user_id = (select app.auth_uid())
        AND cm.left_at IS NULL
    )
  );

DROP POLICY IF EXISTS msg_member_insert ON public.messages;
DROP POLICY IF EXISTS messages_insert_member ON public.messages;
CREATE POLICY messages_insert_member ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (select app.auth_uid())
    AND conversation_id IN (
      SELECT cm.conversation_id FROM public.conversation_members cm
      WHERE cm.user_id = (select app.auth_uid())
        AND cm.left_at IS NULL
    )
  );

DROP POLICY IF EXISTS msg_own_update ON public.messages;
DROP POLICY IF EXISTS messages_update_own ON public.messages;
CREATE POLICY messages_update_own ON public.messages
  FOR UPDATE TO authenticated
  USING  (sender_id = (select app.auth_uid()))
  WITH CHECK (sender_id = (select app.auth_uid()));
