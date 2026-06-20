-- =============================================================================
-- INSTITUTION INVITE WORKFLOW — RLS (final state)
-- Consolidates the April 1 → May 10 patch series:
--   * anon SELECT on institution_invites limited to pending non-expired rows so
--     a pre-login invite-validate page can confirm the token is still claimable.
--     The UUID token (122 bits of entropy) is the routing mechanism; actual
--     authorization is `profile.email == invite.email`, enforced inside
--     redeem_institution_invite.
--   * This policy intentionally does not reference app.member_institution_ids(),
--     institutions, or institution_memberships — it cannot participate in RLS
--     helper recursion.
-- Requires: 20260510120000_institution_invite_workflow_02_functions.sql
-- =============================================================================

GRANT SELECT ON public.institution_invites TO anon;

DROP POLICY IF EXISTS invites_anon_validate ON public.institution_invites;
DROP POLICY IF EXISTS institution_invites_select_anon ON public.institution_invites;
CREATE POLICY institution_invites_select_anon
ON public.institution_invites
FOR SELECT
TO anon
USING (
  accepted_at IS NULL
  AND expires_at > now()
);
