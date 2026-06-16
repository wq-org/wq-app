-- =============================================================================
-- Classroom: teacher-facing create RPC + prerequisite schema decoupling
--
-- 1. Add optional description column to classrooms.
-- 2. Make class_group_id nullable and drop the FK to class_groups.
--    Rationale: school hierarchy teardown (WQ-ORG-HIERARCHY) decouples
--    classrooms from org hierarchy; classrooms.class_group_id will eventually
--    be dropped entirely. Making it nullable here is the non-breaking first step.
-- 3. Add RPC create_teacher_classroom so a primary teacher can create a
--    classroom without institution_admin privileges.
-- =============================================================================

-- 1. Description column
ALTER TABLE public.classrooms
  ADD COLUMN IF NOT EXISTS description text;

COMMENT ON COLUMN public.classrooms.description IS
  'Optional free-text description shown on the classroom card.';

-- 2. Decouple class_group_id from the org hierarchy
ALTER TABLE public.classrooms
  ALTER COLUMN class_group_id DROP NOT NULL;

ALTER TABLE public.classrooms
  DROP CONSTRAINT IF EXISTS fk_classrooms_class_groups;

COMMENT ON COLUMN public.classrooms.class_group_id IS
  'Legacy org-hierarchy binding; nullable since 2026-06-16 teardown step. Will be dropped once class_groups table is removed.';

-- 3. RPC — teacher creates their own classroom
CREATE OR REPLACE FUNCTION public.create_teacher_classroom(
  p_title       text,
  p_description text DEFAULT NULL
)
RETURNS TABLE (
  id                    uuid,
  institution_id        uuid,
  primary_teacher_id    uuid,
  title                 text,
  description           text,
  status                text,
  created_at            timestamptz,
  updated_at            timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_institution_id  uuid;
  v_user_id         uuid;
  v_classroom_id    uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Resolve caller's active institution; must be a teacher or institution_admin.
  SELECT m.institution_id
    INTO v_institution_id
    FROM public.institution_memberships m
   WHERE m.user_id = v_user_id
     AND m.status  = 'active'
     AND m.membership_role IN ('teacher', 'institution_admin')
     AND m.deleted_at IS NULL
     AND m.left_institution_at IS NULL
   LIMIT 1;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'Caller has no active teacher membership in any institution';
  END IF;

  -- Insert classroom (class_group_id omitted; nullable after migration).
  INSERT INTO public.classrooms (
    institution_id,
    primary_teacher_id,
    title,
    description,
    status
  )
  VALUES (
    v_institution_id,
    v_user_id,
    trim(p_title),
    trim(p_description),
    'active'
  )
  RETURNING public.classrooms.id INTO v_classroom_id;

  -- Ensure primary teacher has an active co_teacher membership row so
  -- app.list_active_classroom_ids() and classroom RLS helpers see the classroom.
  INSERT INTO public.classroom_members (
    institution_id,
    classroom_id,
    user_id,
    membership_role
  )
  VALUES (
    v_institution_id,
    v_classroom_id,
    v_user_id,
    'co_teacher'
  )
  ON CONFLICT DO NOTHING;

  RETURN QUERY
    SELECT
      c.id,
      c.institution_id,
      c.primary_teacher_id,
      c.title,
      c.description,
      c.status,
      c.created_at,
      c.updated_at
    FROM public.classrooms c
   WHERE c.id = v_classroom_id;
END;
$$;

COMMENT ON FUNCTION public.create_teacher_classroom(text, text) IS
  'Creates a classroom for the calling teacher: resolves institution_id from active membership, sets primary_teacher_id = auth.uid(), and inserts a co_teacher classroom_members row so RLS helpers stay consistent. SECURITY DEFINER because teachers lack direct INSERT on classrooms.';

GRANT EXECUTE ON FUNCTION public.create_teacher_classroom(text, text) TO authenticated;
