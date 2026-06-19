-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-BLOCK-ANALYTICS | strip §3 legacy lesson_block_events → learning_events copy (table retired) | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- LESSON DRAFT JSONB — 03_backfill (data only)
-- Deterministic data migration: reconstruct lessons.content, seed v1 versions,
-- copy legacy block analytics into learning_events.
-- Per docs/architecture/principle_database.md: data backfills isolated from DDL;
-- legacy retirement: 20260516000003_lesson_draft_jsonb_04_retire_legacy_blocks.sql.
-- =============================================================================

-- =============================================================================
-- 1. Reconstruct each lesson draft from legacy lesson_blocks rows
-- =============================================================================

WITH lesson_drafts AS (
  SELECT
    l.id AS lesson_id,
    COALESCE(
      (
        SELECT jsonb_build_object(
          'root', jsonb_build_object(
            'children', COALESCE(jsonb_agg(lb.value ORDER BY lb.meta_order), '[]'::jsonb),
            'direction', NULL,
            'format', '',
            'indent', 0,
            'type', 'root',
            'version', 1
          )
        )
        FROM public.lesson_blocks lb
        WHERE lb.lesson_id = l.id
      ),
      app.empty_lesson_lexical_state()
    ) AS content
  FROM public.lessons l
)
UPDATE public.lessons l
SET
  content = lesson_drafts.content,
  updated_at = now()
FROM lesson_drafts
WHERE lesson_drafts.lesson_id = l.id
  AND l.content IS DISTINCT FROM lesson_drafts.content;

-- =============================================================================
-- 2. Seed missing v1 lesson versions from the backfilled draft content
-- =============================================================================

WITH publisher AS (
  SELECT COALESCE(
    (SELECT id FROM auth.users WHERE email = 'system@wq-health.local' LIMIT 1),
    (SELECT user_id FROM public.profiles ORDER BY created_at ASC LIMIT 1)
  ) AS user_id
)
INSERT INTO public.lesson_versions (
  institution_id,
  lesson_id,
  version_major,
  version_patch,
  change_kind,
  lexical_state,
  plain_text,
  content_schema_version,
  published_by,
  published_at,
  is_active
)
SELECT
  c.institution_id,
  l.id,
  1 AS version_major,
  0 AS version_patch,
  'structural_major'::public.lesson_change_kind,
  COALESCE(l.content, app.empty_lesson_lexical_state()),
  NULL,
  COALESCE(l.content_schema_version, 1),
  publisher.user_id,
  COALESCE(l.created_at, now()),
  true
FROM public.lessons l
JOIN public.topics t ON t.id = l.topic_id
JOIN public.courses c ON c.id = t.course_id
CROSS JOIN publisher
WHERE publisher.user_id IS NOT NULL
  AND c.institution_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.lesson_versions lv
    WHERE lv.institution_id = c.institution_id
      AND lv.lesson_id = l.id
      AND lv.version_major = 1
      AND lv.version_patch = 0
  )
ON CONFLICT (institution_id, lesson_id, version_major, version_patch) DO NOTHING;

-- =============================================================================
-- 3. Preserve legacy block analytics inside learning_events as interactions
-- HETZNER_TEARDOWN (WQ-BLOCK-ANALYTICS): safe to delete this section on fresh DB
-- when 2026050812010001/0002 are omitted — requires lesson_block_events to exist.
-- =============================================================================

INSERT INTO public.learning_events (
  id,
  institution_id,
  user_id,
  course_id,
  lesson_id,
  lesson_version_id,
  event_type,
  slide_index,
  duration_ms,
  direction,
  metadata,
  created_at,
  course_delivery_id,
  block_index,
  block_type
)
SELECT
  gen_random_uuid(),
  lbe.institution_id,
  lbe.user_id,
  t.course_id,
  lbe.lesson_id,
  COALESCE(cvl.source_lesson_version_id, lv.id),
  'interaction_recorded'::public.learning_event_type,
  lb.meta_order,
  lbe.duration_ms,
  NULL,
  COALESCE(lbe.metadata, '{}'::jsonb)
    || jsonb_build_object(
      'legacy_event_type', lbe.event_type::text,
      'page_index', lb.meta_order,
      'block_index', lb.meta_order,
      'block_type', lb.block_type
    ),
  lbe.created_at,
  lbe.course_delivery_id,
  lb.meta_order,
  lb.block_type
FROM public.lesson_block_events lbe
JOIN public.lesson_blocks lb
  ON lb.id = lbe.block_id
JOIN public.lessons l
  ON l.id = lbe.lesson_id
JOIN public.topics t
  ON t.id = l.topic_id
LEFT JOIN public.lesson_versions lv
  ON lv.lesson_id = lbe.lesson_id
 AND lv.version_major = 1
 AND lv.version_patch = 0
LEFT JOIN public.course_deliveries cd
  ON cd.id = lbe.course_delivery_id
LEFT JOIN public.course_version_topics cvt
  ON cd.course_version_id = cvt.course_version_id
 AND cvt.source_topic_id = l.topic_id
LEFT JOIN public.course_version_lessons cvl
  ON cvl.course_version_topic_id = cvt.id
 AND cvl.source_lesson_id = lbe.lesson_id;
