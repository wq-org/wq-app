-- =============================================================================
-- AUTO-MEMBERSHIP ON INSTITUTION CREATE
-- =============================================================================
-- Problem
--   `create_institution_with_initial_admin` correctly inserts an
--   institution_memberships row, BUT only when called by a super_admin.
--   New users who sign up via trial or are onboarded without going through
--   that RPC end up with:
--     - a profile row (via handle_new_user trigger)
--     - an institution row (if one was created)
--     - NO institution_memberships row
--
--   This breaks every downstream RLS policy that calls
--   app.member_institution_ids() / app.admin_institution_ids(), including
--   the cloud_files INSERT policy that caused the upload failure.
--
-- Solution
--   A SECURITY DEFINER trigger function on `public.institutions` that
--   auto-inserts an institution_admin membership for the creating user
--   when a new institution row is inserted AND no membership already exists.
--   This covers the gap for any code path that inserts directly into
--   `public.institutions` without going through the full RPC.
--
-- Audit
--   The canonical audit wrapper for institution_memberships
--   (audit.log_institution_memberships_audit + trigger
--   trg_institution_memberships_audit_row from
--   20260427162000_institution_remaining_audit_triggers.sql) already routes
--   every INSERT/UPDATE/DELETE on public.institution_memberships through
--   audit.log_event() with the DSGVO-allowlist payload defined in
--   docs/architecture/dsgvo-audit-datendefinition.md. The row inserted by
--   the trigger below is therefore audited automatically as
--   "membership.created" — no separate audit hook in this file.
--
-- Safety
--   - SECURITY DEFINER + fixed search_path = '' (search-path injection guard).
--   - NOT EXISTS guard prevents duplicates; safe to re-run.
--   - Skips when auth.uid() is NULL (service-role / seed contexts).
--
-- Requires
--   - public.institution_memberships (institution_admin migrations)
--   - public.user_institutions (legacy compat table)
--   - public.institutions
--   - public.membership_role, public.membership_status types
--   - audit.log_event + audit.log_institution_memberships_audit (already shipped
--     by earlier migrations; this file does not redeclare them)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Defensive cleanup: a previous revision of this migration shipped a
-- duplicate audit trigger in the `public` schema that called audit.log_event
-- with non-existent parameter names (p_actor_id / p_entity_type / p_entity_id)
-- and would also double-log against the canonical
-- trg_institution_memberships_audit_row. Drop it cleanly if present so reruns
-- and partial states converge to the single canonical audit path.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_institution_memberships_audit
  ON public.institution_memberships;
DROP FUNCTION IF EXISTS public.trg_fn_institution_memberships_audit();


-- =============================================================================
-- PART 1: Auto-create institution_admin membership when a new institution row
--         is inserted (covers all code paths, not just the RPC).
--
--         Audit for the inserted row is emitted automatically by the
--         canonical trg_institution_memberships_audit_row trigger that
--         already exists on public.institution_memberships.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.trg_fn_institutions_auto_admin_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid;
BEGIN
  -- Resolve actor: use auth.uid() at call time (JWT-based, no spoofing).
  v_actor_id := (SELECT auth.uid());

  -- If called from a service-role context (e.g. migrations/seed), auth.uid()
  -- returns NULL. Skip auto-membership in that case; seeds/migrations must
  -- insert memberships explicitly.
  IF v_actor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only insert if the actor has a profile (handles the edge case where
  -- auth.users exists but handle_new_user hasn't fired yet).
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = v_actor_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Insert institution_admin membership.
  -- Use a NOT EXISTS guard rather than ON CONFLICT: the uniqueness on
  -- (user_id, institution_id) for active rows is enforced by a PARTIAL
  -- unique index (WHERE deleted_at IS NULL), not a named UNIQUE/PRIMARY
  -- KEY constraint, so we avoid relying on ON CONFLICT inference here.
  -- create_institution_with_initial_admin may have already inserted this
  -- row; the guard makes the trigger a safe no-op in that case.
  IF NOT EXISTS (
    SELECT 1
    FROM public.institution_memberships m
    WHERE m.user_id        = v_actor_id
      AND m.institution_id = NEW.id
      AND m.deleted_at     IS NULL
  ) THEN
    INSERT INTO public.institution_memberships (
      user_id,
      institution_id,
      membership_role,
      status
    )
    VALUES (
      v_actor_id,
      NEW.id,
      'institution_admin'::public.membership_role,
      'active'::public.membership_status
    );
  END IF;

  -- Mirror to legacy user_institutions for backward compat.
  INSERT INTO public.user_institutions (user_id, institution_id)
  VALUES (v_actor_id, NEW.id)
  ON CONFLICT (user_id, institution_id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trg_fn_institutions_auto_admin_membership() IS
  'After a new institution row is created, auto-inserts an institution_admin '
  'membership for the authenticated actor (auth.uid()). Skips when called from '
  'service-role context (auth.uid() IS NULL) or when a membership already exists. '
  'SECURITY DEFINER with fixed search_path to prevent search-path injection.';

DROP TRIGGER IF EXISTS trg_institutions_auto_admin_membership ON public.institutions;
CREATE TRIGGER trg_institutions_auto_admin_membership
  AFTER INSERT ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_institutions_auto_admin_membership();


-- =============================================================================
-- PART 2: Back-fill existing users who have an institution but NO active
--         membership row (the exact state that causes RLS failures today).
--
--         This runs once at migration time and is safe to re-run (NOT EXISTS).
--
--         Strategy:
--           1. Use user_institutions (legacy) as the authoritative source of
--              existing user↔institution links.
--           2. Join to profiles to get the role → membership_role mapping.
--           3. Insert only where no non-deleted membership row exists.
--
--         Audit: each inserted row triggers the canonical
--         trg_institution_memberships_audit_row which emits a
--         "membership.created" event via audit.log_event with the
--         allowlist-conformant payload — no extra audit code needed here.
-- =============================================================================

INSERT INTO public.institution_memberships (
  user_id,
  institution_id,
  membership_role,
  status,
  created_at
)
SELECT
  ui.user_id,
  ui.institution_id,
  CASE
    WHEN p.role = 'institution_admin' THEN 'institution_admin'::public.membership_role
    WHEN p.role = 'teacher'           THEN 'teacher'::public.membership_role
    ELSE                                   'student'::public.membership_role
  END,
  'active'::public.membership_status,
  COALESCE(ui.joined_at, now())
FROM public.user_institutions ui
INNER JOIN public.profiles p ON p.user_id = ui.user_id
WHERE NOT EXISTS (
  SELECT 1
  FROM public.institution_memberships m
  WHERE m.user_id        = ui.user_id
    AND m.institution_id = ui.institution_id
    AND m.deleted_at     IS NULL
)
-- NOT EXISTS guard above already prevents duplicates; no ON CONFLICT needed.
;


-- =============================================================================
-- PART 3: Back-fill the de-facto admin of any institution that has a
--         creator on file but no membership row for that creator yet
--         (orphaned-admin recovery).
--
--         Scope: institutions.created_by_admin_id is the foreign key to the
--         profile that originally created the institution. We assign that
--         profile an institution_admin membership iff:
--           - the institution still exists (not soft-deleted),
--           - the creator profile still exists with role in
--             ('institution_admin', 'teacher'),
--           - no active membership row exists for that (creator, institution)
--             pair yet.
--
--         This is a strict INNER JOIN on the creator — not a CROSS JOIN —
--         so we never assign admin to anyone other than the actual creator.
--
--         Audit: each inserted row triggers the canonical
--         trg_institution_memberships_audit_row which emits a
--         "membership.created" event via audit.log_event.
-- =============================================================================

INSERT INTO public.institution_memberships (
  user_id,
  institution_id,
  membership_role,
  status,
  created_at
)
SELECT
  i.created_by_admin_id,
  i.id,
  'institution_admin'::public.membership_role,
  'active'::public.membership_status,
  now()
FROM public.institutions i
INNER JOIN public.profiles p ON p.user_id = i.created_by_admin_id
WHERE i.deleted_at IS NULL
  AND i.created_by_admin_id IS NOT NULL
  AND p.role IN ('institution_admin', 'teacher')
  -- Creator has no active membership for this institution yet.
  AND NOT EXISTS (
    SELECT 1
    FROM public.institution_memberships m
    WHERE m.user_id        = i.created_by_admin_id
      AND m.institution_id = i.id
      AND m.deleted_at     IS NULL
  )
-- NOT EXISTS guard above already prevents duplicates; no ON CONFLICT needed.
;

-- Mirror all newly inserted memberships to legacy user_institutions as well.
INSERT INTO public.user_institutions (user_id, institution_id)
SELECT m.user_id, m.institution_id
FROM public.institution_memberships m
WHERE m.status     = 'active'::public.membership_status
  AND m.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_institutions ui
    WHERE ui.user_id        = m.user_id
      AND ui.institution_id = m.institution_id
  )
ON CONFLICT (user_id, institution_id) DO NOTHING;
