-- =============================================================================
-- Make game_versions.game_id FK deferrable so the BEFORE INSERT trigger on
-- public.games can insert into public.game_versions (using NEW.id) before the
-- parent games row is visible. Without DEFERRABLE, the FK check fires
-- immediately during the trigger and fails with 23503 because the games row
-- has not been committed yet. With INITIALLY DEFERRED the check runs at
-- transaction commit, by which point the games row is present.
-- =============================================================================

ALTER TABLE public.game_versions
  DROP CONSTRAINT IF EXISTS game_versions_game_id_fkey;

ALTER TABLE public.game_versions
  ADD CONSTRAINT fk_game_versions_games
  FOREIGN KEY (game_id)
  REFERENCES public.games (id)
  ON DELETE CASCADE
  DEFERRABLE INITIALLY DEFERRED;

COMMENT ON CONSTRAINT fk_game_versions_games ON public.game_versions IS
  'Deferrable FK so the BEFORE INSERT trigger on games can insert the first game_versions row in the same transaction before the parent games row is committed.';
