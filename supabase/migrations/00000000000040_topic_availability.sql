-- =============================================================================
-- TOPIC AVAILABILITY — topic lock/unlock gating for course delivery
-- Extracted from the retired attendance_topic_gates suite. Attendance (sessions,
-- records, schedules) was removed for the Hetzner minimal core; the topic-gating
-- half is a live, load-bearing feature (course delivery joins these rules and
-- topics_select_member enforces them). See docs/perplexity/WQ_TEARDOWN_minimal_core.md.
--
-- Sections: tables -> indexes -> functions (shared permission helpers, teacher
-- lock/unlock RPCs, student access helpers, normalize trigger fn) -> triggers -> RLS.
-- Requires: institutions, courses, topics, classrooms, classroom_members,
--           classroom_course_links, public.update_updated_at, app.auth_uid,
--           app.is_super_admin, app.admin_institution_ids, app.member_institution_ids,
--           app.student_can_access_course.
-- =============================================================================

-- =============================================================================
-- 1. Tables
-- =============================================================================
CREATE TABLE public.topic_availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.topics (id) ON DELETE CASCADE,
  is_locked boolean NOT NULL DEFAULT FALSE,
  unlock_at timestamptz,
  unlocked_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  unlocked_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_topic_availability_rules_course_topic UNIQUE (course_id, topic_id)
);

COMMENT ON TABLE public.topic_availability_rules IS
  'Course-topic lock rules that prevent fast-forward access before unlock conditions.';
COMMENT ON COLUMN public.topic_availability_rules.course_id IS
  'Course containing the topic.';
COMMENT ON COLUMN public.topic_availability_rules.topic_id IS
  'Topic governed by this availability rule.';
COMMENT ON COLUMN public.topic_availability_rules.is_locked IS
  'True blocks student access unless unlocked by time or teacher action.';
COMMENT ON COLUMN public.topic_availability_rules.unlock_at IS
  'Scheduled unlock timestamp; when reached, topic can become available.';
COMMENT ON COLUMN public.topic_availability_rules.unlocked_by IS
  'Teacher/admin user that explicitly unlocked the topic.';
COMMENT ON COLUMN public.topic_availability_rules.unlocked_at IS
  'Timestamp when topic was manually or automatically unlocked.';

-- =============================================================================
-- 2. Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_institution_id
  ON public.topic_availability_rules (institution_id);

CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_course_id
  ON public.topic_availability_rules (course_id);

CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_topic_id
  ON public.topic_availability_rules (topic_id);

CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_unlock_at
  ON public.topic_availability_rules (unlock_at)
  WHERE unlock_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_locked
  ON public.topic_availability_rules (course_id, is_locked, unlock_at);

-- =============================================================================
-- 3. Functions / RPCs
-- =============================================================================

-- Shared permission helpers (also consumed by cloud_assets + grant_usage).
CREATE OR REPLACE FUNCTION app.caller_can_manage_classroom(p_classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classrooms classroom_row
    WHERE classroom_row.id = p_classroom_id
      AND classroom_row.primary_teacher_id = (SELECT app.auth_uid())
  )
  OR EXISTS (
    SELECT 1
    FROM public.classroom_members classroom_member_row
    WHERE classroom_member_row.classroom_id = p_classroom_id
      AND classroom_member_row.user_id = (SELECT app.auth_uid())
      AND classroom_member_row.withdrawn_at IS NULL
      AND classroom_member_row.membership_role = 'co_teacher'::public.classroom_member_role
  )
  OR (SELECT app.is_super_admin()) IS TRUE;
$$;

COMMENT ON FUNCTION app.caller_can_manage_classroom(uuid) IS
  'True if caller is primary teacher, co-teacher, or super admin for the classroom.';

CREATE OR REPLACE FUNCTION app.caller_can_manage_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses course_row
    WHERE course_row.id = p_course_id
      AND course_row.teacher_id = (SELECT app.auth_uid())
  )
  OR (SELECT app.is_super_admin()) IS TRUE;
$$;

COMMENT ON FUNCTION app.caller_can_manage_course(uuid) IS
  'True if caller is the course teacher or super admin.';

-- Teacher topic lock/unlock RPCs
CREATE OR REPLACE FUNCTION public.teacher_lock_topic_for_course(
  p_course_id uuid,
  p_topic_id uuid
)
RETURNS public.topic_availability_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  course_row public.courses%ROWTYPE;
  topic_rule_row public.topic_availability_rules%ROWTYPE;
BEGIN
  IF NOT app.caller_can_manage_course(p_course_id) THEN
    RAISE EXCEPTION 'caller cannot lock topics for this course';
  END IF;

  SELECT *
  INTO course_row
  FROM public.courses
  WHERE id = p_course_id;

  IF course_row.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  INSERT INTO public.topic_availability_rules (
    institution_id,
    course_id,
    topic_id,
    is_locked,
    unlock_at,
    unlocked_by,
    unlocked_at,
    created_by
  )
  VALUES (
    course_row.institution_id,
    p_course_id,
    p_topic_id,
    true,
    NULL,
    NULL,
    NULL,
    (SELECT app.auth_uid())
  )
  ON CONFLICT (course_id, topic_id)
  DO UPDATE
  SET
    is_locked = true,
    unlock_at = NULL,
    unlocked_by = NULL,
    unlocked_at = NULL,
    updated_at = now()
  RETURNING *
  INTO topic_rule_row;

  RETURN topic_rule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.teacher_lock_topic_for_course(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.teacher_lock_topic_for_course(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.teacher_unlock_topic_for_course(
  p_course_id uuid,
  p_topic_id uuid
)
RETURNS public.topic_availability_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  topic_rule_row public.topic_availability_rules%ROWTYPE;
BEGIN
  IF NOT app.caller_can_manage_course(p_course_id) THEN
    RAISE EXCEPTION 'caller cannot unlock topics for this course';
  END IF;

  INSERT INTO public.topic_availability_rules (
    institution_id,
    course_id,
    topic_id,
    is_locked,
    unlock_at,
    unlocked_by,
    unlocked_at,
    created_by
  )
  SELECT
    course_row.institution_id,
    p_course_id,
    p_topic_id,
    false,
    NULL,
    (SELECT app.auth_uid()),
    now(),
    (SELECT app.auth_uid())
  FROM public.courses course_row
  WHERE course_row.id = p_course_id
  ON CONFLICT (course_id, topic_id)
  DO UPDATE
  SET
    is_locked = false,
    unlock_at = NULL,
    unlocked_by = (SELECT app.auth_uid()),
    unlocked_at = now(),
    updated_at = now()
  RETURNING *
  INTO topic_rule_row;

  RETURN topic_rule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.teacher_unlock_topic_for_course(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.teacher_unlock_topic_for_course(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.teacher_schedule_topic_unlock(
  p_course_id uuid,
  p_topic_id uuid,
  p_unlock_at timestamptz
)
RETURNS public.topic_availability_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  topic_rule_row public.topic_availability_rules%ROWTYPE;
BEGIN
  IF NOT app.caller_can_manage_course(p_course_id) THEN
    RAISE EXCEPTION 'caller cannot schedule topic unlock for this course';
  END IF;

  IF p_unlock_at IS NULL THEN
    RAISE EXCEPTION 'unlock timestamp is required';
  END IF;

  INSERT INTO public.topic_availability_rules (
    institution_id,
    course_id,
    topic_id,
    is_locked,
    unlock_at,
    unlocked_by,
    unlocked_at,
    created_by
  )
  SELECT
    course_row.institution_id,
    p_course_id,
    p_topic_id,
    true,
    p_unlock_at,
    NULL,
    NULL,
    (SELECT app.auth_uid())
  FROM public.courses course_row
  WHERE course_row.id = p_course_id
  ON CONFLICT (course_id, topic_id)
  DO UPDATE
  SET
    is_locked = true,
    unlock_at = p_unlock_at,
    unlocked_by = NULL,
    unlocked_at = NULL,
    updated_at = now()
  RETURNING *
  INTO topic_rule_row;

  RETURN topic_rule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.teacher_schedule_topic_unlock(uuid, uuid, timestamptz) FROM public;
GRANT EXECUTE ON FUNCTION public.teacher_schedule_topic_unlock(uuid, uuid, timestamptz) TO authenticated;

-- Student access helpers (student_can_access_lesson redefines the 03-23 base
-- version to add topic-availability awareness — keep at this point in the chain).
CREATE OR REPLACE FUNCTION app.student_can_access_topic(p_topic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.topics topic_row
    LEFT JOIN public.topic_availability_rules topic_availability_rule_row
      ON topic_availability_rule_row.topic_id = topic_row.id
     AND topic_availability_rule_row.course_id = topic_row.course_id
    WHERE topic_row.id = p_topic_id
      AND app.student_can_access_course(topic_row.course_id)
      AND (
        topic_availability_rule_row.id IS NULL
        OR topic_availability_rule_row.is_locked = false
        OR (
          topic_availability_rule_row.unlock_at IS NOT NULL
          AND topic_availability_rule_row.unlock_at <= now()
        )
      )
  );
$$;

COMMENT ON FUNCTION app.student_can_access_topic(uuid) IS
  'True if caller can access a topic through course access plus topic lock/unlock rules.';

CREATE OR REPLACE FUNCTION app.student_can_access_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lessons lesson_row
    WHERE lesson_row.id = p_lesson_id
      AND app.student_can_access_topic(lesson_row.topic_id)
  );
$$;

COMMENT ON FUNCTION app.student_can_access_lesson(uuid) IS
  'True if caller may access lesson through course delivery and topic availability rules.';

-- Normalize trigger function
CREATE OR REPLACE FUNCTION public.normalize_topic_availability_rule()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  topic_row public.topics%ROWTYPE;
  course_row public.courses%ROWTYPE;
BEGIN
  SELECT *
  INTO topic_row
  FROM public.topics
  WHERE id = NEW.topic_id;

  IF topic_row.id IS NULL THEN
    RAISE EXCEPTION 'topic not found';
  END IF;

  IF topic_row.course_id IS DISTINCT FROM NEW.course_id THEN
    RAISE EXCEPTION 'topic_availability_rules.course_id must match topics.course_id';
  END IF;

  SELECT *
  INTO course_row
  FROM public.courses
  WHERE id = NEW.course_id;

  IF course_row.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  IF NEW.institution_id IS DISTINCT FROM course_row.institution_id THEN
    RAISE EXCEPTION 'topic availability institution must match course institution';
  END IF;

  IF NEW.is_locked = false THEN
    IF NEW.unlocked_at IS NULL THEN
      NEW.unlocked_at := now();
    END IF;
    IF NEW.unlocked_by IS NULL THEN
      NEW.unlocked_by := (SELECT app.auth_uid());
    END IF;
    NEW.unlock_at := NULL;
  END IF;

  IF NEW.unlock_at IS NOT NULL AND NEW.unlock_at <= now() THEN
    NEW.is_locked := false;
    NEW.unlocked_at := COALESCE(NEW.unlocked_at, now());
    NEW.unlocked_by := COALESCE(NEW.unlocked_by, (SELECT app.auth_uid()));
    NEW.unlock_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.normalize_topic_availability_rule() FROM public;

-- =============================================================================
-- 4. Triggers
-- =============================================================================
DROP TRIGGER IF EXISTS topic_availability_rules_set_updated_at ON public.topic_availability_rules;
DROP TRIGGER IF EXISTS trg_topic_availability_rules_set_updated_at ON public.topic_availability_rules;
CREATE TRIGGER trg_topic_availability_rules_set_updated_at
  BEFORE UPDATE ON public.topic_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS topic_availability_rules_normalize ON public.topic_availability_rules;
DROP TRIGGER IF EXISTS trg_topic_availability_rules_normalize ON public.topic_availability_rules;
CREATE TRIGGER trg_topic_availability_rules_normalize
  BEFORE INSERT OR UPDATE ON public.topic_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.normalize_topic_availability_rule();

-- =============================================================================
-- 5. RLS
-- =============================================================================
ALTER TABLE public.topic_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_availability_rules FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS topic_availability_rules_all_super_admin ON public.topic_availability_rules;
CREATE POLICY topic_availability_rules_all_super_admin ON public.topic_availability_rules
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS topic_availability_rules_all_institution_admin ON public.topic_availability_rules;
CREATE POLICY topic_availability_rules_all_institution_admin ON public.topic_availability_rules
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS topic_availability_rules_all_teacher ON public.topic_availability_rules;
CREATE POLICY topic_availability_rules_all_teacher ON public.topic_availability_rules
  FOR ALL TO authenticated
  USING (app.caller_can_manage_course(course_id))
  WITH CHECK (app.caller_can_manage_course(course_id));

DROP POLICY IF EXISTS topic_availability_rules_select_member ON public.topic_availability_rules;
CREATE POLICY topic_availability_rules_select_member ON public.topic_availability_rules
  FOR SELECT TO authenticated
  USING (
    app.caller_can_manage_course(course_id)
    OR (
      institution_id IN (SELECT app.member_institution_ids())
      AND (SELECT app.student_can_access_course(course_id))
    )
  );

-- topics — enforce topic lock rules in student visibility
DROP POLICY IF EXISTS topics_select_member ON public.topics;
CREATE POLICY topics_select_member ON public.topics
  FOR SELECT TO authenticated
  USING (
    (SELECT app.is_super_admin()) IS TRUE
    OR app.caller_can_manage_course(course_id)
    OR (SELECT app.student_can_access_topic(id))
  );
