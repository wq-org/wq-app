-- =============================================================================
-- CLOUD ASSETS — functions & RPCs
-- Requires: 20260328000001_cloud_assets_03_indexes_constraints
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Game version read access (mirrors game_versions RLS; SECURITY DEFINER reads rows)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.user_can_select_game_version(p_game_version_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.game_versions gv
    JOIN public.games g ON g.id = gv.game_id
    WHERE gv.id = p_game_version_id
      AND (
        (SELECT app.is_super_admin())
        OR gv.institution_id IN (SELECT app.admin_institution_ids())
        OR g.teacher_id = (SELECT auth.uid())
        OR (
          gv.status = 'published'
          AND gv.institution_id IN (SELECT app.member_institution_ids())
        )
        OR EXISTS (
          SELECT 1
          FROM public.game_runs gr
          WHERE gr.game_version_id = gv.id
            AND (
              (
                gr.classroom_id IS NULL
                AND gr.institution_id IN (SELECT app.member_institution_ids())
              )
              OR EXISTS (
                SELECT 1
                FROM public.classroom_members cm
                WHERE cm.classroom_id = gr.classroom_id
                  AND cm.user_id = (SELECT auth.uid())
                  AND cm.withdrawn_at IS NULL
              )
              OR gr.started_by = (SELECT auth.uid())
              OR gr.game_id IN (
                SELECT gg.id
                FROM public.games gg
                WHERE gg.teacher_id = (SELECT auth.uid())
              )
            )
        )
      )
  );
$$;

COMMENT ON FUNCTION app.user_can_select_game_version(uuid) IS
  'True if caller may read this game version row (aligned with game_versions SELECT policies).';

REVOKE ALL ON FUNCTION app.user_can_select_game_version(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.user_can_select_game_version(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- Cloud file ACL helpers (SECURITY DEFINER reads cloud_files; avoids RLS recursion)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.user_can_select_cloud_file(p_cloud_file_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  cf public.cloud_files%ROWTYPE;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  IF (SELECT app.is_super_admin()) THEN
    RETURN EXISTS (SELECT 1 FROM public.cloud_files f WHERE f.id = p_cloud_file_id);
  END IF;

  SELECT *
  INTO cf
  FROM public.cloud_files
  WHERE id = p_cloud_file_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF cf.institution_id NOT IN (SELECT app.member_institution_ids())
     AND cf.institution_id NOT IN (SELECT app.admin_institution_ids()) THEN
    RETURN false;
  END IF;

  IF cf.status = 'deleted'::public.cloud_file_status THEN
    RETURN cf.owner_user_id = uid
      OR cf.institution_id IN (SELECT app.admin_institution_ids());
  END IF;

  IF cf.institution_id IN (SELECT app.admin_institution_ids()) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.cloud_file_shares s
    WHERE s.cloud_file_id = cf.id
      AND s.shared_with_user_id = uid
  ) THEN
    RETURN true;
  END IF;

  CASE cf.scope
    WHEN 'personal'::public.cloud_file_scope THEN
      RETURN cf.owner_user_id = uid;
    WHEN 'institution'::public.cloud_file_scope THEN
      RETURN cf.institution_id IN (SELECT app.member_institution_ids());
    WHEN 'classroom'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.classroom_members cm
        WHERE cm.classroom_id = cf.classroom_id
          AND cm.user_id = uid
          AND cm.withdrawn_at IS NULL
      );
    WHEN 'course'::public.cloud_file_scope THEN
      RETURN (SELECT app.caller_can_manage_course(cf.course_id))
        OR (SELECT app.student_can_access_course(cf.course_id));
    WHEN 'lesson'::public.cloud_file_scope THEN
      RETURN (SELECT app.student_can_access_lesson(cf.lesson_id));
    WHEN 'task'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.tasks t
        WHERE t.id = cf.task_id
          AND t.teacher_id = uid
      )
      OR EXISTS (
        SELECT 1
        FROM public.tasks t
        WHERE t.id = cf.task_id
          AND t.status <> 'draft'::public.task_status
          AND t.deleted_at IS NULL
          AND t.classroom_id IN (SELECT app.my_active_classroom_ids())
      );
    WHEN 'game'::public.cloud_file_scope THEN
      RETURN (SELECT app.user_can_select_game_version(cf.game_version_id));
    WHEN 'chat'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.conversation_members cm
        WHERE cm.conversation_id = cf.conversation_id
          AND cm.user_id = uid
          AND cm.left_at IS NULL
      );
    ELSE
      RETURN false;
  END CASE;
END;
$$;

COMMENT ON FUNCTION app.user_can_select_cloud_file(uuid) IS
  'True if caller may read metadata (and typically Storage bytes) for this file.';

REVOKE ALL ON FUNCTION app.user_can_select_cloud_file(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.user_can_select_cloud_file(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION app.user_can_manage_cloud_file(p_cloud_file_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  cf public.cloud_files%ROWTYPE;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  IF (SELECT app.is_super_admin()) THEN
    RETURN true;
  END IF;

  SELECT *
  INTO cf
  FROM public.cloud_files
  WHERE id = p_cloud_file_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF cf.institution_id IN (SELECT app.admin_institution_ids()) THEN
    RETURN true;
  END IF;

  IF cf.owner_user_id = uid THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.cloud_file_shares s
    WHERE s.cloud_file_id = cf.id
      AND s.shared_with_user_id = uid
      AND s.permission = 'edit'::public.cloud_file_share_permission
  );
END;
$$;

COMMENT ON FUNCTION app.user_can_manage_cloud_file(uuid) IS
  'True if caller may update metadata, share, or soft-delete the file.';

REVOKE ALL ON FUNCTION app.user_can_manage_cloud_file(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.user_can_manage_cloud_file(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- Cloud folder ACL (parallel to files; no per-folder shares)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.user_can_select_cloud_folder(p_cloud_folder_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  fd public.cloud_folders%ROWTYPE;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  IF (SELECT app.is_super_admin()) THEN
    RETURN EXISTS (SELECT 1 FROM public.cloud_folders f WHERE f.id = p_cloud_folder_id);
  END IF;

  SELECT *
  INTO fd
  FROM public.cloud_folders
  WHERE id = p_cloud_folder_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF fd.institution_id NOT IN (SELECT app.member_institution_ids())
     AND fd.institution_id NOT IN (SELECT app.admin_institution_ids()) THEN
    RETURN false;
  END IF;

  IF fd.institution_id IN (SELECT app.admin_institution_ids()) THEN
    RETURN true;
  END IF;

  CASE fd.scope
    WHEN 'personal'::public.cloud_file_scope THEN
      RETURN fd.owner_user_id = uid;
    WHEN 'institution'::public.cloud_file_scope THEN
      RETURN fd.institution_id IN (SELECT app.member_institution_ids());
    WHEN 'classroom'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.classroom_members cm
        WHERE cm.classroom_id = fd.classroom_id
          AND cm.user_id = uid
          AND cm.withdrawn_at IS NULL
      );
    WHEN 'course'::public.cloud_file_scope THEN
      RETURN (SELECT app.caller_can_manage_course(fd.course_id))
        OR (SELECT app.student_can_access_course(fd.course_id));
    WHEN 'lesson'::public.cloud_file_scope THEN
      RETURN (SELECT app.student_can_access_lesson(fd.lesson_id));
    WHEN 'task'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.tasks t
        WHERE t.id = fd.task_id
          AND t.teacher_id = uid
      )
      OR EXISTS (
        SELECT 1
        FROM public.tasks t
        WHERE t.id = fd.task_id
          AND t.status <> 'draft'::public.task_status
          AND t.deleted_at IS NULL
          AND t.classroom_id IN (SELECT app.my_active_classroom_ids())
      );
    WHEN 'game'::public.cloud_file_scope THEN
      RETURN (SELECT app.user_can_select_game_version(fd.game_version_id));
    WHEN 'chat'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.conversation_members cm
        WHERE cm.conversation_id = fd.conversation_id
          AND cm.user_id = uid
          AND cm.left_at IS NULL
      );
    ELSE
      RETURN false;
  END CASE;
END;
$$;

COMMENT ON FUNCTION app.user_can_select_cloud_folder(uuid) IS
  'True if caller may list or traverse this folder.';

REVOKE ALL ON FUNCTION app.user_can_select_cloud_folder(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.user_can_select_cloud_folder(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION app.user_can_manage_cloud_folder(p_cloud_folder_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  fd public.cloud_folders%ROWTYPE;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  IF (SELECT app.is_super_admin()) THEN
    RETURN true;
  END IF;

  SELECT *
  INTO fd
  FROM public.cloud_folders
  WHERE id = p_cloud_folder_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF fd.institution_id IN (SELECT app.admin_institution_ids()) THEN
    RETURN true;
  END IF;

  IF fd.owner_user_id = uid THEN
    RETURN true;
  END IF;

  CASE fd.scope
    WHEN 'classroom'::public.cloud_file_scope THEN
      RETURN (SELECT app.caller_can_manage_classroom(fd.classroom_id));
    WHEN 'course'::public.cloud_file_scope THEN
      RETURN (SELECT app.caller_can_manage_course(fd.course_id));
    WHEN 'lesson'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.lessons l
        JOIN public.topics top ON top.id = l.topic_id
        JOIN public.courses c ON c.id = top.course_id
        WHERE l.id = fd.lesson_id
          AND c.teacher_id = uid
      );
    WHEN 'task'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.tasks t
        WHERE t.id = fd.task_id
          AND t.teacher_id = uid
      );
    WHEN 'game'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.game_versions gv
        JOIN public.games g ON g.id = gv.game_id
        WHERE gv.id = fd.game_version_id
          AND g.teacher_id = uid
      );
    WHEN 'chat'::public.cloud_file_scope THEN
      RETURN EXISTS (
        SELECT 1
        FROM public.conversations conv
        WHERE conv.id = fd.conversation_id
          AND conv.created_by = uid
      );
    ELSE
      RETURN false;
  END CASE;
END;
$$;

COMMENT ON FUNCTION app.user_can_manage_cloud_folder(uuid) IS
  'True if caller may rename, reparent, or delete the folder.';

REVOKE ALL ON FUNCTION app.user_can_manage_cloud_folder(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.user_can_manage_cloud_folder(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- Institution storage quota delta (called from triggers)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_cloud_file_storage_quota_delta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  inst uuid;
  delta bigint := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    inst := NEW.institution_id;
    IF NEW.status = 'active'::public.cloud_file_status THEN
      delta := NEW.size_bytes;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    inst := NEW.institution_id;
    delta :=
      (CASE WHEN NEW.status = 'active'::public.cloud_file_status THEN NEW.size_bytes ELSE 0::bigint END)
      - (CASE WHEN OLD.status = 'active'::public.cloud_file_status THEN OLD.size_bytes ELSE 0::bigint END);
  ELSIF TG_OP = 'DELETE' THEN
    inst := OLD.institution_id;
    IF OLD.status = 'active'::public.cloud_file_status THEN
      delta := -OLD.size_bytes;
    END IF;
  END IF;

  IF delta <> 0 THEN
    UPDATE public.institution_quotas_usage u
    SET
      storage_used_bytes = GREATEST(0::bigint, u.storage_used_bytes + delta),
      updated_at = now()
    WHERE u.institution_id = inst;

    IF NOT FOUND THEN
      INSERT INTO public.institution_quotas_usage (institution_id, storage_used_bytes, updated_at)
      VALUES (inst, GREATEST(0::bigint, delta), now());
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_cloud_file_storage_quota_delta() FROM PUBLIC;

COMMENT ON FUNCTION public.apply_cloud_file_storage_quota_delta() IS
  'Maintains institution_quotas_usage.storage_used_bytes from cloud_files size/status changes.';

-- -----------------------------------------------------------------------------
-- RPC: register metadata row + canonical Storage key (upload follows)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_cloud_file_record(
  p_institution_id uuid,
  p_scope public.cloud_file_scope,
  p_folder_id uuid DEFAULT NULL,
  p_mime_type text DEFAULT NULL,
  p_size_bytes bigint DEFAULT 0,
  p_original_name text DEFAULT NULL,
  p_classroom_id uuid DEFAULT NULL,
  p_course_id uuid DEFAULT NULL,
  p_lesson_id uuid DEFAULT NULL,
  p_task_id uuid DEFAULT NULL,
  p_conversation_id uuid DEFAULT NULL,
  p_game_version_id uuid DEFAULT NULL
)
RETURNS public.cloud_files
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  folder_row public.cloud_folders%ROWTYPE;
  v_id uuid := gen_random_uuid();
  v_path text;
  v_scope public.cloud_file_scope;
  v_classroom_id uuid;
  v_course_id uuid;
  v_lesson_id uuid;
  v_task_id uuid;
  v_conversation_id uuid;
  v_game_version_id uuid;
  cap_bytes bigint;
  used_bytes bigint;
  new_row public.cloud_files%ROWTYPE;
BEGIN
  IF NOT (SELECT app.is_super_admin())
     AND p_institution_id NOT IN (SELECT app.member_institution_ids()) THEN
    RAISE EXCEPTION 'not an institution member';
  END IF;

  IF p_size_bytes < 0 THEN
    RAISE EXCEPTION 'size_bytes must be non-negative';
  END IF;

  SELECT COALESCE(sub.storage_bytes_cap, pc.storage_bytes_cap_default)
  INTO cap_bytes
  FROM public.institution_subscriptions sub
  JOIN public.plan_catalog pc ON pc.id = sub.plan_id
  WHERE sub.institution_id = p_institution_id
    AND sub.billing_status IN ('active', 'trialing', 'past_due')
    AND (sub.effective_to IS NULL OR sub.effective_to > now())
  ORDER BY sub.effective_from DESC
  LIMIT 1;

  IF cap_bytes IS NOT NULL THEN
    SELECT COALESCE(q.storage_used_bytes, 0::bigint)
    INTO used_bytes
    FROM public.institution_quotas_usage q
    WHERE q.institution_id = p_institution_id;

    IF used_bytes IS NULL THEN
      used_bytes := 0;
    END IF;

    IF used_bytes + p_size_bytes > cap_bytes THEN
      RAISE EXCEPTION 'institution storage quota exceeded';
    END IF;
  END IF;

  v_path := p_institution_id::text || '/files/' || v_id::text;

  IF p_folder_id IS NOT NULL THEN
    SELECT *
    INTO folder_row
    FROM public.cloud_folders
    WHERE id = p_folder_id
      AND institution_id = p_institution_id;

    IF folder_row.id IS NULL THEN
      RAISE EXCEPTION 'folder not found in institution';
    END IF;

    IF NOT (SELECT app.user_can_manage_cloud_folder(p_folder_id)) THEN
      RAISE EXCEPTION 'not allowed to add files to this folder';
    END IF;

    v_scope := folder_row.scope;
    v_classroom_id := folder_row.classroom_id;
    v_course_id := folder_row.course_id;
    v_lesson_id := folder_row.lesson_id;
    v_task_id := folder_row.task_id;
    v_conversation_id := folder_row.conversation_id;
    v_game_version_id := folder_row.game_version_id;
  ELSE
    v_scope := p_scope;
    v_classroom_id := p_classroom_id;
    v_course_id := p_course_id;
    v_lesson_id := p_lesson_id;
    v_task_id := p_task_id;
    v_conversation_id := p_conversation_id;
    v_game_version_id := p_game_version_id;
  END IF;

  INSERT INTO public.cloud_files (
    id,
    institution_id,
    owner_user_id,
    folder_id,
    bucket,
    storage_object_name,
    scope,
    classroom_id,
    course_id,
    lesson_id,
    task_id,
    conversation_id,
    game_version_id,
    mime_type,
    size_bytes,
    original_name,
    status,
    created_by,
    updated_by
  )
  VALUES (
    v_id,
    p_institution_id,
    (SELECT auth.uid()),
    p_folder_id,
    'cloud',
    v_path,
    v_scope,
    v_classroom_id,
    v_course_id,
    v_lesson_id,
    v_task_id,
    v_conversation_id,
    v_game_version_id,
    p_mime_type,
    p_size_bytes,
    p_original_name,
    'active'::public.cloud_file_status,
    (SELECT auth.uid()),
    (SELECT auth.uid())
  )
  RETURNING *
  INTO new_row;

  RETURN new_row;
END;
$$;

REVOKE ALL ON FUNCTION public.register_cloud_file_record(
  uuid,
  public.cloud_file_scope,
  uuid,
  text,
  bigint,
  text,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_cloud_file_record(
  uuid,
  public.cloud_file_scope,
  uuid,
  text,
  bigint,
  text,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid
) TO authenticated;

COMMENT ON FUNCTION public.register_cloud_file_record(
  uuid,
  public.cloud_file_scope,
  uuid,
  text,
  bigint,
  text,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid
) IS
  'Creates cloud_files row and canonical storage_object_name; client uploads to Storage next.';
