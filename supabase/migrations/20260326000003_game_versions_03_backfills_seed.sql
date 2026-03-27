-- =============================================================================
-- GAME VERSIONS — backfills & seed data
-- Requires: 20260323000001_baseline_lms_rls_memberships (all parts),
--           20260326000003_game_versions_01_tables,
--           20260326000003_game_versions_02_indexes_constraints
-- =============================================================================

-- Ensure legacy rows have an institution before we materialize version rows.
UPDATE public.games g
SET institution_id = (
  SELECT m.institution_id
  FROM public.institution_memberships m
  WHERE m.user_id = g.teacher_id
    AND m.status = 'active'
    AND m.deleted_at IS NULL
    AND m.left_institution_at IS NULL
  ORDER BY m.created_at ASC
  LIMIT 1
)
WHERE g.institution_id IS NULL;

-- Backfill version 1 for every existing game from the current authored content.
INSERT INTO public.game_versions (
  institution_id,
  game_id,
  version_no,
  status,
  content,
  content_schema_version,
  change_note,
  published_at,
  created_by,
  created_at,
  updated_at
)
SELECT
  g.institution_id,
  g.id,
  1,
  CASE
    WHEN g.published_version IS NOT NULL OR g.published_at IS NOT NULL THEN 'published'
    WHEN g.status::text = 'archived' THEN 'archived'
    ELSE 'draft'
  END,
  g.game_content,
  1,
  NULL,
  CASE
    WHEN g.published_version IS NOT NULL OR g.published_at IS NOT NULL THEN g.published_at
    WHEN g.status::text IN ('published', 'archived') THEN g.published_at -- one-time legacy bootstrap
    ELSE NULL
  END,
  g.teacher_id,
  g.created_at,
  COALESCE(g.updated_at, g.created_at)
FROM public.games g
ON CONFLICT (game_id, version_no) DO NOTHING;

-- Repoint game containers at the backfilled version rows.
UPDATE public.games g
SET
  current_published_version_id = CASE
    WHEN g.published_version IS NOT NULL
      OR g.published_at IS NOT NULL
      OR g.status::text IN ('published', 'archived') -- one-time legacy bootstrap
    THEN gv.id
    ELSE NULL
  END,
  version = gv.version_no,
  published_version = CASE
    WHEN g.published_version IS NOT NULL
      OR g.published_at IS NOT NULL
      OR g.status::text IN ('published', 'archived') -- one-time legacy bootstrap
    THEN gv.version_no
    ELSE NULL
  END,
  is_draft = CASE
    WHEN g.published_version IS NOT NULL
      OR g.published_at IS NOT NULL
      OR g.status::text IN ('published', 'archived')
    THEN false
    ELSE true
  END,
  archived_at = CASE
    WHEN g.status::text = 'archived' THEN COALESCE(g.archived_at, g.published_at, g.created_at)
    ELSE NULL
  END
FROM public.game_versions gv
WHERE gv.game_id = g.id
  AND gv.version_no = 1;

-- Backfill historical runs to the version that existed when the run record was first modeled.
UPDATE public.game_runs gr
SET game_version_id = gv.id
FROM public.game_versions gv
WHERE gv.game_id = gr.game_id
  AND gv.version_no = 1
  AND gr.game_version_id IS NULL;

ALTER TABLE public.game_runs
  ALTER COLUMN game_version_id SET NOT NULL;
