-- =============================================================================
-- CHAT — triggers
-- Requires: 20260329000010_chat_02_tables.sql
-- =============================================================================

DROP TRIGGER IF EXISTS trg_conversations_set_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.validate_conversation_contexts_institution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  conv_row public.conversations%ROWTYPE;
BEGIN
  SELECT *
  INTO conv_row
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF conv_row.id IS NULL THEN
    RAISE EXCEPTION 'conversation not found';
  END IF;

  IF NEW.institution_id IS DISTINCT FROM conv_row.institution_id THEN
    RAISE EXCEPTION 'conversation_contexts institution_id must match conversation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_conversation_contexts_institution() FROM public;

COMMENT ON FUNCTION public.validate_conversation_contexts_institution() IS
  'Ensures conversation_contexts.institution_id matches the parent conversation (tenant isolation).';

DROP TRIGGER IF EXISTS trg_conversation_contexts_set_updated_at ON public.conversation_contexts;
CREATE TRIGGER trg_conversation_contexts_set_updated_at
  BEFORE UPDATE ON public.conversation_contexts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_conversation_contexts_validate_institution ON public.conversation_contexts;
CREATE TRIGGER trg_conversation_contexts_validate_institution
  BEFORE INSERT OR UPDATE ON public.conversation_contexts
  FOR EACH ROW EXECUTE FUNCTION public.validate_conversation_contexts_institution();
