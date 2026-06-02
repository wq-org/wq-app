-- Align classrooms.primary_teacher_id with classroom_members (schema: primary must have
-- an active membership row for list_active_classroom_ids and UI consistency).

-- 1) Prefer reactivating an existing withdrawn row (one per classroom/user pair).
WITH candidates AS (
  SELECT DISTINCT ON (cm.classroom_id, cm.user_id) cm.id
  FROM public.classroom_members cm
  INNER JOIN public.classrooms c
    ON c.id = cm.classroom_id
   AND c.primary_teacher_id = cm.user_id
  WHERE cm.withdrawn_at IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.classroom_members x
      WHERE x.classroom_id = cm.classroom_id
        AND x.user_id = cm.user_id
        AND x.withdrawn_at IS NULL
    )
  ORDER BY cm.classroom_id, cm.user_id, cm.enrolled_at DESC NULLS LAST
)
UPDATE public.classroom_members cm
SET
  withdrawn_at = NULL,
  leave_reason = NULL,
  membership_role = 'co_teacher'::public.classroom_member_role,
  updated_at = now()
FROM candidates t
WHERE cm.id = t.id;

-- 2) Insert when there is no row at all for this primary teacher on this classroom.
INSERT INTO public.classroom_members (institution_id, classroom_id, user_id, membership_role)
SELECT c.institution_id, c.id, c.primary_teacher_id, 'co_teacher'::public.classroom_member_role
FROM public.classrooms c
WHERE c.primary_teacher_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.classroom_members cm
    WHERE cm.classroom_id = c.id
      AND cm.user_id = c.primary_teacher_id
  );
