-- HETZNER_TEARDOWN: KEEP_CORE | WQ-MINIMAL-CORE | allow classroom teachers to send classroom invite emails
-- =============================================================================
-- send-institution-user-invite-email runs with the caller JWT. Teachers who
-- create classroom-scoped student invites must be able to read the pending
-- invite row they just created so the function can validate token/email before
-- sending.
-- =============================================================================

DROP POLICY IF EXISTS institution_invites_select_classroom_teacher
ON public.institution_invites;

CREATE POLICY institution_invites_select_classroom_teacher
ON public.institution_invites
FOR SELECT
TO authenticated
USING (
  membership_role = 'student'::public.membership_role
  AND classroom_id IS NOT NULL
  AND accepted_at IS NULL
  AND revoked_at IS NULL
  AND expires_at > now()
  AND (
    EXISTS (
      SELECT 1
      FROM public.classrooms c
      WHERE c.id = institution_invites.classroom_id
        AND c.institution_id = institution_invites.institution_id
        AND c.primary_teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.classroom_members cm
      WHERE cm.classroom_id = institution_invites.classroom_id
        AND cm.user_id = auth.uid()
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
        AND cm.withdrawn_at IS NULL
    )
  )
);
