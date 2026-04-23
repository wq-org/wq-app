-- Upgrade path for databases that ran 20260418000100 before SET row_security = off was
-- added to public.redeem_institution_invite. Aligns RPC with docs/architecture/db_principles.md:
-- SECURITY DEFINER invite redemption validates auth.uid() + token + email before touching
-- tenant rows; disabling row security only for this function avoids RLS re-entry during
-- scans/updates inside the same RPC (complements app.member_institution_ids helpers).

ALTER FUNCTION public.redeem_institution_invite(uuid) SET row_security = off;
