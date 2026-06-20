-- =============================================================================
-- INSTITUTION EMAIL CHANGE — one-time confirmation flow for institution admins
-- Requires: 00000000000080_institution_membership_helpers_security_definer
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pending_email_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  current_email text NOT NULL,
  target_email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pending_email_changes IS
  'One-time email change requests for institution admins. The raw token is never stored; only its SHA-256 hash is persisted.';
COMMENT ON COLUMN public.pending_email_changes.token_hash IS
  'SHA-256 hash of the raw confirmation token.';
COMMENT ON COLUMN public.pending_email_changes.expires_at IS
  'Token expiry enforced by the request and redeem flows.';
COMMENT ON COLUMN public.pending_email_changes.redeemed_at IS
  'Set when the request is consumed or superseded. NULL means still pending.';

CREATE INDEX IF NOT EXISTS idx_pending_email_changes_institution
  ON public.pending_email_changes (institution_id);

CREATE INDEX IF NOT EXISTS idx_pending_email_changes_token_hash
  ON public.pending_email_changes (token_hash);

ALTER TABLE public.pending_email_changes
  ADD CONSTRAINT chk_pending_email_changes_expires_after_created
  CHECK (expires_at > created_at);

ALTER TABLE public.pending_email_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_email_changes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pending_email_changes_select_admin ON public.pending_email_changes;
CREATE POLICY pending_email_changes_select_admin
  ON public.pending_email_changes
  FOR SELECT
  TO authenticated
  USING (app.is_institution_admin(institution_id));

GRANT SELECT ON public.pending_email_changes TO authenticated;
