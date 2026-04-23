-- =============================================================================
-- TASKS & NOTES — Functions & RPCs
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- Audit task delivery state transitions.
CREATE OR REPLACE FUNCTION audit.log_task_delivery_state_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM audit.log_event(
      p_event_type := 'task_delivery.status_changed',
      p_subject_type := 'task_deliveries',
      p_subject_id := NEW.id,
      p_institution_id := NEW.institution_id,
      p_payload := jsonb_build_object(
        'old_status', OLD.status::text,
        'new_status', NEW.status::text,
        'task_template_id', NEW.task_template_id,
        'task_template_version_id', NEW.task_template_version_id
      ),
      p_metadata := jsonb_build_object(
        'task_delivery_id', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION audit.log_task_delivery_state_change() IS
  'Audit trigger for task_delivery status transitions with template/version context.';
