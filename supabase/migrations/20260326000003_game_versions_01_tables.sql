-- =============================================================================
-- GAME VERSIONS — tables
-- March versioning suite: authoritative version snapshots + stable game container
-- Requires: 20260323000001_baseline_lms_rls_memberships (games.institution_id/course_id),
--           20260326000002_games_schema_flex (games.game_content)
-- =============================================================================

-- =============================================================================
-- game_versions — immutable authored snapshots
-- =============================================================================
CREATE TABLE public.game_versions (
  id                     uuid                      PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id         uuid                      NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  game_id                uuid                      NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  version_no             integer                   NOT NULL,
  status                 text                      NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  content                jsonb                     NOT NULL,
  content_schema_version integer                   NOT NULL DEFAULT 1,
  change_note            text,
  published_at           timestamptz,
  created_by             uuid                      NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
  created_at             timestamptz               NOT NULL DEFAULT now(),
  updated_at             timestamptz               NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.game_versions IS
  'Immutable authored game snapshots. public.games is the stable container; public.game_runs should pin the exact version played.';
COMMENT ON COLUMN public.game_versions.version_no IS
  'Monotonic version number per game. Draft rows can be edited; published and archived rows are immutable snapshots.';
COMMENT ON COLUMN public.game_versions.status IS
  'Version lifecycle: draft -> published -> archived. Published rows become immutable; archived rows preserve history.';
COMMENT ON COLUMN public.game_versions.content IS
  'Source-of-truth authored content JSONB for the game version.';
COMMENT ON COLUMN public.game_versions.content_schema_version IS
  'Versioned schema marker for the JSON content payload.';
COMMENT ON COLUMN public.game_versions.change_note IS
  'Optional note describing what changed in this version.';
COMMENT ON COLUMN public.game_versions.published_at IS
  'Timestamp when the version was published. Remains historical once set.';

-- =============================================================================
-- games — add stable container pointers
-- =============================================================================
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS current_published_version_id uuid;

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

COMMENT ON COLUMN public.games.game_content IS
  'Working copy of authored game content. Compatibility mirror maintained from public.game_versions during the transition.';
COMMENT ON COLUMN public.games.version IS
  'Compatibility mirror for the current working version number; maintained from public.game_versions.';
COMMENT ON COLUMN public.games.published_version IS
  'Compatibility mirror for the last published version number; maintained from public.game_versions.';
COMMENT ON COLUMN public.games.is_draft IS
  'Compatibility mirror for whether the working copy is currently a draft.';
COMMENT ON COLUMN public.games.published_at IS
  'Historical last-published timestamp for the game container.';
COMMENT ON COLUMN public.games.current_published_version_id IS
  'Stable pointer to the latest published version row for this game, if any.';
COMMENT ON COLUMN public.games.archived_at IS
  'Container archive timestamp. Separate from game_versions lifecycle.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'games'
      AND constraint_name = 'fk_games_current_published_version'
  ) THEN
    ALTER TABLE public.games
      ADD CONSTRAINT fk_games_current_published_version
      FOREIGN KEY (current_published_version_id)
      REFERENCES public.game_versions(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

-- =============================================================================
-- game_runs — pin exact version used by each play event
-- =============================================================================
ALTER TABLE public.game_runs
  ADD COLUMN IF NOT EXISTS game_version_id uuid;

COMMENT ON COLUMN public.game_runs.game_version_id IS
  'The exact game version played in this run. Backfilled to the initial version and defaulted by trigger for new runs.';
