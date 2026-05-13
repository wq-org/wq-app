-- =============================================================================
-- Atomic batch upsert for lesson_blocks.
--
-- Replaces the per-row syncLessonBlocksForLesson client logic (one
-- INSERT/UPDATE/DELETE per block) which was causing statement_timeout (57014)
-- on Lexical autosave: every block re-ran RLS helpers + the
-- trg_lesson_blocks_before_insert_set_institution trigger, and per-statement
-- transactions defeated uq_lesson_blocks_lesson_meta_order DEFERRABLE INITIALLY
-- DEFERRED so reorder saves could also hit 23505.
--
-- Lives in the public schema because the Supabase API exposes public; auth
-- helpers in the app schema are still reachable from inside the function body.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 5. Functions / RPC
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_lesson_blocks(
  p_lesson_id              uuid,
  p_blocks                 jsonb,
  p_allow_delete_trailing  boolean DEFAULT true
)
RETURNS SETOF public.lesson_blocks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  v_institution_id uuid;
  v_keep_ids       uuid[];
  v_invalid_count  int;
BEGIN
  SELECT course_row.institution_id
    INTO v_institution_id
    FROM public.lessons lesson_row
    INNER JOIN public.topics  topic_row  ON topic_row.id  = lesson_row.topic_id
    INNER JOIN public.courses course_row ON course_row.id = topic_row.course_id
   WHERE lesson_row.id = p_lesson_id;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'upsert_lesson_blocks: lesson % has no resolvable institution', p_lesson_id
      USING ERRCODE = '23502';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin()) IS TRUE
    OR app.teacher_can_manage_lesson(p_lesson_id)
    OR v_institution_id IN (SELECT app.admin_institution_ids())
  ) THEN
    RAISE EXCEPTION 'upsert_lesson_blocks: permission denied for lesson %', p_lesson_id
      USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(array_agg((elem->>'id')::uuid) FILTER (WHERE elem ? 'id'), ARRAY[]::uuid[])
    INTO v_keep_ids
    FROM jsonb_array_elements(p_blocks) AS elem;

  IF array_length(v_keep_ids, 1) IS NOT NULL THEN
    SELECT count(*)
      INTO v_invalid_count
      FROM unnest(v_keep_ids) AS provided(id)
     WHERE NOT EXISTS (
       SELECT 1
         FROM public.lesson_blocks block_row
        WHERE block_row.id        = provided.id
          AND block_row.lesson_id = p_lesson_id
     );

    IF v_invalid_count > 0 THEN
      RAISE EXCEPTION 'upsert_lesson_blocks: % block id(s) do not belong to lesson %',
        v_invalid_count, p_lesson_id
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_allow_delete_trailing THEN
    DELETE FROM public.lesson_blocks
     WHERE lesson_id = p_lesson_id
       AND id <> ALL (v_keep_ids);
  END IF;

  INSERT INTO public.lesson_blocks (
    id,
    lesson_id,
    institution_id,
    block_type,
    value,
    meta_order,
    meta_depth,
    content_schema_version
  )
  SELECT
    COALESCE((elem->>'id')::uuid, gen_random_uuid()),
    p_lesson_id,
    v_institution_id,
    elem->>'block_type',
    elem->'value',
    (ord - 1)::int,
    COALESCE((elem->>'meta_depth')::int, 0),
    COALESCE((elem->>'content_schema_version')::int, 1)
  FROM jsonb_array_elements(p_blocks) WITH ORDINALITY AS t(elem, ord)
  ON CONFLICT (id) DO UPDATE
     SET block_type             = EXCLUDED.block_type,
         value                  = EXCLUDED.value,
         meta_order             = EXCLUDED.meta_order,
         meta_depth             = EXCLUDED.meta_depth,
         content_schema_version = EXCLUDED.content_schema_version,
         updated_at             = now();

  RETURN QUERY
    SELECT *
      FROM public.lesson_blocks
     WHERE lesson_id = p_lesson_id
     ORDER BY meta_order;
END;
$$;

COMMENT ON FUNCTION public.upsert_lesson_blocks(uuid, jsonb, boolean) IS
  'Atomic batch upsert of lesson blocks. Authorizes once per save '
  '(super_admin OR course teacher OR institution_admin for the course institution); '
  'rejects any provided block id that does not already belong to p_lesson_id; '
  'when p_allow_delete_trailing is true (default) deletes blocks the client no '
  'longer references, then upserts all incoming blocks in payload order within '
  'the SAME transaction so the deferred unique constraint on '
  '(lesson_id, meta_order) is honored end-to-end. Callers pass false while the '
  'editor is still hydrating its tail to avoid nuking unloaded blocks. '
  'SECURITY DEFINER with row_security=off and empty search_path; all object '
  'refs fully qualified.';

REVOKE ALL    ON FUNCTION public.upsert_lesson_blocks(uuid, jsonb, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_lesson_blocks(uuid, jsonb, boolean) TO authenticated;
