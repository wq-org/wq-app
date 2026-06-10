-- =============================================================================
-- DATA BACKFILL — populate game_versions.title/description/theme_id from games
-- and create missing game_deliveries for already-published linked games.
--
-- Separated from 20260609120000_... per architecture rule:
-- schema changes and data changes must not share a migration file.
--
-- The guard trigger trg_game_versions_guard_row enforces published/archived
-- row immutability. We temporarily disable it for this one-time backfill of
-- columns that did not exist before the schema migration above.
-- =============================================================================

-- Backfill title/description/theme_id on published and archived game_versions.
-- trg_game_versions_guard_row must be disabled because these columns are being
-- populated for the first time (they were NULL before the schema migration).

ALTER TABLE public.game_versions DISABLE TRIGGER trg_game_versions_guard_row;

UPDATE public.game_versions gv
SET
  title       = COALESCE(gv.title,       g.title),
  description = COALESCE(gv.description, g.description),
  theme_id    = COALESCE(gv.theme_id,    g.theme_id)
FROM public.games g
WHERE g.id = gv.game_id
  AND gv.status IN ('published', 'archived');

ALTER TABLE public.game_versions ENABLE TRIGGER trg_game_versions_guard_row;

-- Backfill game_deliveries for already-published games linked to a course.
-- ON CONFLICT DO NOTHING ensures idempotency if partial backfills exist.

INSERT INTO public.game_deliveries (
  institution_id,
  game_id,
  game_version_id,
  classroom_id,
  course_delivery_id,
  status,
  published_at,
  created_by,
  updated_by,
  created_at,
  updated_at
)
SELECT
  cd.institution_id,
  g.id,
  g.current_published_version_id,
  cd.classroom_id,
  cd.id,
  'published'::public.game_delivery_status,
  COALESCE(g.published_at, gv.published_at, now()),
  g.teacher_id,
  g.teacher_id,
  now(),
  now()
FROM public.games g
JOIN public.game_versions gv ON gv.id = g.current_published_version_id
JOIN public.course_deliveries cd ON cd.course_id = g.course_id
WHERE g.course_id IS NOT NULL
  AND g.current_published_version_id IS NOT NULL
  AND cd.deleted_at IS NULL
  AND cd.published_at IS NOT NULL
  AND cd.status IN (
    'active'::public.course_delivery_status,
    'scheduled'::public.course_delivery_status,
    'offline'::public.course_delivery_status
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.game_deliveries gd
    WHERE gd.game_id = g.id
      AND gd.course_delivery_id = cd.id
      AND gd.game_version_id = g.current_published_version_id
      AND gd.status = 'published'::public.game_delivery_status
  );
