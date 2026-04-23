-- =============================================================================
-- COURSE DELIVERY — backfill v1 course_versions, snapshot rows, course_deliveries
-- Requires: 20260329000002_course_delivery_02_tables.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) One published course_version (version_no = 1) per course that needs it
-- -----------------------------------------------------------------------------
INSERT INTO public.course_versions (
  id,
  institution_id,
  course_id,
  version_no,
  status,
  published_at,
  created_by
)
SELECT
  gen_random_uuid(),
  x.institution_id,
  x.course_id,
  1,
  'published'::public.course_version_status,
  now(),
  x.teacher_id
FROM (
  SELECT DISTINCT ON (c.id)
    c.id AS course_id,
    c.teacher_id,
    coalesce(
      c.institution_id,
      (
        SELECT ccl2.institution_id
        FROM public.classroom_course_links ccl2
        WHERE ccl2.course_id = c.id
        ORDER BY (ccl2.deleted_at IS NULL) DESC, ccl2.created_at
        LIMIT 1
      ),
      (
        SELECT im.institution_id
        FROM public.institution_memberships im
        WHERE im.user_id = c.teacher_id
          AND im.deleted_at IS NULL
          AND im.left_institution_at IS NULL
        ORDER BY im.created_at
        LIMIT 1
      )
    ) AS institution_id
  FROM public.courses c
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.course_versions cv
    WHERE cv.course_id = c.id
      AND cv.version_no = 1
  )
  ORDER BY c.id
) x
WHERE x.institution_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2) Snapshot topics + lessons into course_version_* for every v1 version
-- -----------------------------------------------------------------------------
INSERT INTO public.course_version_topics (
  id,
  course_version_id,
  source_topic_id,
  title,
  description,
  order_index
)
SELECT
  gen_random_uuid(),
  cv.id,
  t.id,
  t.title,
  t.description,
  t.order_index
FROM public.course_versions cv
INNER JOIN public.topics t ON cv.course_id = t.course_id
WHERE cv.version_no = 1
  AND NOT EXISTS (
    SELECT 1
    FROM public.course_version_topics cvt
    WHERE cvt.course_version_id = cv.id
      AND cvt.source_topic_id = t.id
  );

INSERT INTO public.course_version_lessons (
  id,
  course_version_topic_id,
  source_lesson_id,
  title,
  description,
  content,
  pages,
  order_index,
  content_schema_version
)
SELECT
  gen_random_uuid(),
  cvt.id,
  l.id,
  l.title,
  l.description,
  l.content,
  l.pages,
  l.order_index,
  coalesce(l.content_schema_version, 1)
FROM public.course_versions cv
INNER JOIN public.course_version_topics cvt ON cv.id = cvt.course_version_id
INNER JOIN public.lessons l ON cvt.source_topic_id = l.topic_id
WHERE cv.version_no = 1
  AND NOT EXISTS (
    SELECT 1
    FROM public.course_version_lessons cvl
    WHERE cvl.course_version_topic_id = cvt.id
      AND cvl.source_lesson_id = l.id
  );

-- -----------------------------------------------------------------------------
-- 3) course_deliveries from classroom_course_links (all rows, incl. soft-deleted)
-- -----------------------------------------------------------------------------
INSERT INTO public.course_deliveries (
  id,
  institution_id,
  classroom_id,
  course_id,
  course_version_id,
  status,
  published_at,
  starts_at,
  ends_at,
  legacy_classroom_course_link_id,
  deleted_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  ccl.institution_id,
  ccl.classroom_id,
  ccl.course_id,
  cv.id,
  CASE
    WHEN ccl.deleted_at IS NOT NULL THEN 'canceled'::public.course_delivery_status
    WHEN ccl.published_at IS NOT NULL THEN 'active'::public.course_delivery_status
    ELSE 'draft'::public.course_delivery_status
  END,
  ccl.published_at,
  NULL,
  NULL,
  ccl.id,
  ccl.deleted_at,
  ccl.created_at,
  ccl.updated_at
FROM public.classroom_course_links ccl
INNER JOIN public.course_versions cv ON ccl.course_id = cv.course_id AND cv.version_no = 1
WHERE NOT EXISTS (
  SELECT 1
  FROM public.course_deliveries cd
  WHERE cd.legacy_classroom_course_link_id = ccl.id
);
