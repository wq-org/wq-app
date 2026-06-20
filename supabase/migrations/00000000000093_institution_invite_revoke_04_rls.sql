-- =============================================================================
-- INSTITUTION INVITE REVOKE — RLS
-- Tightens the anon SELECT policy on institution_invites so a revoked invite
-- cannot be validated/redeemed via a stale emailed link.
--
-- Requires: 20260000000093_institution_invite_revoke_01_schema.sql
-- Supersedes: 20260000000092_institution_invite_workflow_03_rls.sql
-- =============================================================================

DROP POLICY IF EXISTS institution_invites_select_anon ON public.institution_invites;
CREATE POLICY institution_invites_select_anon
ON public.institution_invites
FOR SELECT
TO anon
USING (
  accepted_at IS NULL
  AND revoked_at IS NULL
  AND expires_at > now()
);
