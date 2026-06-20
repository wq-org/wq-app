-- =============================================================================
-- RPC: get_course_version_with_content
--
-- Returns the full course_version tree (version metadata + topics + lessons)
-- as a single JSONB document, bypassing per-row RLS on the nested tables.
--
-- Authorization is resolved once at the start (teacher, institution_admin,
-- or super_admin). This eliminates the N-fold 3-table JOIN that caused the
-- statement timeout on the nested PostgREST query.
-- =============================================================================

CREATE OR REPLACE FUNCTION app.get_course_version_with_content(
  p_course_version_id uuid,
  p_include_content boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
AS $$
DECLARE
  v_user_id        uuid;
  v_institution_id uuid;
  v_teacher_id     uuid;
  v_course_id      uuid;
  v_result         jsonb;
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- Resolve version + course owner in one query
  SELECT cv.institution_id, cv.course_id, c.teacher_id
  INTO v_institution_id, v_course_id, v_teacher_id
  FROM public.course_versions cv
  INNER JOIN public.courses c ON c.id = cv.course_id
  WHERE cv.id = p_course_version_id;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'not_found';
  END IF;

  -- Authorization: teacher who owns the course, institution admin, super admin, or
  -- any student who has active delivery access to the course via classroom membership.
  IF NOT (
    v_teacher_id = v_user_id
    OR v_institution_id IN (SELECT app.admin_institution_ids())
    OR (SELECT app.is_super_admin()) IS TRUE
    OR (SELECT app.student_can_access_course(v_course_id)) IS TRUE
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- Build the full nested document in one scan per table
  SELECT
    jsonb_build_object(
      'id',                  cv.id,
      'institution_id',      cv.institution_id,
      'course_id',           cv.course_id,
      'version_no',          cv.version_no,
      'status',              cv.status,
      'published_at',        cv.published_at,
      'has_pending_changes', cv.has_pending_changes,
      'title',               cv.title,
      'description',         cv.description,
      'theme_id',            cv.theme_id,
      'created_at',          cv.created_at,
      'updated_at',          cv.updated_at,
      'course_version_topics', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id',                 cvt.id,
              'course_version_id',  cvt.course_version_id,
              'source_topic_id',    cvt.source_topic_id,
              'title',              cvt.title,
              'description',        cvt.description,
              'order_index',        cvt.order_index,
              'course_version_lessons', COALESCE(
                (
                  SELECT jsonb_agg(
                    CASE WHEN p_include_content THEN
                      jsonb_build_object(
                        'id',                    cvl.id,
                        'course_version_topic_id', cvl.course_version_topic_id,
                        'source_lesson_id',      cvl.source_lesson_id,
                        'title',                 cvl.title,
                        'description',           cvl.description,
                        'content',               cvl.content,
                        'pages',                 cvl.pages,
                        'order_index',           cvl.order_index,
                        'content_schema_version', cvl.content_schema_version
                      )
                    ELSE
                      jsonb_build_object(
                        'id',                    cvl.id,
                        'course_version_topic_id', cvl.course_version_topic_id,
                        'source_lesson_id',      cvl.source_lesson_id,
                        'title',                 cvl.title,
                        'description',           cvl.description,
                        'content',               '{}'::jsonb,
                        'pages',                 '[]'::jsonb,
                        'order_index',           cvl.order_index,
                        'content_schema_version', cvl.content_schema_version
                      )
                    END
                    ORDER BY cvl.order_index ASC, cvl.created_at ASC
                  )
                  FROM public.course_version_lessons cvl
                  WHERE cvl.course_version_topic_id = cvt.id
                ),
                '[]'::jsonb
              )
            )
            ORDER BY cvt.order_index ASC, cvt.created_at ASC
          )
          FROM public.course_version_topics cvt
          WHERE cvt.course_version_id = p_course_version_id
        ),
        '[]'::jsonb
      )
    )
  INTO v_result
  FROM public.course_versions cv
  WHERE cv.id = p_course_version_id;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION app.get_course_version_with_content IS
  'Returns the full course_version tree as JSONB (version + topics + lessons). Authorization is resolved once; per-row RLS on nested tables is bypassed via SECURITY DEFINER. p_include_content=false omits lesson content/pages for lightweight callers.';

REVOKE ALL ON FUNCTION app.get_course_version_with_content(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.get_course_version_with_content(uuid, boolean) TO authenticated;

-- -----------------------------------------------------------------------------
-- Public wrapper — PostgREST only exposes functions in the public schema.
-- This thin wrapper delegates to the app-schema implementation.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_course_version_with_content(
  p_course_version_id uuid,
  p_include_content boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT app.get_course_version_with_content(p_course_version_id, p_include_content);
$$;

COMMENT ON FUNCTION public.get_course_version_with_content(uuid, boolean) IS
  'Public PostgREST wrapper for app.get_course_version_with_content. Delegates all logic and authorization to the app-schema implementation.';

REVOKE ALL ON FUNCTION public.get_course_version_with_content(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_course_version_with_content(uuid, boolean) TO authenticated;
