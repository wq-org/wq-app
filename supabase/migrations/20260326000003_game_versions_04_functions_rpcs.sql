-- =============================================================================
-- GAME VERSIONS — helper functions and trigger logic
-- Requires: 20260326000003_game_versions_01_tables,
--           20260326000003_game_versions_02_indexes_constraints
-- =============================================================================

-- -----------------------------------------------------------------------------
-- helpers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.game_versions_next_version_no(p_game_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(MAX(version_no), 0) + 1
  FROM public.game_versions
  WHERE game_id = p_game_id
$$;

CREATE OR REPLACE FUNCTION public.game_versions_current_draft_id(p_game_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT gv.id
  FROM public.game_versions gv
  WHERE gv.game_id = p_game_id
    AND gv.status = 'draft'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.game_versions_current_published_id(p_game_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT g.current_published_version_id
  FROM public.games g
  WHERE g.id = p_game_id
$$;

CREATE OR REPLACE FUNCTION public.game_versions_create_draft(
  p_game_id uuid,
  p_institution_id uuid,
  p_content jsonb,
  p_created_by uuid,
  p_change_note text DEFAULT NULL,
  p_content_schema_version integer DEFAULT 1
)
RETURNS public.game_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_version public.game_versions%ROWTYPE;
BEGIN
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
  VALUES (
    p_institution_id,
    p_game_id,
    public.game_versions_next_version_no(p_game_id),
    'draft',
    p_content,
    p_content_schema_version,
    p_change_note,
    NULL,
    p_created_by,
    now(),
    now()
  )
  RETURNING * INTO v_version;

  RETURN v_version;
END;
$$;

REVOKE ALL ON FUNCTION public.game_versions_create_draft(uuid, uuid, jsonb, uuid, text, integer) FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- game container sync — keep games as the mutable working copy, versions as history
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_games_game_versions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  draft_version_row public.game_versions%ROWTYPE;
  published_version_row public.game_versions%ROWTYPE;
  created_by_user_id uuid;
  is_content_changed boolean;
  is_published_pointer_changed boolean;
  is_legacy_publish_requested boolean;
  is_legacy_unpublish_requested boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    created_by_user_id := COALESCE(NEW.teacher_id, auth.uid());

    IF NEW.game_content IS NULL THEN
      RAISE EXCEPTION 'games.game_content is required';
    END IF;

    IF NEW.institution_id IS NULL THEN
      SELECT m.institution_id
      INTO NEW.institution_id
      FROM public.institution_memberships m
      WHERE m.user_id = NEW.teacher_id
        AND m.status = 'active'
        AND m.deleted_at IS NULL
        AND m.left_institution_at IS NULL
      ORDER BY m.created_at ASC
      LIMIT 1;
    END IF;

    IF NEW.institution_id IS NULL THEN
      RAISE EXCEPTION 'games.institution_id is required';
    END IF;

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
    VALUES (
      NEW.institution_id,
      NEW.id,
      1,
      'draft',
      NEW.game_content,
      1,
      NULL,
      NULL,
      created_by_user_id,
      COALESCE(NEW.created_at, now()),
      COALESCE(NEW.updated_at, now())
    )
    RETURNING * INTO draft_version_row;

    NEW.version := draft_version_row.version_no;
    NEW.published_version := NULL;
    NEW.current_published_version_id := NULL;
    NEW.is_draft := true;
    NEW.published_at := NULL;
    NEW.archived_at := CASE
      WHEN NEW.status::text = 'archived' THEN COALESCE(NEW.archived_at, now())
      ELSE NULL
    END;

    RETURN NEW;
  END IF;

  is_content_changed := NEW.game_content IS DISTINCT FROM OLD.game_content;
  is_published_pointer_changed := NEW.current_published_version_id IS DISTINCT FROM OLD.current_published_version_id;
  is_legacy_publish_requested := (NEW.status::text = 'published' AND OLD.status::text IS DISTINCT FROM 'published');
  is_legacy_unpublish_requested := (NEW.status::text = 'draft' AND OLD.status::text = 'published');

  IF OLD.current_published_version_id IS NOT NULL THEN
    SELECT *
    INTO published_version_row
    FROM public.game_versions
    WHERE id = OLD.current_published_version_id
    LIMIT 1;
  ELSIF OLD.published_version IS NOT NULL THEN
    SELECT *
    INTO published_version_row
    FROM public.game_versions
    WHERE game_id = OLD.id
      AND version_no = OLD.published_version
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT 1;
  END IF;

  IF OLD.status = 'archived' AND is_content_changed THEN
    RAISE EXCEPTION 'archived games cannot be edited';
  END IF;

  -- Compatibility path: legacy status transitions can request publish/unpublish.
  IF is_legacy_publish_requested AND NEW.current_published_version_id IS NULL THEN
    SELECT *
    INTO draft_version_row
    FROM public.game_versions
    WHERE game_id = OLD.id
      AND status = 'draft'
    ORDER BY version_no DESC
    LIMIT 1;

    IF draft_version_row.id IS NULL THEN
      draft_version_row := public.game_versions_create_draft(
        OLD.id,
        COALESCE(NEW.institution_id, OLD.institution_id),
        NEW.game_content,
        COALESCE(NEW.teacher_id, OLD.teacher_id, auth.uid()),
        NULL,
        1
      );
    END IF;

    NEW.current_published_version_id := draft_version_row.id;
    is_published_pointer_changed := true;
  ELSIF is_legacy_unpublish_requested THEN
    NEW.current_published_version_id := NULL;
    is_published_pointer_changed := true;
  END IF;

  -- Pointer changes are the canonical publish/unpublish transitions.
  IF is_published_pointer_changed THEN
    IF NEW.current_published_version_id IS NULL THEN
      NEW.published_version := NULL;
      NEW.published_at := NULL;
      NEW.is_draft := true;
      NEW.archived_at := CASE
        WHEN NEW.status::text = 'archived' THEN COALESCE(NEW.archived_at, OLD.archived_at, now())
        ELSE NULL
      END;
      RETURN NEW;
    END IF;

    SELECT *
    INTO published_version_row
    FROM public.game_versions
    WHERE id = NEW.current_published_version_id
    LIMIT 1;

    IF published_version_row.id IS NULL THEN
      RAISE EXCEPTION 'current_published_version_id not found';
    END IF;
    IF published_version_row.game_id IS DISTINCT FROM NEW.id THEN
      RAISE EXCEPTION 'current_published_version_id does not belong to the game';
    END IF;

    IF published_version_row.status = 'draft' THEN
      UPDATE public.game_versions
      SET status = 'published',
          published_at = COALESCE(NEW.published_at, now())
      WHERE id = published_version_row.id
      RETURNING * INTO published_version_row;
    ELSIF published_version_row.status <> 'published' THEN
      RAISE EXCEPTION 'current_published_version_id must reference a published version';
    END IF;

    IF OLD.current_published_version_id IS NOT NULL
      AND OLD.current_published_version_id <> published_version_row.id THEN
      UPDATE public.game_versions
      SET status = 'archived'
      WHERE id = OLD.current_published_version_id
        AND status = 'published';
    END IF;

    NEW.version := published_version_row.version_no;
    NEW.published_version := published_version_row.version_no;
    NEW.published_at := COALESCE(NEW.published_at, published_version_row.published_at, now());
    NEW.is_draft := false;
    NEW.archived_at := CASE
      WHEN NEW.status::text = 'archived' THEN COALESCE(NEW.archived_at, OLD.archived_at, now())
      ELSE NULL
    END;
    RETURN NEW;
  END IF;

  -- Draft save/update: keep the draft version mutable and sync its content.
  IF is_content_changed THEN
    SELECT *
    INTO draft_version_row
    FROM public.game_versions
    WHERE game_id = OLD.id
      AND status = 'draft'
    ORDER BY version_no DESC
    LIMIT 1;

    IF draft_version_row.id IS NULL THEN
      draft_version_row := public.game_versions_create_draft(
        OLD.id,
        COALESCE(NEW.institution_id, OLD.institution_id),
        NEW.game_content,
        COALESCE(NEW.teacher_id, OLD.teacher_id, auth.uid()),
        NULL,
        1
      );
    ELSE
      UPDATE public.game_versions
      SET content = NEW.game_content
      WHERE id = draft_version_row.id;
    END IF;

    NEW.version := draft_version_row.version_no;
    NEW.published_version := COALESCE(OLD.published_version, published_version_row.version_no);
    NEW.current_published_version_id := COALESCE(OLD.current_published_version_id, published_version_row.id);
    NEW.published_at := COALESCE(OLD.published_at, published_version_row.published_at);
    NEW.is_draft := true;
    NEW.archived_at := CASE
      WHEN NEW.status::text = 'archived' THEN COALESCE(NEW.archived_at, OLD.archived_at, now())
      ELSE NULL
    END;
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.current_published_version_id, OLD.current_published_version_id) IS NOT NULL THEN
    SELECT *
    INTO published_version_row
    FROM public.game_versions
    WHERE id = COALESCE(NEW.current_published_version_id, OLD.current_published_version_id)
    LIMIT 1;

    IF published_version_row.id IS NULL THEN
      RAISE EXCEPTION 'current_published_version_id not found';
    END IF;
    IF published_version_row.game_id IS DISTINCT FROM NEW.id THEN
      RAISE EXCEPTION 'current_published_version_id does not belong to the game';
    END IF;
    IF published_version_row.status <> 'published' THEN
      RAISE EXCEPTION 'current_published_version_id must reference a published version';
    END IF;

    NEW.current_published_version_id := published_version_row.id;
    NEW.published_version := published_version_row.version_no;
    NEW.published_at := COALESCE(NEW.published_at, published_version_row.published_at);
    NEW.is_draft := false;
    IF NEW.version IS NULL THEN
      NEW.version := published_version_row.version_no;
    END IF;
  ELSE
    NEW.published_version := NULL;
    NEW.published_at := NULL;
    NEW.is_draft := true;
  END IF;
  NEW.archived_at := CASE
    WHEN NEW.status::text = 'archived' THEN COALESCE(NEW.archived_at, OLD.archived_at, now())
    ELSE NULL
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_games_game_versions() FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- games pointer guard — current_published_version_id must point at a published
-- version row for the same game
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_games_published_pointer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  published_version_row public.game_versions%ROWTYPE;
BEGIN
  IF NEW.current_published_version_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT *
  INTO published_version_row
  FROM public.game_versions
  WHERE id = NEW.current_published_version_id
  LIMIT 1;

  IF published_version_row.id IS NULL THEN
    RAISE EXCEPTION 'current_published_version_id not found';
  END IF;

  IF published_version_row.game_id IS DISTINCT FROM NEW.id THEN
    RAISE EXCEPTION 'current_published_version_id does not belong to the game';
  END IF;

  IF published_version_row.status <> 'published' THEN
    RAISE EXCEPTION 'current_published_version_id must reference a published version';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_games_published_pointer() FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- game_versions lifecycle guard — draft editable, published/archived immutable
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_game_versions_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('draft', 'published', 'archived') THEN
      RAISE EXCEPTION 'invalid game version status: %', NEW.status;
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'draft' THEN
    IF NEW.game_id IS DISTINCT FROM OLD.game_id
      OR NEW.institution_id IS DISTINCT FROM OLD.institution_id
      OR NEW.version_no IS DISTINCT FROM OLD.version_no
      OR NEW.created_by IS DISTINCT FROM OLD.created_by
      OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'draft version identity fields are immutable';
    END IF;

    IF NEW.status NOT IN ('draft', 'published', 'archived') THEN
      RAISE EXCEPTION 'invalid game version status: %', NEW.status;
    END IF;

    RETURN NEW;
  END IF;

  IF OLD.status = 'published' THEN
    IF NEW.status <> 'archived' THEN
      RAISE EXCEPTION 'published versions can only transition to archived';
    END IF;

    IF NEW.game_id IS DISTINCT FROM OLD.game_id
      OR NEW.institution_id IS DISTINCT FROM OLD.institution_id
      OR NEW.version_no IS DISTINCT FROM OLD.version_no
      OR NEW.content IS DISTINCT FROM OLD.content
      OR NEW.content_schema_version IS DISTINCT FROM OLD.content_schema_version
      OR NEW.change_note IS DISTINCT FROM OLD.change_note
      OR NEW.created_by IS DISTINCT FROM OLD.created_by
      OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'published version content is immutable';
    END IF;

    RETURN NEW;
  END IF;

  IF OLD.status = 'archived' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
      OR NEW.game_id IS DISTINCT FROM OLD.game_id
      OR NEW.institution_id IS DISTINCT FROM OLD.institution_id
      OR NEW.version_no IS DISTINCT FROM OLD.version_no
      OR NEW.content IS DISTINCT FROM OLD.content
      OR NEW.content_schema_version IS DISTINCT FROM OLD.content_schema_version
      OR NEW.change_note IS DISTINCT FROM OLD.change_note
      OR NEW.created_by IS DISTINCT FROM OLD.created_by
      OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'archived versions are immutable';
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_game_versions_lifecycle() FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- game_runs version pinning
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bind_game_run_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_game public.games%ROWTYPE;
  v_version public.game_versions%ROWTYPE;
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

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.bind_game_run_version() FROM PUBLIC;
