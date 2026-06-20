# Audit Remediation Plan — WQ-App

> Goal: close the audit-coverage gaps found against `principle_database.md` and `principle_dsgvo_audit_datendefinition.md`, reliably and without regressing the canonical `audit.log_event()` contract.
>
> Binding contracts (do not deviate):
> - `docs/architecture/principle_database.md` — RLS, SECURITY DEFINER safe-SQL, two-layer audit.
> - `docs/architecture/principle_dsgvo_audit_datendefinition.md` — event envelope, allowlist, `visibility_level`, forbidden free-text.
>
> Hard rules carried into every change below:
> - Never log free-text. §2.3 explicitly forbids `notes.content` and `task_submissions.feedback`. We log **status + IDs only**.
> - `actor_user_id` is resolved by `auth.uid()` inside `audit.log_event` — never passed as a param.
> - Trigger functions: `LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''`, fully schema-qualified.
> - `event_type` = semantic `entity.verb`. `subject_type` = **singular canonical entity** (`task_submission`, `note`) — never the plural table name.
> - Every event sets `metadata.visibility_level`.
> - Skip no-op UPDATEs (don't log `updated_at`-only writes) — mirror `audit.log_cloud_files_audit`.
> - Run `npm run lint:sql` after every migration; review `npm run format:sql` diffs.

---

## Summary of work

| # | Gap | Severity | Action | New migration |
| - | --- | -------- | ------ | ------------- |
| 1 | `task_submissions` — no audit | 🔴 | New trigger fn + trigger: `submission.created/graded/feedback_edited/returned` | `..135_task_submissions_audit_trigger.sql` |
| 2 | `notes` — no audit | 🔴 | New trigger fn + trigger: `note.created/shared/deleted` (lifecycle only) | `..136_notes_audit_trigger.sql` |
| 3 | lesson **version-level** publish history | 🟠 | Verify; add `lesson_version.published` if missing | `..137_lesson_version_publish_audit.sql` (conditional) |
| 4 | `course_deliveries` / `game_deliveries` rollout | 🟠 | Verify `delivery.published/archived` fire for both; add missing | `..138_delivery_lifecycle_audit.sql` (conditional) |
| 5 | `visibility_level` consistency sweep | ⚠️ | Audit all emitters; billing/pricing → `super_admin` | `..139_audit_visibility_level_fix.sql` |
| 6 | Generic `'published'` event name leak | ⚠️ | Find + rename to semantic `entity.published` | folded into the owning migration |
| 7 | `subject_type` canonicalization | ⚠️ | Sweep plural→singular | folded into owning migrations |

Numbering continues the existing chain (last live = `..134_custom_pricing_07_rls_policies.sql`). Adjust integers if other migrations land first.

---

## Phase 0 — Verify before writing (no schema change)

Run these read-only checks so phases 3–7 only touch real gaps:

```bash
cd supabase/migrations

# 3 — does a version-level lesson publish event already exist?
grep -rni "lesson_version.published\|lesson.published" .

# 4 — do delivery publish/archive events fire for course AND game (not only task)?
grep -rniE "delivery\.(published|archived|status_changed)" .
grep -rniE "course_delivery|game_delivery|game_deliveries|course_deliveries" . | grep -i audit

# 5 — every visibility_level currently emitted
grep -rhoiE "visibility_level'[^,]*,[^']*'[a-z_]+'" . | sort | uniq -c

# 6 — generic / non-namespaced event_type literals
grep -rhoiE "p_event_type[[:space:]]*:=[[:space:]]*'[a-z_]+'" . | grep -v "\." | sort -u
grep -rniE "log_event\([^)]*'published'" .

# 7 — subject_type that look plural (end in 's' and match a table name)
grep -rhoiE "p_subject_type[[:space:]]*:=[[:space:]]*'[a-z_]+'" . | sort -u
```

Record the results; they decide whether migrations 137 and 138 are needed or become no-ops.

---

## Phase 1 — `task_submissions` audit (🔴 grading integrity)

`principle_database.md` mandates auditing "learner outcomes: manual overrides, grade re-computation, feedback edits." `task_submissions` today has only `set_updated_at` + RLS.

Columns (real): `id, task_group_id, task_delivery_id, institution_id, status submission_status, submitted_by, submitted_at, feedback text, reviewed_at, reviewed_by, created_at, updated_at`.

Event model:
- INSERT → `submission.created`
- UPDATE, `status` changed to a reviewed/returned state → `submission.graded` (entered review) / `submission.returned` (sent back for revision) — map from your `submission_status` enum values.
- UPDATE, `feedback` changed (regardless of status) → `submission.feedback_edited` — **log the fact only, never the text** (§2.3).

Forbidden in payload: `feedback` text, `description`, any name/email. Allowed: `status`, `old_status/new_status`, `changed_fields`, context IDs.

New file `..135_task_submissions_audit_trigger.sql`:

```sql
-- HETZNER_TEARDOWN: KEEP_CORE | WQ-MINIMAL-CORE | task grading-integrity audit — required | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- TASK SUBMISSIONS — audit trigger (grading integrity)
-- Contract: principle_dsgvo_audit_datendefinition.md §2.3 (no free-text),
--           §3 envelope, canonical audit.log_event caller pattern.
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_task_submissions_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type    text;
  v_feedback_chg  boolean := FALSE;
  v_status_chg    boolean := FALSE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'submission.created';

  ELSIF TG_OP = 'UPDATE' THEN
    v_status_chg   := NEW.status   IS DISTINCT FROM OLD.status;
    -- feedback content is NEVER logged; only the fact that it changed
    v_feedback_chg := NEW.feedback IS DISTINCT FROM OLD.feedback;

    IF v_status_chg AND NEW.status = 'returned'::public.submission_status THEN
      v_event_type := 'submission.returned';
    ELSIF v_status_chg AND NEW.status = 'reviewed'::public.submission_status THEN
      v_event_type := 'submission.graded';
    ELSIF v_feedback_chg THEN
      v_event_type := 'submission.feedback_edited';
    ELSE
      RETURN NEW;  -- updated_at-only / irrelevant write: no log spam
    END IF;

  ELSE
    RETURN OLD;  -- DELETE handled by cascade; no event
  END IF;

  PERFORM audit.log_event(
    p_event_type     := v_event_type,
    p_subject_type   := 'task_submission'::text,           -- singular canonical
    p_subject_id     := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload        := jsonb_build_object(
      'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::text END,
      'new_status', COALESCE(NEW.status, OLD.status)::text,
      'feedback_changed', v_feedback_chg                    -- boolean only, never text
    ),
    p_metadata       := jsonb_build_object(
      'visibility_level', 'institution_admin'::text,
      'context', jsonb_build_object(
        'task_submission_id', COALESCE(NEW.id, OLD.id),
        'task_delivery_id',   COALESCE(NEW.task_delivery_id, OLD.task_delivery_id),
        'task_group_id',      COALESCE(NEW.task_group_id, OLD.task_group_id)
      ),
      'changed_fields', CASE
        WHEN TG_OP <> 'UPDATE' THEN '[]'::jsonb
        ELSE to_jsonb(ARRAY_REMOVE(ARRAY[
          CASE WHEN v_status_chg   THEN 'status'   END,
          CASE WHEN v_feedback_chg THEN 'feedback' END   -- name only, not value
        ], NULL))
      END
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_task_submissions_audit() IS
  'Grading-integrity audit for task_submissions. Logs status transitions and the '
  'fact of feedback edits only — never feedback text (DSGVO §2.3).';

DROP TRIGGER IF EXISTS trg_task_submissions_audit ON public.task_submissions;
CREATE TRIGGER trg_task_submissions_audit
  AFTER INSERT OR UPDATE ON public.task_submissions
  FOR EACH ROW EXECUTE FUNCTION audit.log_task_submissions_audit();
```

> Confirm the exact `submission_status` enum labels in `..033_tasks_notes_01_types.sql` and adjust `'returned'`/`'reviewed'` to match. If there is no `returned` label, drop that branch.

---

## Phase 2 — `notes` audit (🔴 lifecycle only)

§2.3 forbids `notes.content`. Log lifecycle + scope only — useful because collaborative notes are shared workspaces tied to a `task_group`.

Columns (real): `id, institution_id, owner_user_id, task_group_id, scope note_scope, title, description, theme_id, content jsonb, content_schema_version, is_pinned, lesson_id, created_at, updated_at, deleted_at`.

Event model:
- INSERT → `note.created`
- UPDATE, `scope` `personal`→`collaborative` (or `task_group_id` set) → `note.shared`
- UPDATE, `deleted_at` NULL→timestamp → `note.deleted` (soft delete)
- everything else (title/content/pin edits) → no event (free-text / low value)

Forbidden: `title`, `description`, `content`, `theme_id`. Allowed: `scope`, `old_scope/new_scope`, context IDs (`task_group_id`, `lesson_id`).

New file `..136_notes_audit_trigger.sql`:

```sql
-- HETZNER_TEARDOWN: KEEP_CORE | WQ-MINIMAL-CORE | notes lifecycle audit — required | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- NOTES — audit trigger (lifecycle only; NEVER content/title — DSGVO §2.3)
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_notes_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'note.created';

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      v_event_type := 'note.deleted';                      -- soft delete
    ELSIF NEW.scope IS DISTINCT FROM OLD.scope
          AND NEW.scope = 'collaborative'::public.note_scope THEN
      v_event_type := 'note.shared';
    ELSE
      RETURN NEW;                                           -- title/content edits: not logged
    END IF;

  ELSE
    RETURN OLD;                                             -- hard DELETE: cascade only
  END IF;

  PERFORM audit.log_event(
    p_event_type     := v_event_type,
    p_subject_type   := 'note'::text,                       -- singular canonical
    p_subject_id     := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload        := jsonb_build_object(
      'scope',     COALESCE(NEW.scope, OLD.scope)::text,
      'old_scope', CASE WHEN TG_OP = 'UPDATE' THEN OLD.scope::text END,
      'new_scope', CASE WHEN TG_OP = 'UPDATE' THEN NEW.scope::text END
    ),
    p_metadata       := jsonb_build_object(
      'visibility_level', 'institution_admin'::text,
      'context', jsonb_build_object(
        'note_id',       COALESCE(NEW.id, OLD.id),
        'task_group_id', COALESCE(NEW.task_group_id, OLD.task_group_id),
        'lesson_id',     COALESCE(NEW.lesson_id, OLD.lesson_id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_notes_audit() IS
  'Lifecycle audit for notes (created/shared/deleted). Never logs title, '
  'description or content JSONB (DSGVO §2.3 free-text prohibition).';

DROP TRIGGER IF EXISTS trg_notes_audit ON public.notes;
CREATE TRIGGER trg_notes_audit
  AFTER INSERT OR UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION audit.log_notes_audit();
```

---

## Phase 3 — lesson version-level publish (🟠 verify, conditional)

Today `lesson.published` exists; `lesson_version.disabled` exists. Confirm whether publishing a new immutable `lesson_versions` row emits `lesson_version.published`. The immutable-publish principle wants version-level history.

- If the publish RPC (`..103/104` or `..121_course_publish_resolve_lesson_versions.sql`) already emits it → mark resolved, no change.
- If not → add a `PERFORM audit.log_event(p_event_type := 'lesson_version.published', p_subject_type := 'lesson_version', ...)` inside the publish RPC (not a row trigger — publish is RPC-driven), payload = version number + status only.

`visibility_level` = `institution_admin` (content lifecycle).

---

## Phase 4 — course/game delivery lifecycle (🟠 verify, conditional)

Task deliveries emit `task_delivery.status_changed` (via `audit.log_task_delivery_state_change`). Confirm the equivalent fires for **course** and **game** deliveries.

- `course_deliveries`: check `..117_course_delivery_single_current.sql`, `..119_course_delivery_offline_lifecycle.sql`, `..115_course_publish_to_classrooms_rpc.sql` for `delivery.published` / `delivery.archived` / `delivery.offline`.
- `game_deliveries`: check the game-delivery RPCs for the same.
- For any missing path, add an `AFTER UPDATE` trigger fn modeled on `log_task_delivery_state_change`, emitting `course_delivery.status_changed` / `game_delivery.status_changed` with `old_status/new_status` only.

`subject_type` must be singular: `course_delivery`, `game_delivery`.

---

## Phase 5 — `visibility_level` consistency (⚠️)

Contract: every event carries `metadata.visibility_level`. Mapping rule:

| Domain | visibility_level |
| ------ | ---------------- |
| membership, invite, classroom_member, settings, content (course/game/lesson/task/note/submission) | `institution_admin` |
| **pricing/billing**: `plan_catalog.*`, `plan_entitlement.*`, `plan_version.*`, `subscription.*`, `invoice.*`, `entitlement_override.*`, `billing_providers` | `super_admin` |
| privileged/support access, impersonation, cross-tenant reads | `security_only` |

Action: from Phase 0 check #5, list every emitter and fix two classes:
1. Any event with **no** `visibility_level` → add it.
2. Any pricing/billing event currently set to `institution_admin` → change to `super_admin`.

Put the corrections in `..139_audit_visibility_level_fix.sql` as `CREATE OR REPLACE FUNCTION` for each affected trigger fn (whole-function replacement, since the value is baked into `jsonb_build_object`). Do not edit historical rows in `audit.events` (append-only); only fix go-forward emitters.

---

## Phase 6 — generic event-name leak (⚠️)

From Phase 0 check #6, locate the bare `'published'` literal and any other non-namespaced name. Rename to its semantic `entity.verb` form (likely `lesson.published` or `course.published` depending on the owning RPC). Fix in the owning migration via `CREATE OR REPLACE`. No catch-all names may remain.

---

## Phase 7 — `subject_type` canonicalization (⚠️)

From Phase 0 check #7, ensure no emitter uses a plural table name as `subject_type`. Canonical singular names: `institution_membership`, `classroom_member`, `task_submission`, `note`, `cloud_file`, `course_delivery`, `game_delivery`, `plan_version`, `institution_subscription`, etc. Fix any plural occurrences in their owning functions.

---

## Validation (run after each phase)

```bash
npm run lint:sql           # SQLFluff + check_sql_naming.py
# manual smoke (local Supabase):
#   - INSERT a task_submission     -> expect submission.created
#   - UPDATE status to reviewed    -> submission.graded
#   - UPDATE feedback text only    -> submission.feedback_edited (NO feedback text in payload)
#   - INSERT note, flip to collaborative, soft-delete -> note.created/shared/deleted
#   - SELECT payload, metadata FROM audit.events ORDER BY occurred_at DESC LIMIT 10;
#     confirm: no free-text, visibility_level present, subject_type singular
```

Acceptance criteria (all must hold):
- [ ] `task_submissions` and `notes` each emit lifecycle events; payloads contain zero free-text.
- [ ] Every new event has `metadata.visibility_level`; pricing/billing = `super_admin`.
- [ ] No `event_type` without a `.`; no plural `subject_type`.
- [ ] Trigger fns are `SECURITY DEFINER` + `SET search_path = ''`; actor never passed in.
- [ ] `npm run lint:sql` passes.
- [ ] Institution-admin audit view (`..083` RPC) shows the new events tenant-scoped; super-admin sees them globally.

---

## Out of scope (deliberately)
- No new columns on `task_submissions` / `notes`.
- No edits to existing `audit.events` rows (append-only).
- No new `audit.log_event` overloads or signature changes (contract §6 forbids).
- Cleanup/minimization of legacy tables (`tasks`, org-hierarchy, `teacher_followers`) is tracked separately under the existing `HETZNER_TEARDOWN` plan — not part of this audit fix.
