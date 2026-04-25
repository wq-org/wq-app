-- =============================================================================
-- Fix classroom_members RLS self-recursion in classroom_members_select_teacher_roster.
--
-- Problem: The policy's USING clause contained an EXISTS subquery on
-- public.classroom_members, which triggers RLS re-evaluation on the same table
-- and causes infinite recursion (PostgreSQL error 42P17).
--
-- Solution: Move the co-teacher membership check into a SECURITY DEFINER helper
-- function. The function owner can read the table without triggering RLS again,
-- breaking the cycle. Scoped tightly to auth.uid() and the classroom_id param.
--
-- Pattern: SECURITY DEFINER + SET search_path = '' + fully qualified objects.
-- See docs/architecture/db_principles.md.
-- =============================================================================

CREATE OR REPLACE FUNCTION app.auth_is_co_teacher_of_classroom(p_classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classroom_members cm
    WHERE cm.classroom_id = p_classroom_id
      AND cm.user_id = auth.uid()
      AND cm.withdrawn_at IS NULL
      AND cm.membership_role = 'co_teacher'::public.classroom_member_role
  );
$$;

COMMENT ON FUNCTION app.auth_is_co_teacher_of_classroom(uuid) IS
  'True when caller is an active co_teacher in the classroom. SECURITY DEFINER breaks classroom_members RLS self-recursion; scoped by auth.uid().';

GRANT EXECUTE ON FUNCTION app.auth_is_co_teacher_of_classroom(uuid) TO authenticated;

-- Replace select policy body via helper (avoids inline EXISTS on classroom_members).
DROP POLICY IF EXISTS classroom_members_select_teacher_roster ON public.classroom_members;
CREATE POLICY classroom_members_select_teacher_roster ON public.classroom_members
  FOR SELECT TO authenticated
  USING (
    app.auth_is_primary_teacher_of_classroom(classroom_id)
    OR app.auth_is_co_teacher_of_classroom(classroom_id)
  );
