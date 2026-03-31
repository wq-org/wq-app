-- =============================================================================
-- GAME ANALYTICS ALIGNMENT — backfill
-- Requires: 20260331000001_game_analytics_alignment_04_functions_rpcs.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Backfill game_runs.game_version_id when missing
-- -----------------------------------------------------------------------------
WITH candidate_versions AS (
  SELECT
    gr.id AS game_run_id,
    COALESCE(
      g.current_published_version_id,
      (
        SELECT gv.id
        FROM public.game_versions gv
        WHERE gv.game_id = gr.game_id
        ORDER BY gv.version_no DESC
        LIMIT 1
      )
    ) AS target_game_version_id
  FROM public.game_runs gr
  INNER JOIN public.games g ON gr.game_id = g.id
  WHERE gr.game_version_id IS NULL
)

UPDATE public.game_runs gr
SET game_version_id = cv.target_game_version_id
FROM candidate_versions cv
WHERE gr.id = cv.game_run_id
  AND cv.target_game_version_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2) Backfill game_runs.game_delivery_id from classroom/game/version context
-- -----------------------------------------------------------------------------
WITH delivery_match AS (
  SELECT
    gr.id AS game_run_id,
    gd.id AS game_delivery_id
  FROM public.game_runs gr
  LEFT JOIN LATERAL (
    SELECT gd0.id
    FROM public.game_deliveries gd0
    WHERE gd0.institution_id = gr.institution_id
      AND gd0.game_id = gr.game_id
      AND gd0.game_version_id = gr.game_version_id
      AND gd0.classroom_id IS NOT DISTINCT FROM gr.classroom_id
      AND gd0.archived_at IS NULL
    ORDER BY COALESCE(gd0.published_at, gd0.created_at) DESC
    LIMIT 1
  ) gd ON TRUE
  WHERE gr.game_delivery_id IS NULL
    AND gr.game_version_id IS NOT NULL
    AND gr.classroom_id IS NOT NULL
)

UPDATE public.game_runs gr
SET game_delivery_id = dm.game_delivery_id
FROM delivery_match dm
WHERE gr.id = dm.game_run_id
  AND dm.game_delivery_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 3) Backfill game_runs.run_context
-- -----------------------------------------------------------------------------
UPDATE public.game_runs gr
SET run_context = CASE
  WHEN gr.game_delivery_id IS NOT NULL THEN 'delivery_assigned'::public.game_run_context
  WHEN gr.mode = 'versus'::public.game_run_mode THEN 'versus_invite'::public.game_run_context
  WHEN gr.classroom_id IS NOT NULL THEN 'teacher_launched_session'::public.game_run_context
  ELSE 'solo_library'::public.game_run_context
END
WHERE gr.run_context IS NULL;

-- -----------------------------------------------------------------------------
-- 4) Backfill scoped stats from existing participants/sessions/runs
-- -----------------------------------------------------------------------------
DELETE FROM public.game_run_stats_scoped;

INSERT INTO public.game_run_stats_scoped (
  institution_id,
  user_id,
  game_id,
  game_version_id,
  game_delivery_id,
  best_score,
  best_run_id,
  attempt_count,
  last_run_at,
  created_at,
  updated_at
)
WITH scoped_attempts AS (
  SELECT
    gr.institution_id,
    gsp.user_id,
    gr.game_id,
    gr.game_version_id,
    gr.game_delivery_id,
    gr.id AS game_run_id,
    gsp.score,
    COALESCE(gsp.completed_at, gs.ended_at, gr.ended_at, gsp.created_at) AS attempt_at
  FROM public.game_session_participants gsp
  INNER JOIN public.game_sessions gs ON gsp.game_session_id = gs.id
  INNER JOIN public.game_runs gr ON gs.game_run_id = gr.id
  WHERE gr.game_version_id IS NOT NULL
),

ranked AS (
  SELECT
    sa.*,
    ROW_NUMBER() OVER (
      PARTITION BY sa.institution_id, sa.user_id, sa.game_id, sa.game_version_id, sa.game_delivery_id
      ORDER BY sa.score DESC, sa.attempt_at DESC, sa.game_run_id DESC
    ) AS rn,
    COUNT(*) OVER (
      PARTITION BY sa.institution_id, sa.user_id, sa.game_id, sa.game_version_id, sa.game_delivery_id
    ) AS attempts,
    MAX(sa.attempt_at) OVER (
      PARTITION BY sa.institution_id, sa.user_id, sa.game_id, sa.game_version_id, sa.game_delivery_id
    ) AS last_attempt_at
  FROM scoped_attempts sa
)

SELECT
  r.institution_id,
  r.user_id,
  r.game_id,
  r.game_version_id,
  r.game_delivery_id,
  r.score AS best_score,
  r.game_run_id AS best_run_id,
  r.attempts::integer AS attempt_count,
  r.last_attempt_at AS last_run_at,
  NOW() AS created_at,
  NOW() AS updated_at
FROM ranked r
WHERE r.rn = 1;

-- -----------------------------------------------------------------------------
-- 5) Backfill compatibility is_personal_best from scoped source of truth
-- -----------------------------------------------------------------------------
UPDATE public.game_session_participants gsp
SET is_personal_best = EXISTS(
  SELECT 1
  FROM public.game_sessions gs
  INNER JOIN public.game_runs gr ON gs.game_run_id = gr.id
  INNER JOIN public.game_run_stats_scoped grss
    ON gr.institution_id = grss.institution_id
   AND grss.user_id = gsp.user_id
   AND gr.game_id = grss.game_id
   AND gr.game_version_id = grss.game_version_id
   AND grss.game_delivery_id IS NOT DISTINCT FROM gr.game_delivery_id
   AND gr.id = grss.best_run_id
  WHERE gs.id = gsp.game_session_id
);

-- -----------------------------------------------------------------------------
-- 6) Verification checklist (manual post-migration smoke checks)
-- -----------------------------------------------------------------------------
-- SELECT COUNT(*) AS game_runs_missing_version
-- FROM public.game_runs
-- WHERE game_version_id IS NULL;
--
-- SELECT COUNT(*) AS delivery_assigned_missing_delivery
-- FROM public.game_runs
-- WHERE run_context = 'delivery_assigned'::public.game_run_context
--   AND game_delivery_id IS NULL;
--
-- SELECT COUNT(*) AS scoped_stats_missing_best_run
-- FROM public.game_run_stats_scoped
-- WHERE best_run_id IS NULL
--   AND attempt_count > 0;
--
-- SELECT gr.id
-- FROM public.game_runs gr
-- INNER JOIN public.game_deliveries gd ON gd.id = gr.game_delivery_id
-- WHERE gr.game_delivery_id IS NOT NULL
--   AND (
--     gr.institution_id IS DISTINCT FROM gd.institution_id
--     OR gr.game_id IS DISTINCT FROM gd.game_id
--     OR gr.game_version_id IS DISTINCT FROM gd.game_version_id
--   )
-- LIMIT 20;
