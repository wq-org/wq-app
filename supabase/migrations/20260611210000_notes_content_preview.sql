-- =============================================================================
-- NOTES — Content preview extraction function + list view
-- Reduces list-query payload: extracts up to 1000 chars of text + first image
-- URL from the Lexical JSONB content, instead of returning the full document.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: extract { text, imageUrl } preview from a Lexical serialized state.
-- IMMUTABLE + PARALLEL SAFE because it only transforms its input.
-- ---------------------------------------------------------------------------
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
          -- Depth 1: direct text children of block nodes (paragraph, heading, quote …)
          SELECT elem->>'text' AS t
          FROM jsonb_array_elements(p_content->'root'->'children') AS block,
               LATERAL jsonb_array_elements(block->'children') AS elem
          WHERE (elem->>'type') = 'text'
          UNION ALL
          -- Depth 2: text children inside list items
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

-- ---------------------------------------------------------------------------
-- View: notes_list — replaces direct table reads for list endpoints.
-- security_invoker = true: caller identity is used → RLS on notes applies.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.notes_list WITH (security_invoker = true) AS
SELECT
  id,
  institution_id,
  owner_user_id,
  task_group_id,
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
  'Lightweight note list: metadata + content preview only. Use this for list endpoints; query notes directly for editor loads.';

GRANT SELECT ON public.notes_list TO anon, authenticated;
