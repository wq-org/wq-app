# 🛠️ Holistic Fix — `audit.log_event` + Cloud Upload + RLS

**Priority:** 🔴 Critical — blocks image upload, cloud file operations, and all downstream audit triggers  
**Reference:** `docs/architecture/dsgvo-audit-datendefinition.md` (Version 1.0, April 2026)  
**Goal:** Make the full stack work end-to-end — avatar upload, `cloud_files` INSERT, `institution_memberships` — with zero backfill, zero data loss, and full DSGVO compliance.

---

## Root Cause Summary — 3 Linked Failures (One Chain)

These are not three separate bugs. They form a single cascading failure:

| #   | Failure                                                     | Error Code | Downstream Effect                                                                                                            |
| --- | ----------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | Missing `institution_memberships` row                       | `42501`    | `app.member_institution_ids()` returns empty → all RLS `WITH CHECK` on `cloud_files`, `storage.objects`, audit triggers fail |
| 2   | Stale audit function call (`p_entity_type` / `p_entity_id`) | `42883`    | Any write touching an audited table throws — upload, insert, membership change all fail                                      |
| 3   | Avatar signed URL failure                                   | `PGRST301` | Downstream consequence of #1 — not an independent bug                                                                        |

**Fix all three in order. Resolving #1 unblocks #3 automatically.**

---

## Step 1 — Fix the Missing `institution_memberships` Row

This is the root of the entire failure chain. Run as **postgres role** in Supabase SQL Editor:

```sql
-- 1a. Confirm the institution ID
SELECT id, name FROM institutions LIMIT 10;

-- 1b. Insert the missing membership
INSERT INTO institution_memberships (
  user_id,
  institution_id,
  membership_role,
  status,
  deleted_at,
  left_institution_at
)
VALUES (
  '4cd136f2-3b10-43da-95ca-ff0ebcfd0ace',  -- user_id (replace with actual)
  '<institution_id_from_step_1a>',
  'teacher',   -- or 'institution_admin' — match intended test role
  'active',
  NULL,
  NULL
);

-- 1c. Verify the RLS helper now works
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"4cd136f2-3b10-43da-95ca-ff0ebcfd0ace"}';
SELECT app.member_institution_ids();
-- Must return at least one UUID row before continuing to Step 2
```

**After Step 1:** `cloud_files` INSERT, storage upload, and signed URL generation for avatars all unblock immediately — no further code changes needed for those paths.

---

## Step 2 — Fix the Audit Function Signature (Error `42883`)

### 2a. Inspect what is actually deployed

Run this before touching any code:

```sql
SELECT
  n.nspname    AS schema,
  p.proname    AS function_name,
  pg_get_function_identity_arguments(p.oid) AS deployed_signature
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'audit'
  AND p.proname IN ('log_event', 'logevent')
ORDER BY 2;
```

The `42883` error means one of:

- The function does not exist under that exact name, **or**
- The deployed parameter names differ (`p_entity_type` vs `p_subject_type`), **or**
- String literals were passed as type `unknown` without explicit casts — PostgreSQL cannot resolve the overload

### 2b. Canonical function — deploy this as the single audit writer

This is the only permitted write path to `audit.events` per `dsgvo-audit-datendefinition.md §6.3`.

```sql
CREATE OR REPLACE FUNCTION audit.log_event(
  p_institution_id  UUID,
  p_actor_id        UUID,
  p_event_type      TEXT,
  p_subject_type    TEXT,   -- ← correct name (not p_entity_type)
  p_subject_id      UUID,
  p_payload         JSONB DEFAULT '{}'::jsonb,
  p_metadata        JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = audit, public
AS $$
BEGIN
  INSERT INTO audit.events (
    institution_id,
    actor_user_id,
    event_type,
    subject_type,
    subject_id,
    payload,
    metadata,
    occurred_at
  ) VALUES (
    p_institution_id,
    p_actor_id,
    p_event_type,
    p_subject_type,
    p_subject_id,
    p_payload,
    p_metadata,
    now()
  );
END;
$$;

-- Ensure no direct inserts are possible from authenticated sessions
REVOKE INSERT, UPDATE, DELETE ON audit.events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON audit.events FROM anon;
```

### 2c. Backward-compatibility shim — temporary, remove after full migration

Adding this overload means existing triggers that pass `p_entity_type` / `p_entity_id` continue working while callers are refactored one by one. **This is a bridge — not a permanent state.**

```sql
-- Shim: translates old p_entity_type / p_entity_id → correct canonical names
CREATE OR REPLACE FUNCTION audit.log_event(
  p_institution_id  UUID,
  p_actor_id        UUID,
  p_event_type      TEXT,
  p_entity_type     TEXT,   -- old callers use this name
  p_entity_id       UUID,   -- old callers use this name
  p_payload         JSONB DEFAULT '{}'::jsonb,
  p_metadata        JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = audit, public
AS $$
BEGIN
  -- Forward to the canonical function
  PERFORM audit.log_event(
    p_institution_id := p_institution_id,
    p_actor_id       := p_actor_id,
    p_event_type     := p_event_type,
    p_subject_type   := p_entity_type,  -- translate
    p_subject_id     := p_entity_id,    -- translate
    p_payload        := p_payload,
    p_metadata       := p_metadata
  );
END;
$$;
```

### 2d. Correct call pattern — use in all new triggers and RPCs

Explicit `::text` and `::jsonb` casts are **mandatory**. PostgreSQL cannot resolve a function when argument types are `unknown` (uncast string literals).

```sql
-- ✅ Correct — explicit casts on every literal
PERFORM audit.log_event(
  p_institution_id := NEW.institution_id,
  p_actor_id       := auth.uid(),
  p_event_type     := 'cloud_file.created'::text,
  p_subject_type   := 'cloud_file'::text,
  p_subject_id     := NEW.id,
  p_payload        := jsonb_build_object(
                        'file_name', NEW.file_name,
                        'folder_id', NEW.folder_id
                      ),
  p_metadata       := '{}'::jsonb
);

-- ❌ Wrong — string literals without casts → PostgreSQL error 42883
PERFORM audit.log_event(
  p_institution_id := NEW.institution_id,
  p_actor_id       := auth.uid(),
  p_event_type     := 'cloud_file.created',  -- unknown type
  p_entity_type    := 'cloud_file',          -- wrong param name + unknown type
  p_entity_id      := NEW.id
);
```

---

## Step 3 — DSGVO Payload Compliance Check

Every trigger payload must pass the allowlist from `dsgvo-audit-datendefinition.md §2` and `§3` **before merging**.

### Allowlist — what MAY go into `audit.events.payload`

| Field                       | Allowed value type                        | Example                         |
| --------------------------- | ----------------------------------------- | ------------------------------- |
| `subject_id`                | UUID only                                 | `"3fa85f64-..."`                |
| `event_type`                | Semantic name string                      | `"cloud_file.created"`          |
| `institution_id`            | UUID                                      |                                 |
| `changed_fields`            | Array of field **names** only — no values | `["status", "membership_role"]` |
| `old_status` / `new_status` | Enum code                                 | `"active"` → `"suspended"`      |
| `old_role` / `new_role`     | Enum code                                 | `"student"` → `"teacher"`       |
| `left_reason_code`          | Enum code — no free text                  | `"graduation"`                  |

### Hard bans — NEVER in `audit.events` payload

```
❌ old_row / new_row as full JSON dump
❌ Any free-text field: notes.content, messages.content, tasksubmissions.feedback
❌ name, email, phone, address — full profile row
❌ Tokens: JWT, invite_token, magic_link_token, password_reset_token
❌ Credentials: API keys, service account, SMTP secret, webhook secret
❌ IP address, user agent, device ID (security log only, separate table)
❌ Stack traces, exception details, query parameters with personal data
❌ Art. 9 DSGVO  health, diagnosis, clinical, biometric, genetic
❌ For cloud_files specifically: file content/binary, signed URL, virus scan result
```

**Legal basis:** Art. 9 Abs. 1 DSGVO (processing ban), Art. 32 DSGVO (integrity/confidentiality), Art. 5 Abs. 1 lit. c DSGVO (data minimisation).

---

## Step 4 — Verify Cloud Upload End-to-End

After Steps 1–3, run these checks in order:

```sql
-- 4a. Confirm cloud_files RLS policies are intact
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'cloud_files'
ORDER BY cmd;

-- 4b. Test INSERT as authenticated user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"4cd136f2-3b10-43da-95ca-ff0ebcfd0ace"}';

INSERT INTO cloud_files (
  id, institution_id, folder_id, file_name,
  owner_user_id, mime_type, size_bytes, storage_path
) VALUES (
  gen_random_uuid(),
  '<institution_id>',
  NULL,
  'test-avatar.png',
  '4cd136f2-3b10-43da-95ca-ff0ebcfd0ace',
  'image/png',
  12345,
  '<institution_id>/files/test-avatar.png'
);
-- Must succeed: no 42501, no 42883

-- 4c. Test storage signed URL (from SDK or Supabase dashboard)
-- supabase.storage.from('avatars').createSignedUrl('path/to/avatar.png', 60)
-- Must return a signed URL object, not an error
```

---

## Step 5 — Migrate All Remaining Old Callers

Find every file still using the stale parameter names:

```bash
# Run from project root
grep -rn "p_entity_type\|p_entity_id\|audit\.log_event\|audit\.logevent" \
  supabase/migrations/ \
  --include="*.sql"
```

For each match:

1. Replace `p_entity_type` → `p_subject_type`
2. Replace `p_entity_id` → `p_subject_id`
3. Add `::text` cast to every string literal
4. Add `::jsonb` cast to every JSON literal

Once all callers are migrated and verified, **drop the backward-compat shim** from Step 2c:

```sql
-- Run only after all migrations and triggers are confirmed migrated
DROP FUNCTION IF EXISTS audit.log_event(
  UUID, UUID, TEXT, TEXT, UUID, JSONB, JSONB
);
-- Note: drop by exact argument type signature to target only the shim overload
```

---

## Definition of Done

- [ ] `app.member_institution_ids()` returns a non-empty set for the test user
- [ ] `cloud_files` INSERT succeeds without `42501`
- [ ] Storage upload (avatar + cloud file) succeeds end-to-end from the UI
- [ ] Signed URL generation for avatars works without error
- [ ] `audit.log_event(...)` resolves without error `42883`
- [ ] All audit payloads pass the DSGVO §2/§3 allowlist check
- [ ] No `p_entity_type` / `p_entity_id` usages remain in migrations after cleanup
- [ ] Backward-compat shim removed after all callers migrated
- [ ] No backfill of existing rows required — fix is forward-only

---

## DSGVO Compliance Constraints (Art. 32 TOM — Non-Negotiable)

Per `dsgvo-audit-datendefinition.md §6.3`:

- `audit.events` is **append-only** — no `UPDATE` or `DELETE` by authenticated roles, ever
- Writes only via `audit.log_event` `SECURITY DEFINER` — no direct `INSERT` from the application layer
- Institution Admin sees only rows matching their own `institution_id` — RLS must enforce this
- IP addresses, device IDs, stack traces: stored separately in a **security log table**, never in `audit.events`
- Retention + pseudonymisation after expiry: enforced per institution tier per `dsgvo-audit-datendefinition.md §6.1`
- For Kreiskliniken Reutlingen (KRITISCH) and Bismarckschule (HOCH): no clinical context, no Art. 9 data, ever — even as a field name in `changed_fields`
- For Neckar-Realschule (Minderjährige): no individual pupil learning progress, disability, VKL status, or guardian contact in any log
