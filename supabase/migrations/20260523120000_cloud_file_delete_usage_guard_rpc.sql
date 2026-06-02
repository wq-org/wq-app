-- =============================================================================
-- CLOUD FILES — Delete guard: links + inline content references
-- =============================================================================
-- Blocks storage/cloud_files deletion when the asset is still referenced in
-- cloud_file_links OR embedded in games / game_versions / lessons JSON content
-- (filepath / cloudFileId), even when links were never synced.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_cloud_file_delete_blocker_message(
  p_storage_object_name text
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_path text;
  v_cf_id uuid;
  v_cf_institution_id uuid;
  v_link_summary text;
  v_game_count integer := 0;
  v_version_count integer := 0;
  v_lesson_count integer := 0;
  v_parts text[] := ARRAY[]::text[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION
      USING ERRCODE = 'insufficient_privilege',
            MESSAGE = 'authentication required';
  END IF;

  v_path := btrim(p_storage_object_name);
  IF v_path = '' THEN
    RETURN 'File path is required';
  END IF;

  SELECT cf.id, cf.institution_id
  INTO v_cf_id, v_cf_institution_id
  FROM public.cloud_files cf
  WHERE cf.storage_object_name = v_path
    AND cf.status = 'active'::public.cloud_file_status
  LIMIT 1;

  IF v_cf_id IS NOT NULL AND NOT app.user_can_manage_cloud_file(v_cf_id) THEN
    RAISE EXCEPTION
      USING ERRCODE = 'insufficient_privilege',
            MESSAGE = 'forbidden: caller cannot manage cloud_file';
  END IF;

  IF v_cf_id IS NOT NULL THEN
    SELECT string_agg(
      format('%s %s', cnt, entity_type),
      ', '
      ORDER BY entity_type
    )
    INTO v_link_summary
    FROM (
      SELECT l.link_entity_type::text AS entity_type, count(*)::integer AS cnt
      FROM public.cloud_file_links l
      WHERE l.cloud_file_id = v_cf_id
      GROUP BY l.link_entity_type
    ) grouped;

    IF v_link_summary IS NOT NULL AND v_link_summary <> '' THEN
      v_parts := array_append(v_parts, v_link_summary);
    END IF;
  END IF;

  SELECT count(*)::integer
  INTO v_game_count
  FROM public.games g
  WHERE g.institution_id IN (SELECT app.member_institution_ids())
    AND (
      v_cf_institution_id IS NULL
      OR g.institution_id = v_cf_institution_id
    )
    AND g.game_content IS NOT NULL
    AND (
      position(v_path IN g.game_content::text) > 0
      OR (v_cf_id IS NOT NULL AND position(v_cf_id::text IN g.game_content::text) > 0)
    );

  IF v_game_count > 0 THEN
    v_parts := array_append(
      v_parts,
      format('%s game%s', v_game_count, CASE WHEN v_game_count = 1 THEN '' ELSE 's' END)
    );
  END IF;

  SELECT count(*)::integer
  INTO v_version_count
  FROM public.game_versions gv
  WHERE gv.institution_id IN (SELECT app.member_institution_ids())
    AND (
      v_cf_institution_id IS NULL
      OR gv.institution_id = v_cf_institution_id
    )
    AND (
      position(v_path IN gv.content::text) > 0
      OR (v_cf_id IS NOT NULL AND position(v_cf_id::text IN gv.content::text) > 0)
    );

  IF v_version_count > 0 THEN
    v_parts := array_append(
      v_parts,
      format('%s game version%s', v_version_count, CASE WHEN v_version_count = 1 THEN '' ELSE 's' END)
    );
  END IF;

  -- lessons have no institution_id; tenant is courses.institution_id via topics
  SELECT count(*)::integer
  INTO v_lesson_count
  FROM public.lessons l
  INNER JOIN public.topics topic_row ON topic_row.id = l.topic_id
  INNER JOIN public.courses course_row ON course_row.id = topic_row.course_id
  WHERE course_row.institution_id IN (SELECT app.member_institution_ids())
    AND (
      v_cf_institution_id IS NULL
      OR course_row.institution_id = v_cf_institution_id
    )
    AND l.content IS NOT NULL
    AND (
      position(v_path IN l.content::text) > 0
      OR (v_cf_id IS NOT NULL AND position(v_cf_id::text IN l.content::text) > 0)
    );

  IF v_lesson_count > 0 THEN
    v_parts := array_append(
      v_parts,
      format('%s lesson%s', v_lesson_count, CASE WHEN v_lesson_count = 1 THEN '' ELSE 's' END)
    );
  END IF;

  IF coalesce(array_length(v_parts, 1), 0) = 0 THEN
    RETURN NULL;
  END IF;

  RETURN format('Used in %s. Remove it from content first.', array_to_string(v_parts, ', '));
END;
$$;

COMMENT ON FUNCTION public.get_cloud_file_delete_blocker_message(text) IS
  'Returns a user-facing delete-block message when a cloud storage object is still referenced in cloud_file_links, games, game_versions, or lesson drafts (tenant via courses.institution_id). NULL if delete may proceed.';

REVOKE ALL ON FUNCTION public.get_cloud_file_delete_blocker_message(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_cloud_file_delete_blocker_message(text) TO authenticated;
