-- =============================================================================
-- CLOUD FILES — Hard-delete RPC with pre-delete audit emit
-- =============================================================================
-- Purpose
--   Sole approved hard-delete path for public.cloud_files. Emits
--   `cloud_file.deleted` through audit.log_event in the SAME transaction
--   before performing the DELETE, so the audit row and the deletion are
--   atomic (a rollback rolls back both).
--
-- Why an RPC instead of the trigger
--   The companion trigger (audit.log_cloud_files_audit) does not handle
--   AFTER DELETE because auth.uid() is unreliable in CASCADE contexts.
--   This RPC is invoked explicitly by authenticated user code and therefore
--   has a reliable auth.uid() to attribute the event to.
--
-- Authorization
--   The function is SECURITY DEFINER and therefore bypasses RLS. To prevent
--   privilege escalation it re-checks the manager predicate
--   app.user_can_manage_cloud_file(p_cloud_file_id) before doing anything,
--   and raises insufficient_privilege (SQLSTATE 42501) if the caller fails it.
--
-- DSGVO §4.9
--   Payload matches the cloud_files audit allowlist exactly: scope, mime_type,
--   size_bytes, old_status, new_status (NULL — the row no longer exists).
--   original_name, storage_object_name, bucket, owner_user_id are never
--   included.
--
-- Requires
--   - audit.log_event (canonical signature, see
--     supabase/migrations/2026032100000104_super_admin_04_functions_rpcs.sql)
--   - app.user_can_manage_cloud_file(uuid) (cloud_assets RLS helpers)
--   - public.cloud_files (20260329000017_cloud_assets_02_tables.sql)
--   - public.cloud_file_status enum (20260329000016_cloud_assets_01_types.sql)
-- =============================================================================

-- =============================================================================
-- 5. Functions/RPC
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_cloud_file_with_audit(
  p_cloud_file_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_institution_id uuid;
  v_scope          public.cloud_file_scope;
  v_mime_type      text;
  v_size_bytes     bigint;
  v_status         public.cloud_file_status;
  v_folder_id      uuid;
  v_classroom_id   uuid;
  v_course_id      uuid;
  v_lesson_id      uuid;
  v_task_id        uuid;
  v_conversation_id uuid;
  v_game_version_id uuid;
BEGIN
  -- 1) Authorization: re-check the manager predicate that the cloud_files
  --    RLS DELETE policy would normally enforce. SECURITY DEFINER bypasses
  --    RLS, so this check is the substitute.
  IF NOT app.user_can_manage_cloud_file(p_cloud_file_id) THEN
    RAISE EXCEPTION
      USING ERRCODE = 'insufficient_privilege',
            MESSAGE = 'forbidden: caller cannot manage cloud_file';
  END IF;

  -- 2) Capture the allowlisted audit fields before the row is gone.
  SELECT
    cf.institution_id,
    cf.scope,
    cf.mime_type,
    cf.size_bytes,
    cf.status,
    cf.folder_id,
    cf.classroom_id,
    cf.course_id,
    cf.lesson_id,
    cf.task_id,
    cf.conversation_id,
    cf.game_version_id
  INTO
    v_institution_id, v_scope, v_mime_type, v_size_bytes, v_status,
    v_folder_id, v_classroom_id, v_course_id, v_lesson_id, v_task_id,
    v_conversation_id, v_game_version_id
  FROM public.cloud_files cf
  WHERE cf.id = p_cloud_file_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      USING ERRCODE = 'no_data_found',
            MESSAGE = 'cloud_file_not_found';
  END IF;

  -- 3) Emit the audit event. Payload follows DSGVO §4.9 — no original_name,
  --    no storage_object_name, no bucket, no owner_user_id.
  PERFORM audit.log_event(
    p_event_type     := 'cloud_file.deleted'::text,
    p_subject_type   := 'cloud_file'::text,
    p_subject_id     := p_cloud_file_id,
    p_institution_id := v_institution_id,
    p_payload        := jsonb_build_object(
      'scope',       v_scope::text,
      'mime_type',   v_mime_type,
      'size_bytes',  v_size_bytes,
      'old_status',  v_status::text,
      'new_status',  NULL
    ),
    p_metadata       := jsonb_build_object(
      'visibility_level', 'institution_admin'::text,
      'context', jsonb_build_object(
        'cloud_file_id',   p_cloud_file_id,
        'folder_id',       v_folder_id,
        'classroom_id',    v_classroom_id,
        'course_id',       v_course_id,
        'lesson_id',       v_lesson_id,
        'task_id',         v_task_id,
        'conversation_id', v_conversation_id,
        'game_version_id', v_game_version_id
      ),
      'changed_fields',   '["hard_deleted"]'::jsonb,
      'delete_mode',      'hard'::text
    )
  );

  -- 4) Perform the actual delete in the same transaction. If this fails,
  --    the audit insert above is rolled back too (atomicity).
  DELETE FROM public.cloud_files WHERE id = p_cloud_file_id;
END;
$$;

COMMENT ON FUNCTION public.delete_cloud_file_with_audit(uuid) IS
  'Sole approved hard-delete path for cloud_files. Re-checks the manager '
  'predicate (RLS substitute under SECURITY DEFINER), emits cloud_file.deleted '
  'through audit.log_event with the DSGVO §4.9 payload, then DELETEs. '
  'Atomic — failure of any step rolls back the audit row.';

-- Lock down execute privileges: only authenticated callers may invoke.
REVOKE ALL ON FUNCTION public.delete_cloud_file_with_audit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_cloud_file_with_audit(uuid) TO authenticated;
