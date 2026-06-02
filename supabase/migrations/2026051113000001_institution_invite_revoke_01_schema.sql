-- =============================================================================
-- INSTITUTION INVITE REVOKE — schema
-- Adds soft-delete revoke columns to institution_invites and rebuilds the
-- pending uniqueness index so revoked rows free up the (institution_id, email)
-- slot for a new invite.
--
-- Why: previously the partial unique index
--   idx_institution_invites_institution_id_email_pending
--   ON (institution_id, LOWER(email)) WHERE accepted_at IS NULL
-- blocked re-inviting the same email whenever a stale pending row existed
-- (wrong email, expired, sent in error). Adding `revoked_at IS NULL` to the
-- predicate lets revoked rows persist for audit without blocking new invites.
-- =============================================================================

ALTER TABLE public.institution_invites
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

ALTER TABLE public.institution_invites
  ADD COLUMN IF NOT EXISTS revoked_by uuid
    REFERENCES public.profiles(user_id) ON DELETE SET NULL;

COMMENT ON COLUMN public.institution_invites.revoked_at IS
  'When the invite was revoked (super_admin / institution_admin action, or expired-cleanup bulk action). NULL = active. Set, the invite cannot be redeemed and the (institution_id, email) slot frees up.';
COMMENT ON COLUMN public.institution_invites.revoked_by IS
  'auth.uid() of the actor who revoked this invite.';

DROP INDEX IF EXISTS public.idx_institution_invites_institution_id_email_pending;

CREATE UNIQUE INDEX idx_institution_invites_institution_id_email_pending
  ON public.institution_invites (institution_id, LOWER(email))
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_institution_invites_pending_expired
  ON public.institution_invites (expires_at)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;
