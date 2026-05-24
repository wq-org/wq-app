# Task — `cloud_files` Audit Trigger + DSGVO §4.x Definition

**Status:** 🟡 Ready to implement — prerequisites met  
**Depends on:** `audit-logevent-holistic-fix.md` (Step 1 + Step 2 fully resolved)  
**Blocks:** Institution-Admin audit log completeness for cloud file lifecycle  
**DSGVO gate:** This task MUST add `§4.9 public.cloud_files` to `principle_dsgvo_audit_datendefinition.md` **before** the migration is merged. No trigger without an approved §4.x allowlist entry.

---

## Why This Was Deferred

The gap-fix sprint was scoped to "fix broken infrastructure only — no new audit coverage." `cloud_files` was deliberately excluded because:

1. `principle_dsgvo_audit_datendefinition.md` has **no §4.x entry** for `public.cloud_files` yet. Per `principle_database.md` §"Review gate": _any migration that adds/changes audit triggers or audit payload fields must be reviewed against `principle_dsgvo_audit_datendefinition.md` allowlist/forbidden lists before merge._ Shipping a trigger without a §4.x entry would be a compliance violation, not a gap fix.

2. `file_name` is a free-text field. Per DSGVO §2.3, free-text fields are **forbidden** in `audit.events` (data minimisation, Art. 5 Abs. 1 lit. c DSGVO). A `cloud_files` trigger that naively logs `file_name` would introduce a §2.3 violation into the audit log on day one.

3. The existing `20260329000021_cloud_assets_06_triggers.sql` contains only structural triggers (`normalize_cloud_file_from_folder`, `validate_cloud_folder_tree`, `validate_cloud_files_institution_coherence`) — zero audit event emission. There is no existing pattern to accidentally break.

---

## Step 1 — Add §4.9 to `principle_dsgvo_audit_datendefinition.md`

Insert the following section **after §4.8** (`public.data_subject_requests`) in  
`docs/architecture/principle_dsgvo_audit_datendefinition.md`:

```markdown
### 4.9 `public.cloud_files`
```

✅ ERLAUBT im Audit:
event_type: cloud_file.created | cloud_file.deleted | cloud_file.status_changed
subject_id: cloud_file UUID
actor_user_id: UUID (auth.uid() at time of action)
institution_id: UUID
scope: Enum-Code — 'personal' | 'institution' | 'classroom' |
'course' | 'lesson' | 'task' | 'game' | 'chat'
mime_type: MIME-Typ-String — z.B. "image/png", "application/pdf"
size_bytes: Integer — Aggregatwert, kein Personenbezug
old_status / new_status: cloud_file_status Enum-Code

❌ VERBOTEN:
file_name — Freitext, §2.3 DSGVO-Verbot (kann PII, Diagnose-
Hinweise, Patientennamen enthalten)
storage_path — enthält institution_id + internen Pfad; kein Audit-Nutzen,
Sicherheitsrisiko (Pfadrekonstruktion)
owner_user_id im Payload — subject_id + actor_user_id sind ausreichend;
Dopplung vermeiden
Dateiinhalt / Binärdaten
signed URL / presigned URL
Virenscan-Ergebnis (security log only)
Für Kreiskliniken / Bismarckschule:
mime_type wenn es sich um klinische Bilddaten handeln könnte (DICOM etc.)
— in diesem Fall: mime_type auf Allowlist einschränken (image/png, image/jpeg,
application/pdf nur für Schulungsmaterial)

BESONDERE PFLICHT:
cloud_file.deleted events dürfen NICHT subject_id=NULL emittieren.
Soft-delete (deleted_at): event_type = 'cloud_file.deleted', subject_id = OLD.id.
Hard-delete: kein Trigger möglich — muss via RPC-Wrapper sichergestellt werden.

```

```

**This section must be committed to `docs/architecture/principle_dsgvo_audit_datendefinition.md` and reviewed before the migration in Step 3 is merged.**

---

## Step 2 — Understand the Existing `cloud_files` Table

From `20260329000017_cloud_assets_02_tables.sql`, the relevant columns on `public.cloud_files` are:

| Column           | Type                | Notes                                                            |
| ---------------- | ------------------- | ---------------------------------------------------------------- |
| `id`             | `uuid`              | Subject ID for audit                                             |
| `institution_id` | `uuid`              | Multi-tenant key — mandatory in every audit event                |
| `owner_user_id`  | `uuid`              | **NOT in audit payload** — subject_id + actor_user_id sufficient |
| `scope`          | `cloud_file_scope`  | ✅ allowed enum — log this                                       |
| `file_name`      | `text`              | ❌ **FORBIDDEN** per §2.3 — free-text field                      |
| `mime_type`      | `text`              | ✅ allowed — log this                                            |
| `size_bytes`     | `bigint`            | ✅ allowed — aggregate value                                     |
| `storage_path`   | `text`              | ❌ FORBIDDEN — internal path reconstruction risk                 |
| `status`         | `cloud_file_status` | ✅ allowed — log old/new on status change                        |
| `deleted_at`     | `timestamptz`       | Used to detect soft-delete transition                            |
| `folder_id`      | `uuid`              | Optional context — ✅ allowed as UUID reference                  |

The `scope` is populated by the existing `normalize_cloud_file_from_folder` trigger (BEFORE INSERT) — it is always set by the time AFTER INSERT fires. Safe to read from `NEW.scope`.

---

## Step 3 — Migration

**File naming convention** (matching project pattern from `principle_database.md` and existing migrations):

```
20260522XXXXXX_cloud_files_audit_trigger.sql
```

Use `20260522` as the date prefix + a 6-digit sequential suffix greater than the last migration of the day (`20260522090000_auto_membership_on_institution_create.sql`).

Suggested filename: **`20260522120000_cloud_files_audit_trigger.sql`**

### Full migration SQL

```sql
-- =============================================================================
-- CLOUD FILES — Audit trigger
-- =============================================================================
-- Purpose
--   Emits audit events for cloud_file lifecycle transitions:
--     cloud_file.created  — AFTER INSERT
--     cloud_file.deleted  — AFTER UPDATE (deleted_at NULL → non-NULL, soft-delete)
--     cloud_file.status_changed — AFTER UPDATE (status changed, not a delete)
--
-- Prerequisites
--   - audit.log_event(...) with p_subject_type / p_subject_id signature
--     (see audit-logevent-holistic-fix.md Step 2)
--   - public.cloud_files table (20260329000017_cloud_assets_02_tables.sql)
--   - public.normalize_cloud_file_from_folder trigger fires BEFORE INSERT
--     so NEW.scope is already populated when this AFTER trigger fires
--
-- DSGVO compliance gate
--   - Payload follows principle_dsgvo_audit_datendefinition.md §4.9 allowlist
--   - file_name is NEVER logged (§2.3 Freitext-Verbot)
--   - storage_path is NEVER logged (security risk)
--   - owner_user_id is NEVER logged in payload (actor_user_id via auth.uid() sufficient)
--
-- Safe to re-run: function is CREATE OR REPLACE, trigger is dropped first.
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_cloud_files_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  -- -------------------------------------------------------------------------
  -- Determine event type
  -- -------------------------------------------------------------------------
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'cloud_file.created';

  ELSIF TG_OP = 'UPDATE' THEN
    -- Soft-delete transition takes priority
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'cloud_file.deleted';
    -- Status change (excluding delete — already handled above)
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
      v_event_type := 'cloud_file.status_changed';
    ELSE
      -- No tracked field changed — skip
      RETURN NEW;
    END IF;

  ELSE
    -- Hard DELETE: cannot reliably emit audit event from trigger because
    -- auth.uid() may not be available in cascade context.
    -- Hard deletes must go through an RPC wrapper that calls audit.log_event()
    -- before performing the DELETE. Document this constraint.
    RETURN OLD;
  END IF;

  -- -------------------------------------------------------------------------
  -- Emit audit event
  -- ❌ file_name  — NEVER log (§2.3 free-text forbidden)
  -- ❌ storage_path — NEVER log (security risk)
  -- ❌ owner_user_id in payload — redundant with actor_user_id
  -- -------------------------------------------------------------------------
  PERFORM audit.log_event(
    p_event_type     := v_event_type,
    p_subject_type   := 'cloud_file'::text,
    p_subject_id     := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload        := jsonb_build_object(
      'scope',       COALESCE(NEW.scope, OLD.scope)::text,
      'mime_type',   COALESCE(NEW.mime_type, OLD.mime_type),
      'size_bytes',  COALESCE(NEW.size_bytes, OLD.size_bytes),
      'old_status',  CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::text ELSE NULL END,
      'new_status',  CASE WHEN TG_OP = 'UPDATE' THEN NEW.status::text ELSE NULL END,
      'folder_id',   COALESCE(NEW.folder_id, OLD.folder_id)
    ),
    p_metadata       := jsonb_build_object(
      'visibility_level', 'institution_admin'::text,
      'context', jsonb_build_object(
        'cloud_file_id', COALESCE(NEW.id, OLD.id)
      ),
      'changed_fields', CASE
        WHEN TG_OP <> 'UPDATE' THEN '[]'::jsonb
        ELSE to_jsonb(
          ARRAY_REMOVE(ARRAY[
            CASE WHEN NEW.status     IS DISTINCT FROM OLD.status     THEN 'status'     END,
            CASE WHEN NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN 'deleted_at' END,
            CASE WHEN NEW.folder_id  IS DISTINCT FROM OLD.folder_id  THEN 'folder_id'  END,
            CASE WHEN NEW.size_bytes IS DISTINCT FROM OLD.size_bytes THEN 'size_bytes' END
          ], NULL)
        )
      END
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION audit.log_cloud_files_audit() FROM public;

-- Bind the trigger
DROP TRIGGER IF EXISTS audit_cloud_files ON public.cloud_files;

CREATE TRIGGER audit_cloud_files
  AFTER INSERT OR UPDATE ON public.cloud_files
  FOR EACH ROW
  EXECUTE FUNCTION audit.log_cloud_files_audit();
```

---

## Step 4 — Hard-Delete Gap (Important Constraint)

The trigger above covers **INSERT** (created) and **UPDATE** (soft-delete via `deleted_at`, status change). It does **not** cover hard `DELETE` statements because `auth.uid()` is unreliable in cascade-delete contexts and `OLD` has no `NEW` to return.

Any RPC or function that performs a hard `DELETE` on `cloud_files` must emit the audit event **before** the delete:

```sql
-- Pattern: call audit.log_event() BEFORE the DELETE in every hard-delete RPC
PERFORM audit.log_event(
  p_event_type     := 'cloud_file.deleted'::text,
  p_subject_type   := 'cloud_file'::text,
  p_subject_id     := p_cloud_file_id,
  p_institution_id := v_institution_id,
  p_payload        := jsonb_build_object(
    'scope',      v_scope::text,
    'mime_type',  v_mime_type,
    'size_bytes', v_size_bytes,
    'old_status', v_status::text,
    'new_status', NULL
  ),
  p_metadata := jsonb_build_object(
    'visibility_level', 'institution_admin'::text,
    'context', jsonb_build_object('cloud_file_id', p_cloud_file_id),
    'changed_fields', '["deleted_at"]'::jsonb
  )
);

DELETE FROM public.cloud_files WHERE id = p_cloud_file_id;
```

Check `20260329000019_cloud_assets_04_functions_rpcs.sql` for all RPCs that hard-delete `cloud_files` rows and add the pre-delete emit to each.

---

## Step 5 — Verification Queries

Run after deploying the migration:

```sql
-- 5a. Confirm trigger exists and is bound
SELECT tgname, tgenabled, tgtype
FROM pg_trigger
WHERE tgrelid = 'public.cloud_files'::regclass
  AND tgname = 'audit_cloud_files';
-- Expected: one row, tgenabled = 'O' (origin), tgtype = INSERT + UPDATE

-- 5b. Smoke test — insert a cloud_file row and check audit event
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"4cd136f2-3b10-43da-95ca-ff0ebcfd0ace"}';

INSERT INTO public.cloud_files (
  id, institution_id, owner_user_id, scope,
  file_name, mime_type, size_bytes, storage_path, status
) VALUES (
  gen_random_uuid(),
  '<your-institution-id>',
  '4cd136f2-3b10-43da-95ca-ff0ebcfd0ace',
  'personal'::public.cloud_file_scope,
  'audit-test.png',          -- stored in DB but NEVER in audit payload
  'image/png',
  54321,
  '<institution-id>/files/audit-test.png',
  'active'::public.cloud_file_status
) RETURNING id;

-- Immediately verify the audit event was emitted
SELECT event_type, subject_type, subject_id, payload, metadata
FROM audit.events
WHERE subject_type = 'cloud_file'
ORDER BY occurred_at DESC
LIMIT 1;

-- Must satisfy ALL of these:
-- event_type = 'cloud_file.created'
-- payload->>'file_name' IS NULL           ← §2.3 compliance check
-- payload->>'storage_path' IS NULL        ← security check
-- payload->>'scope' = 'personal'
-- payload->>'mime_type' = 'image/png'
-- payload->>'size_bytes' = '54321'

ROLLBACK;
```

---

## Definition of Done

- [ ] `principle_dsgvo_audit_datendefinition.md §4.9` added, reviewed, and committed
- [ ] Migration `20260522120000_cloud_files_audit_trigger.sql` applied cleanly
- [ ] `audit_cloud_files` trigger bound to `public.cloud_files` (INSERT + UPDATE)
- [ ] Smoke test: `cloud_file.created` event emitted on INSERT
- [ ] Smoke test: `cloud_file.deleted` event emitted on soft-delete UPDATE
- [ ] Payload contains NO `file_name`, NO `storage_path`, NO `owner_user_id`
- [ ] Hard-delete RPCs in `cloud_assets_04_functions_rpcs.sql` emit pre-delete audit events
- [ ] `npm run lint:sql` passes on the new migration file
- [ ] DSGVO review gate confirmed: §4.9 allowlist matches trigger payload exactly
