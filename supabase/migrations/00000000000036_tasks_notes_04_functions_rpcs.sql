-- HETZNER_TEARDOWN: KEEP_CORE | WQ-MINIMAL-CORE | task_deliveries/tasks feature — required | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- TASKS & NOTES — Functions & RPCs
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- Audit task delivery state transitions.
CREATE OR REPLACE FUNCTION audit.log_task_delivery_state_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM audit.log_event(
      p_event_type := 'task_delivery.status_changed',
      p_subject_type := 'task_delivery',
      p_subject_id := NEW.id,
      p_institution_id := NEW.institution_id,
      p_payload := jsonb_build_object(
        'old_status', OLD.status::text,
        'new_status', NEW.status::text
      ),
      p_metadata := jsonb_build_object(
        'visibility_level', 'institution_admin',
        'context', jsonb_build_object(
          'task_delivery_id', NEW.id,
          'task_template_id', NEW.task_template_id,
          'task_template_version_id', NEW.task_template_version_id
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION audit.log_task_delivery_state_change() IS
  'Audit trigger for task_delivery status transitions with template/version context.';

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
