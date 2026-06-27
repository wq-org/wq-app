-- =============================================================================
-- COURSE DELIVERY — offline lifecycle and current-delivery invariant
-- =============================================================================

WITH ranked_current_deliveries AS (
  SELECT
    cd.id,
    row_number() OVER (
      PARTITION BY cd.classroom_id, cd.course_id
      ORDER BY cd.created_at DESC, cd.id DESC
    ) AS delivery_rank
  FROM public.course_deliveries cd
  WHERE cd.deleted_at IS NULL
    AND cd.status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status,
      'offline'::public.course_delivery_status
    )
)
UPDATE public.course_deliveries cd
SET
  status = 'archived'::public.course_delivery_status,
  updated_at = now()
FROM ranked_current_deliveries ranked_delivery
WHERE ranked_delivery.id = cd.id
  AND ranked_delivery.delivery_rank > 1;

DROP INDEX IF EXISTS public.idx_course_deliveries_current_classroom_course;

CREATE UNIQUE INDEX idx_course_deliveries_current_classroom_course
  ON public.course_deliveries (classroom_id, course_id)
  WHERE deleted_at IS NULL
    AND status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status,
      'offline'::public.course_delivery_status
    );

COMMENT ON INDEX public.idx_course_deliveries_current_classroom_course IS
  'Enforces one non-final current delivery per classroom and course. Active/scheduled are student-visible; offline is hidden but reversible; archived/canceled remain historical.';

COMMENT ON COLUMN public.course_deliveries.status IS
  'draft / scheduled / active / offline / archived / canceled. Offline hides a delivery from students without final archival.';

CREATE OR REPLACE FUNCTION app.archive_course_version(p_course_version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_version record;
  v_has_newer_published_version boolean;
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT
    cv.id,
    cv.institution_id,
    cv.course_id,
    cv.version_no,
    cv.status
  INTO v_version
  FROM public.course_versions cv
  WHERE cv.id = p_course_version_id
  FOR UPDATE;

  IF v_version.id IS NULL THEN
    RAISE EXCEPTION 'course version not found';
  END IF;

  IF v_version.status <> 'published'::public.course_version_status THEN
    RAISE EXCEPTION 'only published course versions can be archived';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin()) IS TRUE
    OR v_version.institution_id IN (SELECT app.admin_institution_ids())
    OR EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = v_version.course_id
        AND c.teacher_id = v_user_id
    )
  ) THEN
    RAISE EXCEPTION 'course version archive access denied';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.course_versions cv
    WHERE cv.course_id = v_version.course_id
      AND cv.status = 'published'::public.course_version_status
      AND cv.version_no > v_version.version_no
  )
  INTO v_has_newer_published_version;

  IF v_has_newer_published_version IS NOT TRUE THEN
    RAISE EXCEPTION 'latest published course version cannot be archived';
  END IF;

  UPDATE public.course_deliveries
  SET
    status = 'archived'::public.course_delivery_status,
    updated_at = now()
  WHERE course_version_id = v_version.id
    AND deleted_at IS NULL
    AND status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status,
      'offline'::public.course_delivery_status
    );

  UPDATE public.course_versions
  SET
    status = 'archived'::public.course_version_status,
    updated_at = now()
  WHERE id = v_version.id;
END;
$$;

COMMENT ON FUNCTION app.archive_course_version(uuid) IS
  'Archive an old published course version and end active/scheduled/offline deliveries for that version without deleting progress or learning events.';

CREATE OR REPLACE FUNCTION app.take_course_deliveries_offline(p_course_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_course record;
  v_affected_count integer := 0;
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT c.id, c.institution_id, c.teacher_id
  INTO v_course
  FROM public.courses c
  WHERE c.id = p_course_id
  FOR UPDATE;

  IF v_course.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin()) IS TRUE
    OR v_course.institution_id IN (SELECT app.admin_institution_ids())
    OR v_course.teacher_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'course delivery offline access denied';
  END IF;

  PERFORM 1
  FROM public.course_deliveries cd
  WHERE cd.course_id = p_course_id
    AND cd.institution_id = v_course.institution_id
    AND cd.deleted_at IS NULL
    AND cd.status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status
    )
  FOR UPDATE;

  UPDATE public.course_deliveries
  SET
    status = 'offline'::public.course_delivery_status,
    updated_at = now()
  WHERE course_id = p_course_id
    AND institution_id = v_course.institution_id
    AND deleted_at IS NULL
    AND status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status
    );

  GET DIAGNOSTICS v_affected_count = ROW_COUNT;

  RETURN v_affected_count;
END;
$$;

COMMENT ON FUNCTION app.take_course_deliveries_offline(uuid) IS
  'Temporarily hide current active/scheduled course deliveries from students by moving them to offline; rows remain restorable and historical.';

REVOKE ALL ON FUNCTION app.take_course_deliveries_offline(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.take_course_deliveries_offline(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.take_course_deliveries_offline(p_course_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT app.take_course_deliveries_offline(p_course_id);
$$;

COMMENT ON FUNCTION public.take_course_deliveries_offline(uuid) IS
  'Public wrapper for app.take_course_deliveries_offline.';

REVOKE ALL ON FUNCTION public.take_course_deliveries_offline(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.take_course_deliveries_offline(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION app.restore_course_deliveries_online(p_course_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_course record;
  v_affected_count integer := 0;
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT c.id, c.institution_id, c.teacher_id
  INTO v_course
  FROM public.courses c
  WHERE c.id = p_course_id
  FOR UPDATE;

  IF v_course.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin()) IS TRUE
    OR v_course.institution_id IN (SELECT app.admin_institution_ids())
    OR v_course.teacher_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'course delivery restore access denied';
  END IF;

  PERFORM 1
  FROM public.course_deliveries cd
  WHERE cd.course_id = p_course_id
    AND cd.institution_id = v_course.institution_id
    AND cd.deleted_at IS NULL
    AND cd.status = 'offline'::public.course_delivery_status
  FOR UPDATE;

  UPDATE public.course_deliveries
  SET
    status = 'active'::public.course_delivery_status,
    updated_at = now()
  WHERE course_id = p_course_id
    AND institution_id = v_course.institution_id
    AND deleted_at IS NULL
    AND status = 'offline'::public.course_delivery_status;

  GET DIAGNOSTICS v_affected_count = ROW_COUNT;

  RETURN v_affected_count;
END;
$$;

COMMENT ON FUNCTION app.restore_course_deliveries_online(uuid) IS
  'Restore reversible offline course deliveries to active student-visible deliveries.';

REVOKE ALL ON FUNCTION app.restore_course_deliveries_online(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.restore_course_deliveries_online(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.restore_course_deliveries_online(p_course_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT app.restore_course_deliveries_online(p_course_id);
$$;

COMMENT ON FUNCTION public.restore_course_deliveries_online(uuid) IS
  'Public wrapper for app.restore_course_deliveries_online.';

REVOKE ALL ON FUNCTION public.restore_course_deliveries_online(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_course_deliveries_online(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION app.publish_course_to_classrooms(
  p_course_id uuid,
  p_classroom_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_institution_id uuid;
  v_course_title text;
  v_course_description text;
  v_course_theme_id text;
  v_version_no integer;
  v_course_version_id uuid;
  v_topic record;
  v_lesson record;
  v_topic_version_id uuid;
  v_lesson_version_id uuid;
  v_cvt_id uuid;
  v_classroom_id uuid;
  v_delivery_id uuid;
  v_delivery_ids uuid[] := ARRAY[]::uuid[];
  v_now timestamptz := now();
  v_distinct_classroom_ids uuid[];
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT c.institution_id, c.title, c.description, c.theme_id
  INTO v_institution_id, v_course_title, v_course_description, v_course_theme_id
  FROM public.courses c
  WHERE c.id = p_course_id
    AND c.teacher_id = v_user_id;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'course not found or not owned by teacher';
  END IF;

  IF p_classroom_ids IS NULL OR cardinality(p_classroom_ids) = 0 THEN
    RAISE EXCEPTION 'at least one classroom is required';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT classroom_id ORDER BY classroom_id), ARRAY[]::uuid[])
  INTO v_distinct_classroom_ids
  FROM unnest(p_classroom_ids) AS classroom_id;

  FOREACH v_classroom_id IN ARRAY v_distinct_classroom_ids LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM public.classrooms cr
      WHERE cr.id = v_classroom_id
        AND cr.institution_id = v_institution_id
        AND (
          cr.primary_teacher_id = v_user_id
          OR EXISTS (
            SELECT 1
            FROM public.classroom_members cm
            WHERE cm.classroom_id = cr.id
              AND cm.user_id = v_user_id
              AND cm.withdrawn_at IS NULL
              AND cm.membership_role = 'co_teacher'::public.classroom_member_role
          )
        )
    ) THEN
      RAISE EXCEPTION 'classroom % is not accessible', v_classroom_id;
    END IF;
  END LOOP;

  SELECT COALESCE(MAX(cv.version_no), 0) + 1
  INTO v_version_no
  FROM public.course_versions cv
  WHERE cv.course_id = p_course_id;

  INSERT INTO public.course_versions (
    institution_id,
    course_id,
    version_no,
    status,
    published_at,
    title,
    description,
    theme_id,
    created_by,
    created_at,
    updated_at
  )
  VALUES (
    v_institution_id,
    p_course_id,
    v_version_no,
    'published'::public.course_version_status,
    v_now,
    v_course_title,
    v_course_description,
    v_course_theme_id,
    v_user_id,
    v_now,
    v_now
  )
  RETURNING id INTO v_course_version_id;

  FOR v_topic IN
    SELECT
      t.id,
      t.title,
      t.description,
      t.order_index,
      COALESCE(tar.is_locked, false) AS is_locked,
      tar.unlock_at
    FROM public.topics t
    LEFT JOIN public.topic_availability_rules tar
      ON tar.topic_id = t.id
     AND tar.course_id = p_course_id
    WHERE t.course_id = p_course_id
    ORDER BY t.order_index ASC, t.created_at ASC
  LOOP
    INSERT INTO public.topic_versions (
      institution_id,
      topic_id,
      version_major,
      version_patch,
      change_kind,
      title,
      description,
      order_index,
      is_locked,
      unlock_at,
      published_by,
      published_at,
      is_active
    )
    VALUES (
      v_institution_id,
      v_topic.id,
      v_version_no,
      0,
      'editorial_patch'::public.topic_change_kind,
      v_topic.title,
      v_topic.description,
      v_topic.order_index,
      v_topic.is_locked,
      v_topic.unlock_at,
      v_user_id,
      v_now,
      true
    )
    ON CONFLICT (institution_id, topic_id, version_major, version_patch) DO NOTHING;

    SELECT tv.id
    INTO v_topic_version_id
    FROM public.topic_versions tv
    WHERE tv.institution_id = v_institution_id
      AND tv.topic_id = v_topic.id
      AND tv.version_major = v_version_no
      AND tv.version_patch = 0;

    IF v_topic_version_id IS NULL THEN
      RAISE EXCEPTION 'failed to resolve topic version for topic %', v_topic.id;
    END IF;

    INSERT INTO public.course_version_topics (
      course_version_id,
      source_topic_id,
      title,
      description,
      order_index,
      pinned_topic_version_id,
      resolution_mode
    )
    VALUES (
      v_course_version_id,
      v_topic.id,
      v_topic.title,
      v_topic.description,
      v_topic.order_index,
      v_topic_version_id,
      'pinned'::public.topic_resolution_mode
    )
    RETURNING id INTO v_cvt_id;

    FOR v_lesson IN
      SELECT
        l.id,
        l.title,
        l.description,
        COALESCE(l.content, app.empty_lesson_lexical_state()) AS content,
        COALESCE(l.pages, '[]'::jsonb) AS pages,
        l.order_index,
        COALESCE(l.content_schema_version, 1) AS content_schema_version
      FROM public.lessons l
      WHERE l.topic_id = v_topic.id
      ORDER BY l.order_index ASC, l.created_at ASC
    LOOP
      SELECT lv.id
      INTO v_lesson_version_id
      FROM public.lesson_versions lv
      WHERE lv.institution_id = v_institution_id
        AND lv.lesson_id = v_lesson.id
        AND lv.version_major = v_version_no
        AND lv.version_patch = 0;

      IF v_lesson_version_id IS NULL THEN
        IF v_version_no = 1 THEN
          v_lesson_version_id := app.publish_lesson_version(
            v_lesson.id,
            'editorial_patch'::public.lesson_change_kind,
            NULL
          );
        ELSE
          PERFORM app.publish_lesson_version(
            v_lesson.id,
            'structural_major'::public.lesson_change_kind,
            NULL
          );

          SELECT lv.id
          INTO v_lesson_version_id
          FROM public.lesson_versions lv
          WHERE lv.institution_id = v_institution_id
            AND lv.lesson_id = v_lesson.id
            AND lv.version_major = v_version_no
            AND lv.version_patch = 0;
        END IF;
      END IF;

      IF v_lesson_version_id IS NULL THEN
        RAISE EXCEPTION 'failed to resolve lesson version for lesson %', v_lesson.id;
      END IF;

      INSERT INTO public.course_version_lessons (
        course_version_topic_id,
        source_lesson_id,
        title,
        description,
        content,
        pages,
        order_index,
        content_schema_version,
        source_lesson_version_id,
        resolution_mode,
        allow_auto_patch
      )
      VALUES (
        v_cvt_id,
        v_lesson.id,
        v_lesson.title,
        v_lesson.description,
        v_lesson.content,
        v_lesson.pages,
        v_lesson.order_index,
        v_lesson.content_schema_version,
        v_lesson_version_id,
        'pinned'::public.lesson_resolution_mode,
        false
      );
    END LOOP;
  END LOOP;

  FOREACH v_classroom_id IN ARRAY v_distinct_classroom_ids LOOP
    PERFORM 1
    FROM public.classrooms cr
    WHERE cr.id = v_classroom_id
    FOR UPDATE;

    PERFORM 1
    FROM public.course_deliveries cd
    WHERE cd.classroom_id = v_classroom_id
      AND cd.course_id = p_course_id
      AND cd.deleted_at IS NULL
      AND cd.status IN (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status,
        'offline'::public.course_delivery_status
      )
    FOR UPDATE;

    UPDATE public.course_deliveries
    SET
      status = 'archived'::public.course_delivery_status,
      updated_at = v_now
    WHERE classroom_id = v_classroom_id
      AND course_id = p_course_id
      AND deleted_at IS NULL
      AND status IN (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status,
        'offline'::public.course_delivery_status
      );

    INSERT INTO public.course_deliveries (
      institution_id,
      classroom_id,
      course_id,
      course_version_id,
      status,
      published_at,
      created_at,
      updated_at
    )
    VALUES (
      v_institution_id,
      v_classroom_id,
      p_course_id,
      v_course_version_id,
      'active'::public.course_delivery_status,
      v_now,
      v_now,
      v_now
    )
    RETURNING id INTO v_delivery_id;

    v_delivery_ids := array_append(v_delivery_ids, v_delivery_id);
  END LOOP;

  UPDATE public.courses
  SET
    is_published = true,
    updated_at = v_now
  WHERE id = p_course_id;

  RETURN jsonb_build_object(
    'course_version_id', v_course_version_id,
    'version_no', v_version_no,
    'delivery_ids', to_jsonb(v_delivery_ids)
  );
END;
$$;

REVOKE ALL ON FUNCTION app.publish_course_to_classrooms(uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.publish_course_to_classrooms(uuid, uuid[]) TO authenticated;

COMMENT ON FUNCTION app.publish_course_to_classrooms IS
  'Publish a teacher-owned course: snapshot course metadata, topics, and lessons; replace current active/scheduled/offline classroom course_deliveries with a new active delivery.';
