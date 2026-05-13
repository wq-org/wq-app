-- =============================================================================
-- TOPIC VERSIONS — backfill baseline topic_versions + pin course_version_topics
-- One baseline row per course_version_topics with source_topic_id; version_major
-- = parent course_versions.version_no; copies snapshot title/description/order
-- and availability from topic_availability_rules at migration time.
-- =============================================================================

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
SELECT
  cv.institution_id,
  cvt.source_topic_id,
  cv.version_no,
  0,
  'editorial_patch'::public.topic_change_kind,
  cvt.title,
  cvt.description,
  cvt.order_index,
  COALESCE(tar.is_locked, false),
  tar.unlock_at,
  cv.created_by,
  COALESCE(cv.published_at, cv.created_at),
  true
FROM public.course_version_topics cvt
INNER JOIN public.course_versions cv ON cv.id = cvt.course_version_id
LEFT JOIN public.topic_availability_rules tar
  ON tar.topic_id = cvt.source_topic_id
 AND tar.course_id = cv.course_id
WHERE cvt.source_topic_id IS NOT NULL
ON CONFLICT (institution_id, topic_id, version_major, version_patch) DO NOTHING;

UPDATE public.course_version_topics cvt
SET
  pinned_topic_version_id = pin.topic_version_id,
  resolution_mode = 'pinned'::public.topic_resolution_mode
FROM (
  SELECT
    cvt2.id AS course_version_topic_id,
    tv.id AS topic_version_id
  FROM public.course_version_topics cvt2
  INNER JOIN public.course_versions cv ON cv.id = cvt2.course_version_id
  INNER JOIN public.topic_versions tv
    ON tv.institution_id = cv.institution_id
   AND tv.topic_id = cvt2.source_topic_id
   AND tv.version_major = cv.version_no
   AND tv.version_patch = 0
  WHERE cvt2.source_topic_id IS NOT NULL
) pin
WHERE cvt.id = pin.course_version_topic_id
  AND cvt.pinned_topic_version_id IS NULL;

ALTER TABLE public.course_version_topics
  ADD CONSTRAINT chk_course_version_topics_pin_consistent CHECK (
    (source_topic_id IS NULL AND pinned_topic_version_id IS NULL)
    OR (source_topic_id IS NOT NULL AND pinned_topic_version_id IS NOT NULL)
  );
