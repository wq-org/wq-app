-- =============================================================================
-- NOTES — create_personal_note RPC
-- Institution ID is resolved server-side from the user's active membership —
-- never trusted from client input. Same pattern as create_teacher_lesson.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_personal_note(
  p_title       text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_theme_id    text DEFAULT NULL
)
RETURNS SETOF public.notes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id        uuid;
  v_institution_id uuid;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Resolve institution_id via the existing membership helper.
  -- app.member_institution_ids() is SECURITY DEFINER and performs its own
  -- bounded RLS bypass, so this call does not introduce recursion.
  SELECT mid INTO v_institution_id
  FROM app.member_institution_ids() AS mid
  LIMIT 1;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'No active institution membership found';
  END IF;

  RETURN QUERY
  INSERT INTO public.notes (
    institution_id,
    owner_user_id,
    scope,
    title,
    description,
    theme_id,
    content,
    content_schema_version
  )
  VALUES (
    v_institution_id,
    v_user_id,
    'personal'::public.note_scope,
    NULLIF(TRIM(COALESCE(p_title, '')), ''),
    NULLIF(TRIM(COALESCE(p_description, '')), ''),
    p_theme_id,
    '{}'::jsonb,
    1
  )
  RETURNING *;
END;
$$;

COMMENT ON FUNCTION public.create_personal_note(text, text, text) IS
  'Creates a personal note for the authenticated user. Institution ID is resolved '
  'server-side from user memberships — never trusted from client input.';

REVOKE ALL ON FUNCTION public.create_personal_note(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_personal_note(text, text, text) TO authenticated;
