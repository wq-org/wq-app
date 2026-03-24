-- =============================================================================
-- CHAT — trigger functions + DROP/CREATE TRIGGER
-- Split from 20260323000005_chat.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
