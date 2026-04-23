-- Allow anon to validate a single invite token (pre-login page load).
-- Row-level guard: only non-expired, non-accepted rows are visible.
-- The UUID token (122 bits of entropy) is the authorization — possession of it
-- is equivalent to having received the email invite.
--
-- This policy does not reference app.member_institution_ids(), institutions, or
-- institution_memberships — it cannot participate in RLS helper recursion.

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
