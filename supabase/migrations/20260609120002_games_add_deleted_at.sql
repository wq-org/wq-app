-- =============================================================================
-- GAMES — add deleted_at for soft-delete lifecycle
-- Enables softDeleteGame API to mark a game as deleted without hard-removing
-- the row, preserving audit trails and game_deliveries references.
-- =============================================================================

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;

COMMENT ON COLUMN public.games.deleted_at IS
  'Soft-delete marker. Non-NULL means the game is hidden from all UI and API queries. Row is retained for audit and delivery history.';

CREATE INDEX IF NOT EXISTS idx_games_deleted_at
  ON public.games (deleted_at)
  WHERE deleted_at IS NULL;
