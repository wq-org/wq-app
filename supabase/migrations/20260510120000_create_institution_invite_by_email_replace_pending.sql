-- =============================================================================
-- Fix duplicate pending invites for the same institution + email.
--
-- Unique index idx_institution_invites_institution_id_email_pending allows only
-- one row per (institution_id, lower(email)) while accepted_at IS NULL.
-- Resending after expiry called create_institution_invite_by_email again → INSERT
-- collided with the still-pending expired row. Replace pending rows by deleting
-- then inserting so callers always get a fresh token.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_institution_invite_by_email(
  p_institution_id uuid,
  p_email text,
  p_role public.membership_role,
  p_expires_in interval DEFAULT '14 days'::interval
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_token uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin())
    OR (SELECT app.is_institution_admin(p_institution_id))
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF p_role NOT IN (
    'teacher'::public.membership_role,
    'student'::public.membership_role,
    'institution_admin'::public.membership_role
  ) THEN
    RAISE EXCEPTION 'p_role must be teacher, student, or institution_admin';
  END IF;

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'p_email is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.institutions i WHERE i.id = p_institution_id AND i.deleted_at IS NULL) THEN
    RAISE EXCEPTION 'institution not found';
  END IF;

  DELETE FROM public.institution_invites
  WHERE institution_id = p_institution_id
    AND lower(trim(email)) = v_email
    AND accepted_at IS NULL;

  INSERT INTO public.institution_invites (
    institution_id,
    email,
    membership_role,
    expires_at,
    invited_by
  )
  VALUES (
    p_institution_id,
    v_email,
    p_role,
    now() + p_expires_in,
    auth.uid()
  )
  RETURNING token INTO v_token;

  RETURN v_token;
END;
$$;

COMMENT ON FUNCTION public.create_institution_invite_by_email(uuid, text, public.membership_role, interval) IS
  'Institution admin or super_admin: pending email invite; returns token. Replaces any existing pending invite for the same institution and email (accepted_at IS NULL). institution_admin role allowed for bootstrap / re-invite flows.';
