-- HETZNER_TEARDOWN: KEEP_CORE | personal notes feature — required
-- =============================================================================
-- PERSONAL NOTES — single-row JSONB note document (doc 06 MVP)
-- =============================================================================
-- Restores the personal notes backing schema. The combined tasks_notes
-- migrations were deleted with the chat/tasks removal, which dropped the notes
-- table the still-shipped notes feature depends on (frontend:
-- src/features/notes) — surfacing as "Could not find the table
-- 'public.notes_list' in the schema cache".
--
-- Personal-only: the former collaborative variant (task_group_id,
-- scope='collaborative') depended on the removed task_groups/task_deliveries
-- tables and is intentionally NOT restored.
--
-- Privacy (principle_dsgvo_audit_datendefinition.md §2.3, §"Notes persönlich"):
-- note content is personal content. Access is owner-only, enforced by RLS —
-- never exposed to institution/super admins — and note content is never written
-- to audit.events (no audit trigger on this table).
-- =============================================================================

-- 1. Types
DO $$ BEGIN
  CREATE TYPE public.note_scope AS ENUM ('personal');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.note_scope IS
  'Note visibility scope. Personal-only; the collaborative scope was removed with the tasks feature.';

-- 2. Tables
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  scope public.note_scope NOT NULL DEFAULT 'personal',
  title text,
  description text,
  theme_id text,
  content jsonb DEFAULT '{}'::jsonb,
  content_schema_version integer NOT NULL DEFAULT 1,
  is_pinned boolean NOT NULL DEFAULT FALSE,
  lesson_id uuid REFERENCES public.lessons (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

COMMENT ON TABLE public.notes IS
  'Single-row JSONB personal note document (doc 06 MVP); owner-private content.';
COMMENT ON COLUMN public.notes.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.notes.owner_user_id IS 'Creator / owner; only the owner may access the note.';
COMMENT ON COLUMN public.notes.scope IS 'Note visibility scope; personal-only.';
COMMENT ON COLUMN public.notes.description IS 'Optional short description for the note.';
COMMENT ON COLUMN public.notes.theme_id IS 'ThemeId color identifier for the note visual accent.';
COMMENT ON COLUMN public.notes.content IS 'Lexical rich-text document stored as JSONB; NULL or {} allowed.';
COMMENT ON COLUMN public.notes.content_schema_version IS 'Schema version for the content JSONB structure.';
COMMENT ON COLUMN public.notes.lesson_id IS 'Optional link to a lesson/slide context.';

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_notes_institution_id ON public.notes (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_owner_user_id ON public.notes (owner_user_id) WHERE deleted_at IS NULL;

-- 5. Functions/RPC
CREATE OR REPLACE FUNCTION public.note_content_preview(p_content jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN p_content IS NULL THEN NULL
    ELSE jsonb_build_object(
      'text', (
        SELECT left(string_agg(t, ' '), 1000)
        FROM (
          SELECT elem->>'text' AS t
          FROM jsonb_array_elements(p_content->'root'->'children') AS block,
               LATERAL jsonb_array_elements(block->'children') AS elem
          WHERE (elem->>'type') = 'text'
          UNION ALL
          SELECT inner_elem->>'text' AS t
          FROM jsonb_array_elements(p_content->'root'->'children') AS block,
               LATERAL jsonb_array_elements(block->'children') AS list_item,
               LATERAL jsonb_array_elements(list_item->'children') AS inner_elem
          WHERE (block->>'type') = 'list'
            AND (inner_elem->>'type') = 'text'
          LIMIT 200
        ) sub
        WHERE t IS NOT NULL AND t <> ''
      ),
      'imageUrl', (
        SELECT elem->>'src'
        FROM jsonb_array_elements(p_content->'root'->'children') AS block,
             LATERAL jsonb_array_elements(block->'children') AS elem
        WHERE (elem->>'type') = 'image'
          AND (elem->>'src') IS NOT NULL
        LIMIT 1
      )
    )
  END
$$;

COMMENT ON FUNCTION public.note_content_preview(jsonb) IS
  'Extracts a lightweight preview (up to 1000 chars of text + first image src) from a Lexical JSONB document.';

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
  'Creates a personal note for the authenticated user. Institution ID is resolved server-side from user memberships and default content is seeded when no content is supplied.';

REVOKE ALL ON FUNCTION public.create_personal_note(text, text, text, jsonb, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_personal_note(text, text, text, jsonb, integer) TO authenticated;

CREATE OR REPLACE VIEW public.notes_list WITH (security_invoker = true) AS
SELECT
  id,
  institution_id,
  owner_user_id,
  scope,
  title,
  description,
  theme_id,
  is_pinned,
  lesson_id,
  created_at,
  updated_at,
  deleted_at,
  content_schema_version,
  public.note_content_preview(content)::text AS content_preview
FROM public.notes;

COMMENT ON VIEW public.notes_list IS
  'Lightweight note list: metadata + content preview only (security_invoker, owner-scoped by notes RLS). Use for list endpoints; query notes directly for editor loads.';

GRANT SELECT ON public.notes_list TO authenticated;

-- 6. Triggers
DROP TRIGGER IF EXISTS trg_notes_set_updated_at ON public.notes;
CREATE TRIGGER trg_notes_set_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 7. RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes FORCE ROW LEVEL SECURITY;

-- Owner-only access. Personal note content is not exposed to institution or
-- super admins (principle_dsgvo_audit_datendefinition.md — "Notes persönlich").
DROP POLICY IF EXISTS notes_all_own ON public.notes;
CREATE POLICY notes_all_own ON public.notes
  FOR ALL TO authenticated
  USING (owner_user_id = (SELECT app.auth_uid()))
  WITH CHECK (owner_user_id = (SELECT app.auth_uid()));
