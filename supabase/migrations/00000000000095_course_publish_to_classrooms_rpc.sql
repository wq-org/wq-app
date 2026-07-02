-- =============================================================================
-- COURSE PUBLISH — snapshot course_versions + deliver to selected classrooms
-- Creates immutable course_version with topic/lesson snapshots, pins
-- topic_versions / lesson_versions, and inserts active course_deliveries,
-- archiving the previous current delivery per classroom (satisfies
-- idx_course_deliveries_current_classroom_course).
--
-- Lesson version resolution: publish_lesson_version computes its own
-- version_major from existing lesson_versions rows, which may differ from the
-- course version_no for a never-published lesson — so the returned id is
-- captured directly instead of re-selecting by version_major.
-- =============================================================================

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
      -- Reuse a lesson version already published for this course version number,
      -- otherwise publish a new one and capture its id directly. publish_lesson_version
      -- computes its own version_major from existing lesson_versions rows, which may
      -- differ from v_version_no for a never-published lesson — so we must NOT
      -- re-select by version_major; the returned id is authoritative.
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
          v_lesson_version_id := app.publish_lesson_version(
            v_lesson.id,
            'structural_major'::public.lesson_change_kind,
            NULL
          );
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
        'scheduled'::public.course_delivery_status
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
        'scheduled'::public.course_delivery_status
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
  'Publish a teacher-owned course: snapshot course metadata, topics, and lessons; pin topic/lesson versions; archive the current classroom delivery and create a new active one.';

-- Public PostgREST wrapper — PostgREST only exposes public-schema functions.
CREATE OR REPLACE FUNCTION public.publish_course_to_classrooms(
  p_course_id uuid,
  p_classroom_ids uuid[]
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT app.publish_course_to_classrooms(p_course_id, p_classroom_ids);
$$;

COMMENT ON FUNCTION public.publish_course_to_classrooms(uuid, uuid[]) IS
  'Public PostgREST wrapper for app.publish_course_to_classrooms.';

REVOKE ALL ON FUNCTION public.publish_course_to_classrooms(uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_course_to_classrooms(uuid, uuid[]) TO authenticated;
