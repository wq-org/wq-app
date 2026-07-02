-- =============================================================================
-- GAME COURSE LINKS — junction table for many-to-many game ↔ course linking
-- Replaces the single games.course_id FK for multi-course support.
-- games.course_id is retained for the primary delivery course (publish_game RPC).
-- =============================================================================

-- 1. Tables ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.game_course_links (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid        NOT NULL,
  game_id        uuid        NOT NULL REFERENCES public.games(id)   ON DELETE CASCADE,
  course_id      uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_game_course_links_game_course UNIQUE (game_id, course_id)
);

COMMENT ON TABLE public.game_course_links IS
  'Many-to-many junction between games and courses. Each row means a published game is linked to a course so students enrolled in that course can find the game.';
COMMENT ON COLUMN public.game_course_links.institution_id IS
  'Tenant isolation key — must match the owning game''s institution_id.';
COMMENT ON COLUMN public.game_course_links.game_id IS
  'The published game being linked.';
COMMENT ON COLUMN public.game_course_links.course_id IS
  'The course the game is linked to.';

-- 2. Indexes ---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_game_course_links_game_id
  ON public.game_course_links (game_id);

CREATE INDEX IF NOT EXISTS idx_game_course_links_course_id
  ON public.game_course_links (course_id);

CREATE INDEX IF NOT EXISTS idx_game_course_links_institution_id
  ON public.game_course_links (institution_id);

-- 3. Functions -------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_game_course_link_institution_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.institution_id IS NULL THEN
    SELECT institution_id
    INTO NEW.institution_id
    FROM public.games
    WHERE id = NEW.game_id;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_game_course_link_institution_id() IS
  'BEFORE INSERT trigger on game_course_links: auto-populates institution_id from the linked game when the caller omits it.';

-- 4. Triggers --------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_game_course_links_set_institution_id ON public.game_course_links;
CREATE TRIGGER trg_game_course_links_set_institution_id
  BEFORE INSERT ON public.game_course_links
  FOR EACH ROW EXECUTE FUNCTION public.set_game_course_link_institution_id();

-- 5. RLS -------------------------------------------------------------------

ALTER TABLE public.game_course_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_course_links FORCE ROW LEVEL SECURITY;

-- Teacher can see links for games they own
DROP POLICY IF EXISTS game_course_links_select_teacher ON public.game_course_links;
CREATE POLICY game_course_links_select_teacher
  ON public.game_course_links
  FOR SELECT
  TO authenticated
  USING (
    institution_id IN (SELECT app.member_institution_ids())
  );

-- Teacher can add links only for their own games, and only to courses with a
-- live (student-visible) delivery.
DROP POLICY IF EXISTS game_course_links_insert_teacher ON public.game_course_links;
CREATE POLICY game_course_links_insert_teacher
  ON public.game_course_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    game_id IN (
      SELECT id FROM public.games WHERE teacher_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1
      FROM public.course_deliveries cd
      WHERE cd.course_id = game_course_links.course_id
        AND cd.deleted_at IS NULL
        AND cd.status IN (
          'active'::public.course_delivery_status,
          'scheduled'::public.course_delivery_status
        )
    )
  );

-- Teacher can remove links only for their own games
DROP POLICY IF EXISTS game_course_links_delete_teacher ON public.game_course_links;
CREATE POLICY game_course_links_delete_teacher
  ON public.game_course_links
  FOR DELETE
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM public.games WHERE teacher_id = (SELECT auth.uid())
    )
  );
