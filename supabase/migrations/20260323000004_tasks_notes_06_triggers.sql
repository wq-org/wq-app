-- =============================================================================
-- TASKS & NOTES — Triggers
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- tasks
DROP TRIGGER IF EXISTS tasks_updated_at ON public.tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tasks_audit_state ON public.tasks;
CREATE TRIGGER tasks_audit_state
  AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION audit.log_task_state_change();

-- task_groups
DROP TRIGGER IF EXISTS task_groups_updated_at ON public.task_groups;
CREATE TRIGGER task_groups_updated_at
  BEFORE UPDATE ON public.task_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- task_submissions
DROP TRIGGER IF EXISTS ts_updated_at ON public.task_submissions;
CREATE TRIGGER ts_updated_at
  BEFORE UPDATE ON public.task_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- notes
DROP TRIGGER IF EXISTS notes_updated_at ON public.notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
