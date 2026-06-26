-- =============================================================================
-- GAME ANALYTICS ALIGNMENT — functions and helpers
-- Requires: 20260331000001_game_analytics_alignment_03_indexes_constraints.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION app.student_can_access_game_delivery(p_game_delivery_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.game_deliveries gd
    LEFT JOIN public.classroom_members cm
      ON cm.classroom_id = gd.classroom_id
     AND cm.user_id = (SELECT app.auth_uid())
     AND cm.withdrawn_at IS NULL
    WHERE gd.id = p_game_delivery_id
      AND gd.archived_at IS NULL
      AND gd.status = 'published'::public.game_delivery_status
      AND gd.institution_id IN (SELECT app.member_institution_ids())
      AND (
        gd.classroom_id IS NULL
        OR cm.user_id IS NOT NULL
      )
  )
$$;

COMMENT ON FUNCTION app.student_can_access_game_delivery(uuid) IS
  'True when caller may access a published game_delivery in their institution and, if classroom-scoped, is an active classroom member. SECURITY DEFINER with row_security off only for this bounded lookup to prevent game_deliveries policy recursion.';

REVOKE ALL ON FUNCTION app.student_can_access_game_delivery(uuid) FROM public;
GRANT EXECUTE ON FUNCTION app.student_can_access_game_delivery(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.bind_game_run_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_game public.games%ROWTYPE;
  v_version public.game_versions%ROWTYPE;
  v_delivery public.game_deliveries%ROWTYPE;
BEGIN
  SELECT *
  INTO v_game
  FROM public.games
  WHERE id = NEW.game_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'game not found';
  END IF;

  IF NEW.institution_id IS NULL THEN
    NEW.institution_id := v_game.institution_id;
  ELSIF NEW.institution_id IS DISTINCT FROM v_game.institution_id THEN
    RAISE EXCEPTION 'game_runs.institution_id must match the game institution';
  END IF;

  IF NEW.game_version_id IS NULL THEN
    IF v_game.current_published_version_id IS NOT NULL THEN
      SELECT *
      INTO v_version
      FROM public.game_versions
      WHERE id = v_game.current_published_version_id;
    END IF;

    IF NOT FOUND THEN
      SELECT *
      INTO v_version
      FROM public.game_versions
      WHERE game_id = NEW.game_id
      ORDER BY version_no DESC
      LIMIT 1;
    END IF;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'game_version_id is required before the first game version exists';
    END IF;

    NEW.game_version_id := v_version.id;
  ELSE
    SELECT *
    INTO v_version
    FROM public.game_versions
    WHERE id = NEW.game_version_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'game_version_id not found';
    END IF;

    IF v_version.game_id IS DISTINCT FROM NEW.game_id THEN
      RAISE EXCEPTION 'game_version_id does not belong to the selected game';
    END IF;
  END IF;

  IF NEW.game_delivery_id IS NOT NULL THEN
    SELECT *
    INTO v_delivery
    FROM public.game_deliveries
    WHERE id = NEW.game_delivery_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'game_delivery_id not found';
    END IF;

    IF v_delivery.institution_id IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'game_delivery institution mismatch';
    END IF;

    IF v_delivery.game_id IS DISTINCT FROM NEW.game_id THEN
      RAISE EXCEPTION 'game_delivery game mismatch';
    END IF;

    IF v_delivery.game_version_id IS DISTINCT FROM NEW.game_version_id THEN
      RAISE EXCEPTION 'game_delivery version mismatch';
    END IF;

    IF NEW.classroom_id IS NULL THEN
      NEW.classroom_id := v_delivery.classroom_id;
    ELSIF v_delivery.classroom_id IS NOT NULL
      AND NEW.classroom_id IS DISTINCT FROM v_delivery.classroom_id THEN
      RAISE EXCEPTION 'game_delivery classroom mismatch';
    END IF;
  END IF;

  IF NEW.run_context IS NULL THEN
    NEW.run_context := CASE
      WHEN NEW.game_delivery_id IS NOT NULL THEN 'delivery_assigned'::public.game_run_context
      WHEN NEW.mode = 'versus'::public.game_run_mode THEN 'versus_invite'::public.game_run_context
      WHEN NEW.classroom_id IS NOT NULL THEN 'teacher_launched_session'::public.game_run_context
      ELSE 'solo_library'::public.game_run_context
    END;
  END IF;

  IF NEW.run_context = 'delivery_assigned'::public.game_run_context
     AND NEW.game_delivery_id IS NULL THEN
    RAISE EXCEPTION 'delivery_assigned run_context requires game_delivery_id';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.bind_game_run_version() FROM public;
