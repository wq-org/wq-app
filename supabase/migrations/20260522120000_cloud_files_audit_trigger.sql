-- =============================================================================
-- CLOUD FILES — Audit trigger
-- =============================================================================
-- Purpose
--   Emit audit events for cloud_files lifecycle transitions:
--     cloud_file.created         — AFTER INSERT
--     cloud_file.deleted         — AFTER UPDATE, status: any -> 'deleted'
--     cloud_file.status_changed  — AFTER UPDATE, status changed but not into
--                                  'deleted' (e.g. 'active' -> 'archived')
--
--   UPDATEs that do not change the tracked fields are silently ignored
--   (no-op) so the audit log stays signal-only.
--
-- Hard-delete coverage
--   Hard DELETE on cloud_files is NOT covered by this trigger. auth.uid()
--   is unreliable in CASCADE contexts, and AFTER DELETE cannot return a row.
--   Every direct hard-delete must go through the SECURITY DEFINER RPC
--   `public.delete_cloud_file_with_audit(uuid)` (see companion migration),
--   which emits the audit event in the same transaction before the DELETE.
--   CASCADE deletes from parent rows are intentionally not audited here —
--   the parent's own audit event (e.g. lesson.deleted) covers the action.
--
-- DSGVO compliance — payload follows principle_dsgvo_audit_datendefinition.md §4.9
--   ❌ original_name     never logged (free text, §2.3 Freitext-Verbot)
--   ❌ storage_object_name never logged (security: path reconstruction)
--   ❌ bucket            never logged (internal infrastructure detail)
--   ❌ owner_user_id     never logged in payload (subject_id + actor_user_id
--                        via auth.uid() inside audit.log_event are sufficient)
--   ✅ scope, mime_type, size_bytes, old_status / new_status
--   ✅ folder_id + scope-anchor UUIDs in metadata.context
--   ✅ metadata.visibility_level = 'institution_admin'
--
-- Canonical audit.log_event signature (do not regress — see
-- principle_dsgvo_audit_datendefinition.md §6.4)
--   p_event_type, p_subject_type, p_subject_id, p_institution_id,
--   p_payload, p_metadata; actor resolved via auth.uid() inside SECURITY DEFINER.
--
-- Safe to re-run: function uses CREATE OR REPLACE; trigger is DROP IF EXISTS.
-- =============================================================================

-- =============================================================================
-- 5. Functions/RPC
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_cloud_files_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  -- -------------------------------------------------------------------------
  -- Determine event type. Skip silently on UPDATEs that change nothing
  -- the audit log cares about (avoids log spam from updated_at-only writes).
  -- -------------------------------------------------------------------------
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'cloud_file.created';

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NEW.status = 'deleted'::public.cloud_file_status THEN
      v_event_type := 'cloud_file.deleted';
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
      v_event_type := 'cloud_file.status_changed';
    ELSE
      RETURN NEW;
    END IF;

  ELSE
    -- DELETE is not covered here (see header). Return OLD so the cascade
    -- can complete; no audit event is emitted.
    RETURN OLD;
  END IF;

  -- -------------------------------------------------------------------------
  -- Emit the audit event through the single canonical writer.
  -- -------------------------------------------------------------------------
  PERFORM audit.log_event(
    p_event_type     := v_event_type,
    p_subject_type   := 'cloud_file'::text,
    p_subject_id     := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload        := jsonb_build_object(
      'scope',       COALESCE(NEW.scope, OLD.scope)::text,
      'mime_type',   COALESCE(NEW.mime_type, OLD.mime_type),
      'size_bytes',  COALESCE(NEW.size_bytes, OLD.size_bytes),
      'old_status',  CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::text ELSE NULL END,
      'new_status',  CASE WHEN TG_OP = 'UPDATE' THEN NEW.status::text ELSE NEW.status::text END
    ),
    p_metadata       := jsonb_build_object(
      'visibility_level', 'institution_admin'::text,
      'context', jsonb_build_object(
        'cloud_file_id',   COALESCE(NEW.id, OLD.id),
        'folder_id',       COALESCE(NEW.folder_id, OLD.folder_id),
        'classroom_id',    COALESCE(NEW.classroom_id, OLD.classroom_id),
        'course_id',       COALESCE(NEW.course_id, OLD.course_id),
        'lesson_id',       COALESCE(NEW.lesson_id, OLD.lesson_id),
        'task_id',         COALESCE(NEW.task_id, OLD.task_id),
        'conversation_id', COALESCE(NEW.conversation_id, OLD.conversation_id),
        'game_version_id', COALESCE(NEW.game_version_id, OLD.game_version_id)
      ),
      'changed_fields', CASE
        WHEN TG_OP <> 'UPDATE' THEN '[]'::jsonb
        ELSE to_jsonb(
          ARRAY_REMOVE(ARRAY[
            CASE WHEN NEW.status     IS DISTINCT FROM OLD.status     THEN 'status'     END,
            CASE WHEN NEW.scope      IS DISTINCT FROM OLD.scope      THEN 'scope'      END,
            CASE WHEN NEW.folder_id  IS DISTINCT FROM OLD.folder_id  THEN 'folder_id'  END,
            CASE WHEN NEW.size_bytes IS DISTINCT FROM OLD.size_bytes THEN 'size_bytes' END,
            CASE WHEN NEW.mime_type  IS DISTINCT FROM OLD.mime_type  THEN 'mime_type'  END
          ], NULL)
        )
      END
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_cloud_files_audit() IS
  'Emits audit.log_event for cloud_files INSERT and UPDATE (status changes). '
  'Payload follows the DSGVO §4.9 allowlist — original_name, storage_object_name, '
  'bucket, and owner_user_id are never logged. Hard-delete is covered by the '
  'public.delete_cloud_file_with_audit RPC, not this trigger.';

-- The function is SECURITY DEFINER; restrict the EXECUTE grant to the role
-- the trigger runs as (postgres owns the function; trigger invokes implicitly).
REVOKE ALL ON FUNCTION audit.log_cloud_files_audit() FROM PUBLIC;

-- =============================================================================
-- 6. Triggers
-- =============================================================================

DROP TRIGGER IF EXISTS trg_cloud_files_audit_row ON public.cloud_files;
CREATE TRIGGER trg_cloud_files_audit_row
  AFTER INSERT OR UPDATE ON public.cloud_files
  FOR EACH ROW
  EXECUTE FUNCTION audit.log_cloud_files_audit();
