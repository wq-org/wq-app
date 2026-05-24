# Task — Fix Super Admin Leakage into Institution Directory

**Status:** ✅ Implemented — migration `20260522141000_fix_super_admin_institution_membership_leak.sql` + directory filter  
**Priority:** Immediate  
**Area:** Supabase / PostgreSQL / Institution Admin UI  
**Goal:** Ensure platform-level super admins never become tenant members and never appear in institution user directories.

---

## Problem Statement

A user with `profiles.role = 'super_admin'` is appearing in the Institution Admin user directory as `institution_admin`.

This is a serious boundary violation:

- Super admin is a **platform role**, not a tenant role.
- Institution directories must only show users who are actual members of that institution.
- Institution admins must never see platform-only operators as tenant members.

The current behavior means a super admin was attached to an institution through `institution_memberships`, and the directory UI is rendering that membership instead of respecting the platform/tenant separation.

---

## Likely Root Cause

The most likely source is the migration:

- `supabase/migrations/20260522090000_auto_membership_on_institution_create.sql`

That migration appears to auto-create an `institution_memberships` row for the authenticated actor when a new institution is created.

If the actor is a super admin, the migration incorrectly inserts:

- `membership_role = 'institution_admin'`
- `status = 'active'`

This makes the super admin look like a real tenant admin in the institution directory, even though `profiles.role` still correctly says `super_admin`.

---

## Why the UI Shows the Wrong Role

The institution directory is reading from:

- `public.institution_memberships`

not from:

- `public.profiles.role`

So the UI is not inventing the wrong role. It is faithfully showing a **bad membership row**.

That means the real bug is in data creation and tenant-boundary enforcement, not just presentation.

---

## Required Fix

Implement all three layers below.

### 1. Database fix — stop creating tenant memberships for super admins

Patch the institution auto-membership trigger/function so that it exits early when the actor is platform staff.

Required rule:

- If `profiles.role = 'super_admin'` OR `profiles.is_super_admin IS TRUE`, do **not** create:
  - `institution_memberships` row
  - `user_institutions` row

Expected guard pattern inside the trigger function:

```sql
IF EXISTS (
  SELECT 1
  FROM public.profiles p
  WHERE p.user_id = v_actor_id
    AND (p.role = 'super_admin' OR p.is_super_admin IS TRUE)
) THEN
  RETURN NEW;
END IF;
```

Also verify the same protection applies to both flows:

- direct `INSERT INTO public.institutions`
- super-admin wizard / invite workflow

### 2. Cleanup migration — remove already-created bad rows

Create a follow-up migration that cleans existing leaked memberships for platform admins.

Targets:

- `public.institution_memberships`
- `public.user_institutions`

Cleanup rule:

- For every user where `profiles.role = 'super_admin'` OR `profiles.is_super_admin IS TRUE`:
  - remove or soft-delete all institution membership rows
  - remove all legacy `user_institutions` links

Follow existing table conventions:

- If `institution_memberships` uses soft-delete semantics, prefer setting `deleted_at`
- If `user_institutions` is legacy and not soft-deleted, hard delete is acceptable

### 3. UI/API defense — never render platform admins in tenant directory

Patch the institution directory loader so platform admins are filtered out even if bad data exists again.

Required outcome:

- Institution Admin views must never include users where:
  - `profiles.role = 'super_admin'`, or
  - `profiles.is_super_admin IS TRUE`

Preferred implementation:

- Move this into a secure RPC or server-side data layer if possible
- If kept in client query composition, extend the selected profile fields and filter before mapping rows

This is defense-in-depth, not the primary fix.

---

## Architectural Rule

This must become a hard product rule:

- **Super admin is global, never tenant-scoped**
- A super admin may create, inspect, support, or manage institutions from platform tooling
- A super admin must never appear in:
  - `institution_memberships`
  - `user_institutions`
  - institution user directories
  - tenant-facing participant/admin lists

This rule must hold after:

- fresh `db reset`
- seed runs
- institution creation wizard
- direct SQL insert paths
- future migrations

---

## Implementation Tasks

### A. Inspect and patch DB migration chain

Review and patch the logic introduced by:

- `20260522090000_auto_membership_on_institution_create.sql`

Check whether the auto-membership logic lives in:

- trigger function only
- backfill section
- both

If modifying an already-committed migration is not acceptable for your deployment strategy, create a new corrective migration that replaces the trigger function with the guarded version.

### B. Verify invite workflow behavior

Review institution creation flows to ensure the super admin can:

- create an institution
- invite the real institution admin
- avoid becoming a tenant member

The platform actor may remain in `institutions.created_by_admin_id` if that field represents platform provenance, but must not become an institution member unless explicitly intended by product rules.

### C. Add cleanup SQL

Produce cleanup statements for existing environments.

At minimum, include:

```sql
-- Inspect stray tenant memberships for platform admins
SELECT m.*, p.email, p.role, p.is_super_admin
FROM public.institution_memberships m
JOIN public.profiles p ON p.user_id = m.user_id
WHERE m.deleted_at IS NULL
  AND (p.role = 'super_admin' OR p.is_super_admin IS TRUE);

-- Inspect legacy institution links
SELECT ui.*, p.email, p.role, p.is_super_admin
FROM public.user_institutions ui
JOIN public.profiles p ON p.user_id = ui.user_id
WHERE p.role = 'super_admin' OR p.is_super_admin IS TRUE;
```

Then convert inspection into the actual cleanup migration using project conventions.

### D. Add regression protection

Add verification queries or tests to prove:

1. Creating an institution as super admin does **not** create an `institution_memberships` row.
2. Creating an institution as super admin does **not** create a `user_institutions` row.
3. Institution directory queries never return super admins.
4. Normal institution admins still work correctly.

---

## Suggested Deliverables

1. **Corrective SQL migration**
   - Replaces or patches the auto-membership trigger logic
   - Preserves normal institution-admin behavior
   - Prevents super-admin leakage permanently

2. **Cleanup SQL migration**
   - Removes leaked historical rows
   - Safe to run in existing environments

3. **Institution directory patch**
   - Filters out platform admins defensively
   - Prevents accidental future leakage in the UI

4. **Verification checklist**
   - SQL proof after `db reset`
   - UI proof in Institution Admin screen

---

## Definition of Done

- [x] A super admin can create an institution without becoming a tenant member
- [x] No `institution_memberships` row is created for super admins during institution creation
- [x] No `user_institutions` row is created for super admins during institution creation
- [x] Existing leaked super-admin tenant rows are cleaned up
- [x] Institution directory never renders super admins
- [ ] Behavior remains correct after `db reset` (verify locally)
- [ ] Normal institution admin onboarding still works (verify locally)
- [x] Multi-tenant isolation rule is preserved end-to-end

---

## Security / Compliance Note

This is not just a cosmetic role-label issue.

It is a **tenant-isolation defect** because a platform operator becomes visible inside a tenant-scoped directory. That creates unnecessary cross-scope exposure and violates the intended separation between platform administration and institution membership.
