-- =============================================================================
-- BACKFILL — repair profiles.role downgraded below the user's highest membership
--
-- The previous redeem_institution_invite forced profiles.role to the invited
-- role even when the user kept a higher-privileged membership, leaving accounts
-- (e.g. an institution_admin who redeemed a student invite for the same email)
-- with profiles.role = 'student' while institution_memberships.membership_role
-- stays 'institution_admin'.
--
-- This one-time, idempotent backfill lifts profiles.role UP to match the user's
-- highest active membership role wherever it is currently lower. It never lowers
-- a role and never touches super_admin. Requires app.role_rank (20260608140000).
-- =============================================================================

WITH highest_membership AS (
  SELECT
    m.user_id,
    MAX(app.role_rank(m.membership_role::text)) AS rank
  FROM public.institution_memberships m
  WHERE m.deleted_at IS NULL
    AND m.status = 'active'::public.membership_status
  GROUP BY m.user_id
)
UPDATE public.profiles p
SET
  role = CASE highest_membership.rank
           WHEN 3 THEN 'institution_admin'
           WHEN 2 THEN 'teacher'
           WHEN 1 THEN 'student'
           ELSE p.role
         END,
  updated_at = now()
FROM highest_membership
WHERE p.user_id = highest_membership.user_id
  AND COALESCE(p.is_super_admin, false) IS NOT TRUE
  AND p.role IS DISTINCT FROM 'super_admin'
  AND app.role_rank(p.role) < highest_membership.rank;
