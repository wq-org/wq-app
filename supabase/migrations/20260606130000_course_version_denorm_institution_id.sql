-- =============================================================================
-- Denormalize institution_id onto course_version_topics and course_version_lessons.
-- Also adds course_version_id directly onto course_version_lessons.
--
-- Why: RLS policies on these tables previously resolved institution_id by
-- joining back through the parent table chain on every row evaluated.
-- With a local institution_id column, the institution_admin policy becomes a
-- single IN-list check; the teacher/student policies lose one JOIN hop.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tables — add columns (nullable first; backfill; then NOT NULL)
-- -----------------------------------------------------------------------------

ALTER TABLE public.course_version_topics
  ADD COLUMN IF NOT EXISTS institution_id uuid;

COMMENT ON COLUMN public.course_version_topics.institution_id IS
  'Denormalized tenant key copied from parent course_versions.institution_id at insert time. Enables direct RLS filtering without joining back to course_versions.';

ALTER TABLE public.course_version_lessons
  ADD COLUMN IF NOT EXISTS institution_id uuid;

COMMENT ON COLUMN public.course_version_lessons.institution_id IS
  'Denormalized tenant key copied from grandparent course_versions.institution_id at insert time. Enables direct RLS filtering without a 3-table join.';

ALTER TABLE public.course_version_lessons
  ADD COLUMN IF NOT EXISTS course_version_id uuid;

COMMENT ON COLUMN public.course_version_lessons.course_version_id IS
  'Denormalized FK to course_versions.id copied from parent course_version_topics.course_version_id. Enables teacher/student RLS policies to join directly to course_versions, avoiding the intermediate course_version_topics join.';

-- -----------------------------------------------------------------------------
-- 2. Backfill from parent tables
-- -----------------------------------------------------------------------------

UPDATE public.course_version_topics cvt
SET institution_id = cv.institution_id
FROM public.course_versions cv
WHERE cv.id = cvt.course_version_id
  AND cvt.institution_id IS NULL;

UPDATE public.course_version_lessons cvl
SET
  institution_id = cv.institution_id,
  course_version_id = cvt.course_version_id
FROM public.course_version_topics cvt
INNER JOIN public.course_versions cv ON cv.id = cvt.course_version_id
WHERE cvt.id = cvl.course_version_topic_id
  AND (cvl.institution_id IS NULL OR cvl.course_version_id IS NULL);

-- -----------------------------------------------------------------------------
-- 3. Enforce NOT NULL now that backfill is complete
-- -----------------------------------------------------------------------------

ALTER TABLE public.course_version_topics
  ALTER COLUMN institution_id SET NOT NULL;

ALTER TABLE public.course_version_lessons
  ALTER COLUMN institution_id SET NOT NULL;

ALTER TABLE public.course_version_lessons
  ALTER COLUMN course_version_id SET NOT NULL;

-- -----------------------------------------------------------------------------
-- 4. Add FK constraint for the new course_version_id column
-- -----------------------------------------------------------------------------

ALTER TABLE public.course_version_lessons
  ADD CONSTRAINT fk_course_version_lessons_course_versions
  FOREIGN KEY (course_version_id)
  REFERENCES public.course_versions (id)
  ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- 5. Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_course_version_topics_institution_id
  ON public.course_version_topics (institution_id);

CREATE INDEX IF NOT EXISTS idx_course_version_lessons_institution_id
  ON public.course_version_lessons (institution_id);

CREATE INDEX IF NOT EXISTS idx_course_version_lessons_course_version_id
  ON public.course_version_lessons (course_version_id);

-- -----------------------------------------------------------------------------
-- 6. Triggers — keep institution_id and course_version_id in sync on INSERT
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION app.set_course_version_topic_institution_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, pg_temp
AS $$
BEGIN
  SELECT cv.institution_id
  INTO NEW.institution_id
  FROM public.course_versions cv
  WHERE cv.id = NEW.course_version_id;

  IF NEW.institution_id IS NULL THEN
    RAISE EXCEPTION 'course_version % not found when inserting course_version_topic', NEW.course_version_id;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION app.set_course_version_topic_institution_id IS
  'Trigger function: auto-populates institution_id on course_version_topics from parent course_versions row.';

DROP TRIGGER IF EXISTS trg_course_version_topics_set_institution_id ON public.course_version_topics;

CREATE TRIGGER trg_course_version_topics_set_institution_id
  BEFORE INSERT ON public.course_version_topics
  FOR EACH ROW
  WHEN (NEW.institution_id IS NULL)
  EXECUTE FUNCTION app.set_course_version_topic_institution_id();

CREATE OR REPLACE FUNCTION app.set_course_version_lesson_denorm_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, pg_temp
AS $$
BEGIN
  SELECT cvt.course_version_id, cv.institution_id
  INTO NEW.course_version_id, NEW.institution_id
  FROM public.course_version_topics cvt
  INNER JOIN public.course_versions cv ON cv.id = cvt.course_version_id
  WHERE cvt.id = NEW.course_version_topic_id;

  IF NEW.institution_id IS NULL THEN
    RAISE EXCEPTION 'course_version_topic % not found when inserting course_version_lesson', NEW.course_version_topic_id;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION app.set_course_version_lesson_denorm_fields IS
  'Trigger function: auto-populates institution_id and course_version_id on course_version_lessons from parent topic/version chain.';

DROP TRIGGER IF EXISTS trg_course_version_lessons_set_denorm_fields ON public.course_version_lessons;

CREATE TRIGGER trg_course_version_lessons_set_denorm_fields
  BEFORE INSERT ON public.course_version_lessons
  FOR EACH ROW
  WHEN (NEW.institution_id IS NULL OR NEW.course_version_id IS NULL)
  EXECUTE FUNCTION app.set_course_version_lesson_denorm_fields();

-- -----------------------------------------------------------------------------
-- 7. RLS — update policies to use direct columns instead of JOIN chains
-- -----------------------------------------------------------------------------

-- course_version_topics: institution_admin policy simplified to direct column check
DROP POLICY IF EXISTS course_version_topics_all_institution_admin ON public.course_version_topics;
CREATE POLICY course_version_topics_all_institution_admin ON public.course_version_topics
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

-- course_version_topics: student policy — use course_version_id directly (no topics JOIN)
DROP POLICY IF EXISTS course_version_topics_select_student_delivery ON public.course_version_topics;
CREATE POLICY course_version_topics_select_student_delivery ON public.course_version_topics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      WHERE cv.id = course_version_topics.course_version_id
        AND (SELECT app.student_can_access_course(cv.course_id)) IS TRUE
    )
  );

-- course_version_lessons: institution_admin policy simplified to direct column check
DROP POLICY IF EXISTS course_version_lessons_all_institution_admin ON public.course_version_lessons;
CREATE POLICY course_version_lessons_all_institution_admin ON public.course_version_lessons
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

-- course_version_lessons: teacher policy uses course_version_id directly (no topics JOIN)
DROP POLICY IF EXISTS course_version_lessons_all_course_teacher ON public.course_version_lessons;
CREATE POLICY course_version_lessons_all_course_teacher ON public.course_version_lessons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      INNER JOIN public.courses c ON cv.course_id = c.id
      WHERE cv.id = course_version_lessons.course_version_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      INNER JOIN public.courses c ON cv.course_id = c.id
      WHERE cv.id = course_version_lessons.course_version_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

-- course_version_lessons: student policy uses course_version_id directly (no topics JOIN)
DROP POLICY IF EXISTS course_version_lessons_select_student_delivery ON public.course_version_lessons;
CREATE POLICY course_version_lessons_select_student_delivery ON public.course_version_lessons
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      WHERE cv.id = course_version_lessons.course_version_id
        AND (SELECT app.student_can_access_course(cv.course_id)) IS TRUE
    )
  );

-- course_version_lessons: classroom_teacher policy uses course_version_id directly (no topics JOIN)
DROP POLICY IF EXISTS course_version_lessons_select_classroom_teacher ON public.course_version_lessons;
CREATE POLICY course_version_lessons_select_classroom_teacher ON public.course_version_lessons
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      INNER JOIN public.course_deliveries cd ON cv.id = cd.course_version_id
      INNER JOIN public.classrooms cr ON cd.classroom_id = cr.id
      WHERE cv.id = course_version_lessons.course_version_id
        AND (
          cr.primary_teacher_id = (SELECT app.auth_uid())
          OR EXISTS (
            SELECT 1 FROM public.classroom_members cm
            WHERE cm.classroom_id = cd.classroom_id
              AND cm.user_id = (SELECT app.auth_uid())
              AND cm.withdrawn_at IS NULL
              AND cm.membership_role = 'co_teacher'::public.classroom_member_role
          )
        )
    )
  );
