-- =============================================================================
-- NOTES — seed new personal notes with the lesson starter Lexical document
--
-- Problem:
-- - create_personal_note currently seeds an empty Lexical body ('{}'::jsonb).
-- - Brand-new notes therefore open blank — same UX gap that lessons had before
--   20260517103000_lessons_default_starter_content.sql.
--
-- Fix:
-- - reuse the existing app.default_lesson_starter_lexical_state() helper
-- - add an optional p_content parameter so the client can seed custom content
-- - keep the legacy 3-arg call shape working: extra params default to NULL/1
--   and PostgREST omits them from the call when the client doesn't supply them
--
-- Safety:
-- - app.default_lesson_starter_lexical_state() is IMMUTABLE and reads no tables,
--   so reusing it here introduces no RLS recursion risk.
-- - app.member_institution_ids() is the standard SECURITY DEFINER helper with
--   bounded RLS bypass (see principle_database.md "Related project helpers").
-- =============================================================================

DROP FUNCTION IF EXISTS public.create_personal_note(text, text, text);

CREATE OR REPLACE FUNCTION public.create_personal_note(
  p_title                  text    DEFAULT NULL,
  p_description            text    DEFAULT NULL,
  p_theme_id               text    DEFAULT NULL,
  p_content                jsonb   DEFAULT NULL,
  p_content_schema_version integer DEFAULT 1
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
    NULLIF(btrim(COALESCE(p_title, '')), ''),
    NULLIF(btrim(COALESCE(p_description, '')), ''),
    p_theme_id,
    COALESCE(p_content, app.default_lesson_starter_lexical_state()),
    GREATEST(COALESCE(p_content_schema_version, 1), 1)
  )
  RETURNING *;
END;
$$;

COMMENT ON FUNCTION public.create_personal_note(text, text, text, jsonb, integer) IS
  'Creates a personal note for the authenticated user. Institution ID is resolved '
  'server-side from user memberships — never trusted from client input. Reuses '
  'app.default_lesson_starter_lexical_state() to seed the editor when no content '
  'is supplied, matching the create_teacher_lesson onboarding flow.';

REVOKE ALL ON FUNCTION public.create_personal_note(text, text, text, jsonb, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_personal_note(text, text, text, jsonb, integer) TO authenticated;
