-- =============================================================================
-- LESSONS — seed new lessons with starter Lexical content
--
-- Problem:
-- - create_teacher_lesson currently seeds an empty Lexical body.
-- - brand-new lessons therefore open blank until the author types something.
--
-- Fix:
-- - add a dedicated starter-content factory for lesson creation
-- - keep the legacy 3-arg RPC as a wrapper for compatibility
-- - allow the new 5-arg RPC to accept explicit starter content from the app
-- =============================================================================

CREATE OR REPLACE FUNCTION app.default_lesson_starter_lexical_state()
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = public, auth, pg_temp
AS $$
  SELECT '{
    "root": {
      "children": [
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Start writing your lesson content here. Add goals, context, and the key learning outcome for this lesson.",
              "type": "text",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "textFormat": 0,
          "textStyle": "",
          "type": "paragraph",
          "version": 1
        },
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Lesson overview",
              "type": "text",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "tag": "h1",
          "type": "heading",
          "version": 1
        },
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Serious Games can help learners explore complex topics through interaction, repetition, and feedback.",
              "type": "text",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "textFormat": 0,
          "textStyle": "",
          "type": "paragraph",
          "version": 1
        },
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Learning objectives",
              "type": "text",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "tag": "h2",
          "type": "heading",
          "version": 1
        },
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Use Serious Games in this lesson to connect theory with practice and improve learner engagement.",
              "type": "text",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "textFormat": 0,
          "textStyle": "",
          "type": "paragraph",
          "version": 1
        },
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Key points",
              "type": "text",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "tag": "h3",
          "type": "heading",
          "version": 1
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Introduce the topic clearly",
                      "type": "text",
                      "version": 1
                    }
                  ],
                  "direction": null,
                  "format": "",
                  "indent": 0,
                  "textFormat": 0,
                  "textStyle": "",
                  "type": "paragraph",
                  "version": 1
                }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "listitem",
              "value": 1,
              "version": 1
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Guide learners through the activity",
                      "type": "text",
                      "version": 1
                    }
                  ],
                  "direction": null,
                  "format": "",
                  "indent": 0,
                  "textFormat": 0,
                  "textStyle": "",
                  "type": "paragraph",
                  "version": 1
                }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "listitem",
              "value": 1,
              "version": 1
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Summarize the expected outcome",
                      "type": "text",
                      "version": 1
                    }
                  ],
                  "direction": null,
                  "format": "",
                  "indent": 0,
                  "textFormat": 0,
                  "textStyle": "",
                  "type": "paragraph",
                  "version": 1
                }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "listitem",
              "value": 1,
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "listType": "bullet",
          "start": 1,
          "tag": "ul",
          "type": "list",
          "version": 1
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Explain the task",
                      "type": "text",
                      "version": 1
                    }
                  ],
                  "direction": null,
                  "format": "",
                  "indent": 0,
                  "textFormat": 0,
                  "textStyle": "",
                  "type": "paragraph",
                  "version": 1
                }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "listitem",
              "value": 1,
              "version": 1
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Let learners interact with the content",
                      "type": "text",
                      "version": 1
                    }
                  ],
                  "direction": null,
                  "format": "",
                  "indent": 0,
                  "textFormat": 0,
                  "textStyle": "",
                  "type": "paragraph",
                  "version": 1
                }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "listitem",
              "value": 1,
              "version": 1
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Review the result together",
                      "type": "text",
                      "version": 1
                    }
                  ],
                  "direction": null,
                  "format": "",
                  "indent": 0,
                  "textFormat": 0,
                  "textStyle": "",
                  "type": "paragraph",
                  "version": 1
                }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "listitem",
              "value": 1,
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "listType": "number",
          "start": 1,
          "tag": "ol",
          "type": "list",
          "version": 1
        },
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Good learning design combines clarity, structure, and interaction.",
              "type": "text",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "type": "quote",
          "version": 1
        }
      ],
      "direction": null,
      "format": "",
      "indent": 0,
      "type": "root",
      "version": 1
    }
  }'::jsonb;
$$;

COMMENT ON FUNCTION app.default_lesson_starter_lexical_state() IS
  'Canonical default Lexical starter document for newly created lessons.';

CREATE OR REPLACE FUNCTION public.create_teacher_lesson(
  p_topic_id uuid,
  p_title text,
  p_description text DEFAULT '',
  p_content jsonb DEFAULT NULL,
  p_content_schema_version integer DEFAULT 1
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  content jsonb,
  content_schema_version integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  IF NOT app.teacher_can_manage_topic(p_topic_id) THEN
    RAISE EXCEPTION 'unauthorized: not topic owner';
  END IF;

  RETURN QUERY
  INSERT INTO public.lessons (
    title,
    description,
    topic_id,
    content,
    content_schema_version
  )
  VALUES (
    btrim(COALESCE(p_title, '')),
    COALESCE(p_description, ''),
    p_topic_id,
    COALESCE(p_content, app.default_lesson_starter_lexical_state()),
    GREATEST(COALESCE(p_content_schema_version, 1), 1)
  )
  RETURNING
    lessons.id,
    lessons.title,
    lessons.description,
    lessons.content,
    lessons.content_schema_version,
    lessons.created_at,
    lessons.updated_at;
END;
$$;

COMMENT ON FUNCTION public.create_teacher_lesson(uuid, text, text, jsonb, integer) IS
  'Teacher-only lesson create RPC that accepts seeded starter content when the client provides it.';

REVOKE ALL ON FUNCTION public.create_teacher_lesson(uuid, text, text, jsonb, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_teacher_lesson(uuid, text, text, jsonb, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_teacher_lesson(
  p_topic_id uuid,
  p_title text,
  p_description text DEFAULT ''
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  content jsonb,
  content_schema_version integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.create_teacher_lesson(
    p_topic_id,
    p_title,
    p_description,
    app.default_lesson_starter_lexical_state(),
    1
  );
END;
$$;

COMMENT ON FUNCTION public.create_teacher_lesson(uuid, text, text) IS
  'Compatibility wrapper that preserves the legacy 3-arg create RPC while seeding starter content.';

REVOKE ALL ON FUNCTION public.create_teacher_lesson(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_teacher_lesson(uuid, text, text) TO authenticated;
