-- =============================================================================
-- TASKS & NOTES — Functions & RPCs
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- Audit task state transitions.
CREATE OR REPLACE FUNCTION audit.log_task_state_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit.events (actor_id, action, entity_type, entity_id, institution_id, payload)
    VALUES (
      auth.uid(),
      'task_state_change',
      'task',
      NEW.id,
      NEW.institution_id,
      jsonb_build_object(
        'old_status', OLD.status::text,
        'new_status', NEW.status::text
      )
    );
  END IF;
  RETURN NEW;
END;
$$;
