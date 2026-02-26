-- =============================================================================
-- Courses visibility and enrollment join guard
-- - Published courses are readable without follow (authenticated role-based)
-- - Joining a course requires: student role + published course + follows teacher
-- =============================================================================

-- =============================================================================
-- RLS — COURSES
-- =============================================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view published courses from followed teachers" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can view published courses" ON public.courses;
CREATE POLICY "Authenticated users can view published courses" ON public.courses FOR SELECT TO authenticated USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR (
    is_published = true
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role IN ('student', 'teacher', 'institution_admin')
    )
  )
);

-- =============================================================================
-- RLS — COURSE_ENROLLMENTS
-- =============================================================================
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can join followed teacher published courses" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can leave own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Teachers can see enrollments for their courses" ON public.course_enrollments;

CREATE POLICY "Students can view own enrollments" ON public.course_enrollments FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR auth.uid() = student_id
);

CREATE POLICY "Students can join followed teacher published courses" ON public.course_enrollments FOR INSERT WITH CHECK (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'student'
    )
    AND EXISTS (
      SELECT 1
      FROM public.courses c
      JOIN public.teacher_followers tf ON tf.teacher_id = c.teacher_id
      WHERE c.id = course_enrollments.course_id
        AND c.is_published = true
        AND tf.student_id = auth.uid()
    )
  )
);

CREATE POLICY "Students can leave own enrollments" ON public.course_enrollments FOR DELETE USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR auth.uid() = student_id
);

CREATE POLICY "Teachers can see enrollments for their courses" ON public.course_enrollments FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
);
