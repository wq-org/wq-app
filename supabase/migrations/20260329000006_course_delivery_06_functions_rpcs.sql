-- =============================================================================
-- COURSE DELIVERY — access helpers (delivery-scoped entitlements)
-- Requires: 20260329000005_course_delivery_05_lesson_progress_learning_events.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION app.student_can_access_course_delivery(p_course_delivery_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.course_deliveries cd
    inner join public.classroom_members cm
      on cm.classroom_id = cd.classroom_id
     and cm.user_id = (select app.auth_uid())
     and cm.withdrawn_at is null
    where cd.id = p_course_delivery_id
      and cd.deleted_at is null
      and cd.published_at is not null
      and cd.status in (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status
      )
      and cd.institution_id in (select app.member_institution_ids())
  )
$$;

COMMENT ON FUNCTION app.student_can_access_course_delivery(uuid) IS
  'True if caller is an active classroom student for a published, non-deleted course_delivery in their institutions.';

CREATE OR REPLACE FUNCTION app.lesson_in_course_delivery_version(p_lesson_id uuid, p_course_delivery_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.course_deliveries cd
    inner join public.course_version_lessons cvl
      on cvl.source_lesson_id = p_lesson_id
    inner join public.course_version_topics cvt
      on cvt.id = cvl.course_version_topic_id
     and cvt.course_version_id = cd.course_version_id
    where cd.id = p_course_delivery_id
      and cd.deleted_at is null
  )
$$;

COMMENT ON FUNCTION app.lesson_in_course_delivery_version(uuid, uuid) IS
  'True if the canonical lesson_id appears in the course_delivery''s immutable course_version snapshot.';

CREATE OR REPLACE FUNCTION app.student_can_access_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.course_deliveries cd
    inner join public.classroom_members cm
      on cm.classroom_id = cd.classroom_id
     and cm.user_id = (select app.auth_uid())
     and cm.withdrawn_at is null
    where cd.course_id = p_course_id
      and cd.deleted_at is null
      and cd.published_at is not null
      and cd.status in (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status
      )
      and cd.institution_id in (select app.member_institution_ids())
  )
$$;

COMMENT ON FUNCTION app.student_can_access_course(uuid) IS
  'True if caller may access this course via a published course_delivery in an assigned classroom (replaces classroom_course_links-only checks).';

CREATE OR REPLACE FUNCTION app.student_can_access_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.course_deliveries cd
    inner join public.classroom_members cm
      on cm.classroom_id = cd.classroom_id
     and cm.user_id = (select app.auth_uid())
     and cm.withdrawn_at is null
    where cd.deleted_at is null
      and cd.published_at is not null
      and cd.status in (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status
      )
      and cd.institution_id in (select app.member_institution_ids())
      and exists (
        select 1
        from public.course_version_lessons cvl
        inner join public.course_version_topics cvt
          on cvt.id = cvl.course_version_topic_id
         and cvt.course_version_id = cd.course_version_id
        where cvl.source_lesson_id = p_lesson_id
      )
  )
$$;

COMMENT ON FUNCTION app.student_can_access_lesson(uuid) IS
  'True if caller may access this lesson via a published course_delivery whose version snapshot includes the lesson.';

-- -----------------------------------------------------------------------------
-- Drift detector views (read-only)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.course_enrollment_delivery_drift AS
SELECT
  'enrollment_without_delivery_membership'::text AS drift_type,
  ce.student_id AS user_id,
  c.institution_id,
  ce.course_id,
  NULL::uuid AS classroom_id,
  ce.created_at AS evidence_at
FROM public.course_enrollments ce
INNER JOIN public.courses c ON ce.course_id = c.id
WHERE NOT EXISTS (
  SELECT 1
  FROM public.course_deliveries cd
  INNER JOIN public.classroom_members cm ON cd.classroom_id = cm.classroom_id
  WHERE cd.course_id = ce.course_id
    AND cd.institution_id = c.institution_id
    AND cd.deleted_at IS NULL
    AND cd.published_at IS NOT NULL
    AND cm.user_id = ce.student_id
    AND cm.withdrawn_at IS NULL
)
UNION ALL
SELECT
  'delivery_membership_without_enrollment'::text AS drift_type,
  cm.user_id,
  cd.institution_id,
  cd.course_id,
  cd.classroom_id,
  COALESCE(cd.published_at, cd.created_at) AS evidence_at
FROM public.course_deliveries cd
INNER JOIN public.classroom_members cm ON cd.classroom_id = cm.classroom_id
WHERE cd.deleted_at IS NULL
  AND cd.published_at IS NOT NULL
  AND cm.withdrawn_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.course_enrollments ce
    WHERE ce.course_id = cd.course_id
      AND ce.student_id = cm.user_id
  );

COMMENT ON VIEW public.course_enrollment_delivery_drift IS
  'Read-only drift detector between legacy course_enrollments and canonical classroom_members + course_deliveries.';

CREATE OR REPLACE VIEW public.classroom_link_delivery_drift AS
SELECT
  'link_without_delivery'::text AS drift_type,
  ccl.institution_id,
  ccl.classroom_id,
  ccl.course_id,
  ccl.id AS classroom_course_link_id,
  NULL::uuid AS course_delivery_id,
  COALESCE(ccl.published_at, ccl.created_at) AS evidence_at
FROM public.classroom_course_links ccl
WHERE ccl.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.course_deliveries cd
    WHERE cd.legacy_classroom_course_link_id = ccl.id
      AND cd.deleted_at IS NULL
  )
UNION ALL
SELECT
  'delivery_without_link'::text AS drift_type,
  cd.institution_id,
  cd.classroom_id,
  cd.course_id,
  NULL::uuid AS classroom_course_link_id,
  cd.id AS course_delivery_id,
  COALESCE(cd.published_at, cd.created_at) AS evidence_at
FROM public.course_deliveries cd
WHERE cd.deleted_at IS NULL
  AND cd.legacy_classroom_course_link_id IS NULL;

COMMENT ON VIEW public.classroom_link_delivery_drift IS
  'Read-only drift detector between legacy classroom_course_links and canonical course_deliveries.';

-- -----------------------------------------------------------------------------
-- Staff authorization scope vs actual delivery assignment
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.staff_scope_delivery_summary(
  p_institution_id uuid DEFAULT NULL
)
RETURNS TABLE (
  user_id uuid,
  institution_id uuid,
  scoped_faculties integer,
  scoped_programmes integer,
  active_classrooms integer,
  active_course_deliveries integer
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH allowed_institutions AS (
    SELECT app.admin_institution_ids() AS institution_ids
  ),
  scope_rows AS (
    SELECT iss.user_id, iss.institution_id, iss.faculty_id, iss.programme_id
    FROM public.institution_staff_scopes iss
    WHERE (
      (SELECT app.is_super_admin()) IS TRUE
      OR iss.institution_id = ANY ((SELECT institution_ids FROM allowed_institutions))
    )
      AND (p_institution_id IS NULL OR iss.institution_id = p_institution_id)
  )
  SELECT
    s.user_id,
    s.institution_id,
    COUNT(DISTINCT s.faculty_id)::integer AS scoped_faculties,
    COUNT(DISTINCT s.programme_id)::integer AS scoped_programmes,
    COUNT(
      DISTINCT CASE
        WHEN cm.withdrawn_at IS NULL THEN cm.classroom_id
        ELSE NULL
      END
    )::integer AS active_classrooms,
    COUNT(
      DISTINCT CASE
        WHEN cm.withdrawn_at IS NULL
          AND cd.deleted_at IS NULL
          AND cd.published_at IS NOT NULL THEN cd.id
        ELSE NULL
      END
    )::integer AS active_course_deliveries
  FROM scope_rows s
  LEFT JOIN public.classroom_members cm
    ON cm.user_id = s.user_id
    AND cm.institution_id = s.institution_id
  LEFT JOIN public.course_deliveries cd
    ON cd.classroom_id = cm.classroom_id
    AND cd.institution_id = s.institution_id
  GROUP BY s.user_id, s.institution_id
$$;

COMMENT ON FUNCTION app.staff_scope_delivery_summary(uuid) IS
  'Reporting helper joining structural authorization scopes (institution_staff_scopes) with operational delivery assignment (classroom_members + course_deliveries).';
