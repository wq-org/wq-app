-- =============================================================================
-- INSTITUTION INVITE WORKFLOW — schema (final state)
-- Consolidates the April 1 → May 10 patch series:
--   * institution_admin role allowed in chk_institution_invites_membership_role
--     (was teacher|student only)
-- Functions and RLS live in sibling _02 / _03 files.
-- =============================================================================

ALTER TABLE public.institution_invites
  DROP CONSTRAINT IF EXISTS chk_institution_invites_membership_role;

ALTER TABLE public.institution_invites
  ADD CONSTRAINT chk_institution_invites_membership_role CHECK (
    membership_role IN (
      'teacher'::public.membership_role,
      'student'::public.membership_role,
      'institution_admin'::public.membership_role
    )
  );

COMMENT ON CONSTRAINT chk_institution_invites_membership_role ON public.institution_invites IS
  'Email invites may target teacher, student, or institution_admin (bootstrap wizard and re-invite flows).';
