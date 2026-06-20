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
AS $fn$
  SELECT $json${"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Welcome to WQ Edu 👋","type":"text","version":1}],"direction":null,"format":"","indent":0,"tag":"h1","type":"heading","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Type ","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"/","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" anywhere to open the block menu - pick headings, images, lists, videos, and more. ","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"Select any text","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" and a floating toolbar appears for bold, links, and quick edits. Your lesson saves automatically as you write.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Get started in three steps","type":"text","version":1}],"direction":null,"format":"","indent":0,"tag":"h2","type":"heading","version":1},{"children":[{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Click in the lesson and type / to see all block types.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Highlight text to format it from the floating toolbar.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Replace this starter page with your own lesson content.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1}],"direction":null,"format":"","indent":0,"listType":"number","start":1,"tag":"ol","type":"list","version":1},{"type":"youtube","version":1,"format":"","videoID":"FXIrojSK3Jo"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Blocks you can use","type":"text","version":1}],"direction":null,"format":"","indent":0,"tag":"h2","type":"heading","version":1},{"children":[{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Text - everyday lesson writing. Press Enter for a new paragraph.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Headings (H1, H2, H3) - titles and sections. Use H1 once for the lesson title, then H2 and H3 to structure the page.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Image - upload a file or choose one from Cloud.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Emoji - add emoji inside a sentence.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"YouTube video - paste a link to embed a video (see the example above).","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"To-do list - checkboxes for your own planning notes.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Bulleted and numbered lists - steps, key points, or summaries.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Quote - citations or highlighted remarks.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","value":1,"version":1}],"direction":null,"format":"","indent":0,"listType":"bullet","start":1,"tag":"ul","type":"list","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Saving your work","type":"text","version":1}],"direction":null,"format":"","indent":0,"tag":"h2","type":"heading","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"After you stop typing for a moment, your draft is saved for you. When you publish, learners see a stable snapshot of that version.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Inspired by Notion - thank you for showing how a notes app can feel simple and right. https://www.notion.so/","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"quote","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Tip: Delete or edit any block on this page - it is only here to help you learn the editor.","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}$json$::jsonb;
$fn$;

COMMENT ON FUNCTION app.default_lesson_starter_lexical_state() IS
  'Canonical default Lexical starter document for newly created lessons - editor onboarding with slash menu, floating toolbar, block examples, and YouTube embed.';

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
