-- =============================================================================
-- INSTITUTION INVITE REVOKE — RLS
-- Tightens the anon SELECT policy on institution_invites so a revoked invite
-- cannot be validated/redeemed via a stale emailed link.
--
-- Requires: 2026051113000001_institution_invite_revoke_01_schema.sql
-- Supersedes: 2026051012000003_institution_invite_workflow_03_rls.sql
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
