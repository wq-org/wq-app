-- One-off repair: users with active institution_admin membership but wrong profiles.role
-- (e.g. created before redeem_institution_invite updated profiles).

UPDATE public.profiles p
SET
  role = 'institution_admin',
  updated_at = now()
FROM public.institution_memberships m
WHERE p.user_id = m.user_id
  AND m.deleted_at IS NULL
  AND m.status = 'active'::public.membership_status
  AND m.membership_role = 'institution_admin'::public.membership_role
  AND p.role IS DISTINCT FROM 'institution_admin';
