-- =============================================================================
-- GAME VERSIONS — snapshot metadata at publish + explicit publish_game RPC
-- Mirrors course_versions title/description/theme_id snapshot pattern so
-- draft saves on public.games do not leak into published/delivered views.
--
-- Data backfill is intentionally separated into:
--   20260609120001_game_version_snapshot_metadata_backfill.sql
-- per architecture rule: schema changes and data changes must not share a file.
-- =============================================================================

-- 1. Tables — add snapshot metadata columns ---------------------------------

ALTER TABLE public.game_versions
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS theme_id text;

COMMENT ON COLUMN public.game_versions.title IS
  'Game title copied from games at publish time; immutable for published/archived rows.';
COMMENT ON COLUMN public.game_versions.description IS
  'Game description copied from games at publish time; immutable for published/archived rows.';
COMMENT ON COLUMN public.game_versions.theme_id IS
  'Game theme copied from games at publish time; immutable for published/archived rows.';

-- 2. Constraints -----------------------------------------------------------

ALTER TABLE public.game_versions
  DROP CONSTRAINT IF EXISTS chk_game_versions_theme_id;

ALTER TABLE public.game_versions
  ADD CONSTRAINT chk_game_versions_theme_id
  CHECK (
    theme_id IS NULL
    OR theme_id IN (
      'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'orange', 'pink', 'darkblue'
    )
  );

-- 3. Functions/RPC ---------------------------------------------------------

-- guard_game_versions_lifecycle — keep published/archived metadata immutable
CREATE OR REPLACE FUNCTION public.guard_game_versions_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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
      OR NEW.title IS DISTINCT FROM OLD.title
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.theme_id IS DISTINCT FROM OLD.theme_id
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
      OR NEW.title IS DISTINCT FROM OLD.title
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.theme_id IS DISTINCT FROM OLD.theme_id
      OR NEW.created_by IS DISTINCT FROM OLD.created_by
      OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'archived versions are immutable';
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.guard_game_versions_lifecycle() IS
  'BEFORE UPDATE trigger on game_versions: enforces immutability for published and archived rows, and validates status transitions.';

-- sync_games_game_versions — snapshot metadata when promoting draft to published
CREATE OR REPLACE FUNCTION public.sync_games_game_versions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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

  IF is_legacy_publish_requested AND NEW.current_published_version_id IS NULL THEN
    SELECT *
    INTO draft_version_row
    FROM public.game_versions
    WHERE game_id = OLD.id
      AND status = 'draft'
    ORDER BY version_no DESC
    LIMIT 1;

    IF draft_version_row.id IS NULL THEN
      draft_version_row := public.create_game_version_draft(
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
          published_at = COALESCE(NEW.published_at, now()),
          content = NEW.game_content,
          title = NEW.title,
          description = NEW.description,
          theme_id = NEW.theme_id,
          updated_at = now()
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

  IF is_content_changed THEN
    SELECT *
    INTO draft_version_row
    FROM public.game_versions
    WHERE game_id = OLD.id
      AND status = 'draft'
    ORDER BY version_no DESC
    LIMIT 1;

    IF draft_version_row.id IS NULL THEN
      draft_version_row := public.create_game_version_draft(
        OLD.id,
        COALESCE(NEW.institution_id, OLD.institution_id),
        NEW.game_content,
        COALESCE(NEW.teacher_id, OLD.teacher_id, auth.uid()),
        NULL,
        1
      );
    ELSE
      UPDATE public.game_versions
      SET content = NEW.game_content,
          updated_at = now()
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

COMMENT ON FUNCTION public.sync_games_game_versions() IS
  'BEFORE INSERT/UPDATE trigger on games: maintains game_versions draft row in sync with game_content edits and promotes a draft version to published when current_published_version_id is set.';

-- publish_game — snapshot draft, promote version, optionally deliver to course
CREATE OR REPLACE FUNCTION app.publish_game(
  p_game_id uuid,
  p_course_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth
AS $$
DECLARE
  v_user_id uuid;
  v_game public.games%ROWTYPE;
  v_draft_version public.game_versions%ROWTYPE;
  v_previous_published_id uuid;
  v_link_course_id uuid;
  v_course_delivery record;
  v_delivery_id uuid;
  v_delivery_ids uuid[] := ARRAY[]::uuid[];
  v_now timestamptz := now();
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT *
  INTO v_game
  FROM public.games g
  WHERE g.id = p_game_id
    AND g.teacher_id = v_user_id
    AND g.deleted_at IS NULL
  FOR UPDATE;

  IF v_game.id IS NULL THEN
    RAISE EXCEPTION 'game not found or not owned by teacher';
  END IF;

  IF v_game.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'archived games cannot be published';
  END IF;

  IF v_game.game_content IS NULL THEN
    RAISE EXCEPTION 'game content is required before publish';
  END IF;

  v_previous_published_id := v_game.current_published_version_id;
  v_link_course_id := COALESCE(p_course_id, v_game.course_id);

  SELECT *
  INTO v_draft_version
  FROM public.game_versions gv
  WHERE gv.game_id = p_game_id
    AND gv.status = 'draft'
  ORDER BY gv.version_no DESC
  LIMIT 1
  FOR UPDATE;

  IF v_draft_version.id IS NULL THEN
    v_draft_version := public.create_game_version_draft(
      p_game_id,
      v_game.institution_id,
      v_game.game_content,
      v_user_id,
      NULL,
      1
    );
  ELSE
    UPDATE public.game_versions
    SET content = v_game.game_content,
        updated_at = v_now
    WHERE id = v_draft_version.id
    RETURNING * INTO v_draft_version;
  END IF;

  UPDATE public.game_versions
  SET status = 'published',
      published_at = v_now,
      title = v_game.title,
      description = v_game.description,
      theme_id = v_game.theme_id,
      updated_at = v_now
  WHERE id = v_draft_version.id
  RETURNING * INTO v_draft_version;

  IF v_previous_published_id IS NOT NULL
    AND v_previous_published_id <> v_draft_version.id THEN
    UPDATE public.game_versions
    SET status = 'archived',
        updated_at = v_now
    WHERE id = v_previous_published_id
      AND status = 'published';
  END IF;

  UPDATE public.games
  SET
    current_published_version_id = v_draft_version.id,
    published_version = v_draft_version.version_no,
    published_at = v_now,
    status = 'published',
    is_draft = false,
    course_id = COALESCE(p_course_id, course_id),
    updated_at = v_now
  WHERE id = p_game_id;

  IF v_link_course_id IS NOT NULL THEN
    FOR v_course_delivery IN
      SELECT cd.id, cd.institution_id, cd.classroom_id
      FROM public.course_deliveries cd
      WHERE cd.course_id = v_link_course_id
        AND cd.deleted_at IS NULL
        AND cd.published_at IS NOT NULL
        AND cd.status IN (
          'active'::public.course_delivery_status,
          'scheduled'::public.course_delivery_status,
          'offline'::public.course_delivery_status
        )
    LOOP
      UPDATE public.game_deliveries gd
      SET
        status = 'archived'::public.game_delivery_status,
        archived_at = v_now,
        updated_at = v_now
      WHERE gd.game_id = p_game_id
        AND gd.course_delivery_id = v_course_delivery.id
        AND gd.status = 'published'::public.game_delivery_status;

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
      VALUES (
        v_course_delivery.institution_id,
        p_game_id,
        v_draft_version.id,
        v_course_delivery.classroom_id,
        v_course_delivery.id,
        'published'::public.game_delivery_status,
        v_now,
        v_user_id,
        v_user_id,
        v_now,
        v_now
      )
      RETURNING id INTO v_delivery_id;

      v_delivery_ids := array_append(v_delivery_ids, v_delivery_id);
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'game_version_id', v_draft_version.id,
    'version_no', v_draft_version.version_no,
    'delivery_ids', to_jsonb(v_delivery_ids)
  );
END;
$$;

COMMENT ON FUNCTION app.publish_game(uuid, uuid) IS
  'Publish a teacher-owned game: snapshot draft content and metadata into an immutable game_version and optionally create game_deliveries for active course deliveries linked to p_course_id.';

REVOKE ALL ON FUNCTION app.publish_game(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.publish_game(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.publish_game(
  p_game_id uuid,
  p_course_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT app.publish_game(p_game_id, p_course_id);
$$;

COMMENT ON FUNCTION public.publish_game(uuid, uuid) IS
  'Public PostgREST wrapper for app.publish_game.';

REVOKE ALL ON FUNCTION public.publish_game(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_game(uuid, uuid) TO authenticated;
