# principle_custom_pricing.md

> **Immutable, versioned custom pricing tiers for WQ.**
> Super-admin defines features → assembles a custom plan → publishes it as an **immutable version snapshot** → assigns that snapshot to an institution as a subscription (monthly / yearly, activated on confirmed payment). Teachers and students only ever see features the institution's effective entitlements include — everything else is hidden.
>
> Written in the `principle_task_template.md` 7-keyword format so it is also a ready-to-implement task.
> Aligns with: `principle_database.md` (RLS, audit, tenancy), `principle_commercial_access_graph.md`, `principle_institution_hierarchy_deliveries.md`, `course_publishing_mental_model.md` (three-layer immutability pattern).

---

## Goal

Let a super-admin define feature variables, assemble a **custom plan**, freeze it into an **immutable, version-numbered snapshot** (full history retained), and **assign that exact snapshot** to an institution as a monthly or yearly subscription that becomes active only after payment is confirmed — while teachers and students see only the features their institution's effective entitlements grant.

---

## Description

**Context:** WQ sells to institutions, not individuals. The commercial deal is per-institution and often bespoke ("Institution A gets Game Studio + 50 teachers + 200 GB, billed yearly; Institution B gets the standard Plus tier monthly"). Super-admins negotiate the deal, build the matching tier, and assign it. Institution-admins, teachers, and students consume the result through feature flags.

**The problem with today's model:** The existing chain (`feature_definitions` → `plan_entitlements` → `institution_entitlement_overrides`, resolved `default → plan → override` by `public.list_my_institution_feature_flags()`) works, but **plans and entitlements are mutable rows**. Editing a plan silently rewrites what every subscribed institution gets, with no snapshot of "what was sold" and no version history. This breaks auditability and contractual integrity.

**The fix — reuse the proven three-layer immutability pattern** already used for courses (`course_publishing_mental_model.md`):


| Layer                   | Purpose                                                                                       | Mutable?                      | Analogous course layer |
| ----------------------- | --------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------- |
| 1. Authoring            | `plan_catalog` + draft entitlement matrix the super-admin edits freely                        | mutable                       | `courses` / `lessons`  |
| 2. Version (snapshot)   | `plan_versions` + frozen `plan_version_entitlements` — the immutable "what was sold"          | **immutable after publish**   | `course_versions`      |
| 3. Assignment (rollout) | `institution_subscriptions` pins one `plan_version_id`; status mutable, version binding fixed | status mutable, binding fixed | `course_deliveries`    |


**Central rule (mirrors courses):** An institution never consumes Layer 1. Effective entitlements resolve only against the **frozen Layer-2 version** its active Layer-3 subscription pins, plus per-institution overrides.

**Scope — in:** new `plan_versions` / `plan_version_entitlements` tables; `plan_version_status` enum; publish RPC; assign RPC; payment-gated activation; updated effective-resolution RPC; RLS; audit triggers; teacher/student feature-hiding contract.
**Scope — out:** payment-provider integration internals (kept behind `billing_providers` + a webhook that calls the activation RPC); UI component code (this doc specifies behavior, not React).

**Reused existing objects:** `public.feature_definitions`, `public.plan_catalog`, `public.institution_subscriptions`, `public.institution_entitlement_overrides`, `public.billing_providers`, `audit.events`, enums `entitlement_value_type`, `billing_status`.

---

## User Action 1 — Super-admin defines / edits a feature variable

**Trigger:** Super-admin opens **Platform → Features**, clicks **New feature** (or edits one), and sets `key`, `name`, `category`, and `value_type` (`boolean | integer | bigint | text`), plus `default_enabled` for booleans.
**Outcome:** A row is upserted in `public.feature_definitions`. Feature keys are the stable contract every plan version and the frontend reference. Changing a definition's metadata never alters already-published plan versions (those carry their own frozen copy of the value).

## User Action 2 — Super-admin assembles a custom plan (draft)

**Trigger:** Super-admin opens **Platform → Plans → New custom plan**, names it (e.g. code `custom-akademie-nord`), sets list `price_amount` / `currency` / `billing_interval`, then toggles/fills each feature value in the draft entitlement matrix (e.g. `game_studio = true`, `max_teachers = 50`, `storage_quota_mb = 204800`).
**Outcome:** A `plan_catalog` row exists (Layer 1, mutable) with a draft entitlement matrix the super-admin can edit freely. Nothing is sold yet; no institution is affected.

## User Action 3 — Super-admin publishes the plan as an immutable version

**Trigger:** Super-admin clicks **Publish version**, optionally adds a `change_note`.
**Outcome:** `app.publish_plan_version(plan_id, change_note?)` creates a new `plan_versions` row with the next `version_no` (unique per plan, monotonically increasing), status `published`, `published_at = now()`, and copies the **entire current entitlement matrix** into immutable `plan_version_entitlements` rows. The snapshot can never be edited or deleted — only superseded by a newer version or `archived`. This is the contractual "what was sold."

## User Action 4 — Super-admin assigns a version to an institution

**Trigger:** Super-admin opens an institution's **License** panel, picks a plan, picks a specific **published version**, chooses billing cadence (`monthly` / `yearly`), and click assign **Assign**.
**Outcome:** `app.assign_plan_version_to_institution(...)` inserts an `institution_subscriptions` row pinning that exact `plan_version_id`, with `billing_status = 'trialing'` or `'past_due'` (awaiting payment) and `effective_from` set. The institution is **not yet entitled** to paid features until payment is confirmed (Action 5). The prior active subscription is end-dated (`effective_to = now()`), preserving full history.

## User Action 5 — Payment is confirmed → subscription activates

**Trigger:** The PSP webhook (or a super-admin manual mark-paid) calls `app.activate_subscription_on_payment(subscription_id, period_start, period_end, provider_ref)`.
**Outcome:** `billing_status` flips to `'active'`, `current_period_start` / `current_period_end` and `renewal_at` are set from the cadence, and `billing_providers` records the external IDs. Only now do the institution's effective entitlements reflect the assigned version. If payment never arrives, the subscription stays non-active and effective entitlements fall back to the platform defaults (free/blocked).

## User Action 6 — Teacher / student consumes the institution's effective features

**Trigger:** A teacher or student loads the app; the client calls `public.list_my_institution_feature_flags()`.
**Outcome:** The RPC resolves effective entitlements **only** from the frozen `plan_version_entitlements` of the institution's active subscription, layered with `institution_entitlement_overrides`, falling back to `feature_definitions.default_enabled`. The frontend **hides** (not merely disables) any feature whose effective boolean is false, and enforces integer caps (e.g. blocks creating the 51st teacher when `max_teachers = 50`).

---

## Initial State

1. `feature_definitions` is seeded with the existing 16 keys (`institution`, `student`, `teacher`, `classroom`, `course`, `game_studio`, `task`, `calendar`, `cloud_storage`, `note`, `chat`, `notification`, `max_teachers`, `max_students`, `max_classrooms`, `storage_quota_mb`).
2. `plan_catalog` contains at least the seeded `trial` plan (`billing_interval = 'none'`, price 0).
3. New tables `plan_versions` and `plan_version_entitlements` are empty.
4. New enum `plan_version_status = ('draft','published','archived')` exists.
5. A new institution created via `create_institution_with_initial_admin` is on `trial`; teachers/students see only default-enabled features.

---

## Sample Interaction

1. Super-admin defines `max_teachers` (integer) and confirms `game_studio` (boolean) exist in **Features**.
2. Super-admin creates plan `custom-akademie-nord` (yearly, €4,800/yr) and in the draft matrix sets `game_studio = true`, `max_teachers = 50`, `max_students = 600`, `storage_quota_mb = 204800`, `chat = true`.
3. Super-admin clicks **Publish version** with note "Initial Akademie Nord deal" → `plan_versions` gets `version_no = 1`, `status = 'published'`; 16 rows are frozen into `plan_version_entitlements`.
4. Super-admin opens **Akademie Nord → License**, selects plan `custom-akademie-nord`, version **1**, cadence **yearly**, and clicks **Assign** → `institution_subscriptions` row created, `billing_status = 'trialing'`, pinning `plan_version_id` of version 1.
5. The PSP confirms the yearly payment; webhook calls `app.activate_subscription_on_payment(...)` → `billing_status = 'active'`, period set to one year.
6. A teacher at Akademie Nord opens the app: `list_my_institution_feature_flags()` returns `game_studio = true (source: plan_version)`, `max_teachers = 50`; the **Game Studio** nav item appears and the Chat panel is visible.
7. Later the super-admin needs +20 teachers. Editing the draft and clicking **Publish version** creates `version_no = 2` (version 1 stays intact for audit). Re-assigning version 2 end-dates the version-1 subscription row (`effective_to = now()`) — full history preserved.

---

## Detailed Requirements

### Data model (Layer 2 — the immutable snapshot)

1. Create enum `plan_version_status AS ENUM ('draft','published','archived')` using the `DO $$ … duplicate_object` guard pattern used elsewhere.
2. Create `public.plan_versions`:
  - `id uuid PK default gen_random_uuid()`
  - `plan_id uuid NOT NULL REFERENCES public.plan_catalog(id) ON DELETE CASCADE`
  - `version_no integer NOT NULL`
  - `status plan_version_status NOT NULL DEFAULT 'draft'`
  - frozen commercial fields copied at publish: `name text NOT NULL`, `price_amount numeric(12,2)`, `currency text NOT NULL DEFAULT 'EUR'`, `billing_interval text NOT NULL` (`monthly | annual | none`), `seat_cap_default integer`, `storage_bytes_cap_default bigint`
  - `change_note text`
  - `created_at timestamptz NOT NULL DEFAULT now()`, `published_at timestamptz`, `archived_at timestamptz`
  - `CONSTRAINT uq_plan_versions_plan_version UNIQUE (plan_id, version_no)`
  - `COMMENT ON TABLE` documenting it as the immutable contractual snapshot.
3. Create `public.plan_version_entitlements` (frozen copy of the matrix, mirroring `plan_entitlements`'s typed columns):
  - `id uuid PK`, `plan_version_id uuid NOT NULL REFERENCES public.plan_versions(id) ON DELETE CASCADE`
  - `feature_id uuid NOT NULL REFERENCES public.feature_definitions(id) ON DELETE RESTRICT`
  - `feature_key text NOT NULL` (denormalized so the snapshot survives a later feature rename/delete)
  - `value_type entitlement_value_type NOT NULL`
  - `boolean_value boolean`, `integer_value integer`, `bigint_value bigint`, `text_value text`
  - `created_at timestamptz NOT NULL DEFAULT now()`
  - `CONSTRAINT uq_pve_version_feature UNIQUE (plan_version_id, feature_id)`
4. Add `plan_version_id uuid REFERENCES public.plan_versions(id) ON DELETE RESTRICT` to `public.institution_subscriptions` (Layer-3 binding). Keep legacy `plan_id` for back-compat; new flow populates both.
5. Indexes: `plan_versions(plan_id)`, partial `plan_versions(plan_id) WHERE status='published'`, `plan_version_entitlements(plan_version_id)`, `institution_subscriptions(plan_version_id)`, `institution_subscriptions(institution_id, effective_from DESC)`.

### Immutability enforcement

1. A `BEFORE UPDATE OR DELETE` trigger on `plan_versions` MUST raise an exception when the row's `status = 'published'` and any field other than `status`→`archived` / `archived_at` is changed. Published versions are append-only history.
2. `plan_version_entitlements` rows MUST be insert-only: a `BEFORE UPDATE OR DELETE` trigger raises unless the parent version is still `draft` (or via cascade when a draft version is discarded).
3. Publishing is the only way to create snapshot rows — no direct client INSERT into `plan_version_entitlements` (RLS denies it; only the SECURITY DEFINER RPC writes).

### RPCs (`app` schema, `SECURITY DEFINER`, `SET search_path = ''`)

1. `app.publish_plan_version(p_plan_id uuid, p_change_note text DEFAULT NULL) RETURNS uuid`:
  - super-admin only (`app.is_super_admin()`), else raise.
  - computes next `version_no = COALESCE(max,0)+1` for the plan.
  - inserts `plan_versions` (`status='published'`, `published_at=now()`, copies commercial fields from `plan_catalog` + the current draft matrix source).
  - copies the full current entitlement matrix into `plan_version_entitlements`, denormalizing `feature_key` and `value_type`.
  - writes `audit.events` (`event_type = 'plan_version.published'`).
2. `app.assign_plan_version_to_institution(p_institution_id uuid, p_plan_version_id uuid, p_billing_interval text, p_seats_cap int DEFAULT NULL, p_storage_bytes_cap bigint DEFAULT NULL) RETURNS uuid`:
  - super-admin only; target version MUST be `published`.
    - end-dates the current active subscription (`effective_to = now()`).
    - inserts a new `institution_subscriptions` row pinning `plan_version_id`, `billing_status = 'trialing'`, `effective_from = now()`, caps applied.
    - audit `event_type = 'subscription.assigned'`.
3. `app.activate_subscription_on_payment(p_subscription_id uuid, p_period_start timestamptz, p_period_end timestamptz, p_provider text DEFAULT NULL, p_external_subscription_id text DEFAULT NULL) RETURNS void`:
  - callable by super-admin or service role (PSP webhook).
    - sets `billing_status='active'`, `current_period_start/end`, `renewal_at = p_period_end`; upserts `billing_providers`.
    - audit `event_type = 'subscription.activated'`.
4. Update `public.list_my_institution_feature_flags()` so effective resolution reads the **active subscription's `plan_version_entitlements`** (joined via `plan_version_id`) instead of mutable `plan_entitlements`. Precedence: `override → plan_version → feature default`. The `active` subscription is the one with greatest `effective_from` where `billing_status = 'active'` (non-active ⇒ no paid entitlements). `source` returns `'override' | 'plan_version' | 'default'`.

### Activation / payment gating

1. Effective paid entitlements MUST be granted only when `billing_status = 'active'` (or `'grace'` within `grace_ends_at`). `trialing`, `past_due`, `suspended`, `expired`, `cancelled` ⇒ fall back to defaults for paid features; trial-included features still resolve from the trial plan version if one is pinned.
2. Cadence: `monthly` ⇒ `current_period_end = start + 1 month`; `yearly`/`annual` ⇒ `+ 1 year`. `none` ⇒ no period (internal/trial).

### RLS (per `principle_database.md`)

1. `ENABLE` + `FORCE ROW LEVEL SECURITY` on `plan_versions` and `plan_version_entitlements`.
2. Super-admin: `FOR ALL` using `app.is_super_admin()`.
3. Institution admins/members: `FOR SELECT` on `plan_versions` and `plan_version_entitlements` only for a version their institution currently subscribes to (mirror the existing `plan_entitlements_select_subscribed_institution` policy via `institution_subscriptions.plan_version_id`).
4. No `INSERT/UPDATE/DELETE` policy for non-super-admins — all writes go through the SECURITY DEFINER RPCs.

### Frontend feature-hiding contract (teacher / student)

1. The client calls `list_my_institution_feature_flags()` once per session and builds a `Record<feature_key, value>` map.
2. **Hide, don't disable**: nav items, routes, and panels for boolean features that resolve `false` MUST be absent from the DOM (no greyed-out teasers), to avoid advertising unsold features. Integer features enforce caps at the action boundary (create/invite buttons) with a clear "limit reached / upgrade" message.
3. A single `useFeatureFlags()` hook + `<FeatureGate feature="game_studio">` wrapper is the only sanctioned gate; never check plan codes directly in components (plan codes change; feature keys are stable).
4. Server-side enforcement is authoritative — RLS and RPCs already block unentitled writes; the frontend gate is UX only and MUST NOT be the sole guard.

### Audit & compliance

1. Add `AFTER INSERT/UPDATE/DELETE` audit-row triggers on `plan_versions`, `plan_version_entitlements`, and `institution_subscriptions`, writing `audit.events` with `visibility_level = 'super_admin'` (and `'institution_admin'` for subscription status changes).
2. Every state transition (`plan_version.published`, `subscription.assigned`, `subscription.activated`, `subscription.canceled`) MUST be reconstructable from `audit.events` for contractual/DSGVO accountability.

### Migration & teardown conventions

1. Split into the standard 7 files (`_01_types`, `_02_tables`, `_03_indexes_constraints`, `_04_functions_rpcs`, `_05_backfills_seed`, `_06_triggers`, `_07_rls_policies`), each tagged with the `HETZNER_TEARDOWN: KEEP_CORE | WQ-MINIMAL-CORE` header where commercially required.
2. Backfill: for each existing `plan_catalog` row with `plan_entitlements`, publish a `version_no = 1` snapshot and repoint live `institution_subscriptions.plan_version_id` to it, so no institution loses entitlements at cutover.

---

## Subtask 1 — Schema & enum migration

**Title:** `plan_versions` + `plan_version_entitlements` + `plan_version_status`
**Acceptance Criteria:** Tables, enum, indexes, FK to `institution_subscriptions.plan_version_id`, and all `COMMENT ON` documentation exist; `uq_plan_versions_plan_version` and `uq_pve_version_feature` enforced; migration is idempotent (`IF NOT EXISTS` / `duplicate_object` guards).

## Subtask 2 — Immutability triggers

**Title:** Freeze published versions
**Acceptance Criteria:** Updating/deleting a `published` `plan_versions` row (except `status→archived`) raises; updating/deleting any `plan_version_entitlements` row whose parent is not `draft` raises. Covered by tests.

## Subtask 3 — Publish RPC

**Title:** `app.publish_plan_version`
**Acceptance Criteria:** Super-admin-only; assigns monotonic `version_no`; copies the full matrix with denormalized `feature_key`/`value_type`; sets `published_at`; writes `plan_version.published` audit event; returns new version id.

## Subtask 4 — Assign + payment-gated activation RPCs

**Title:** `app.assign_plan_version_to_institution` + `app.activate_subscription_on_payment`
**Acceptance Criteria:** Assign pins `plan_version_id`, end-dates prior active sub, sets `trialing`; activation flips to `active` with correct period from cadence and upserts `billing_providers`; both write audit events; non-active subscriptions grant no paid entitlements.

## Subtask 5 — Effective-resolution RPC update

**Title:** `list_my_institution_feature_flags()` reads frozen snapshot
**Acceptance Criteria:** Resolves `override → plan_version → default`; only `active`/`grace` subscriptions contribute paid entitlements; `source` column reports the layer; existing callers unaffected (same return shape, `plan` source renamed to `plan_version`).

## Subtask 6 — RLS policies

**Title:** Tenant-scoped read, RPC-only write
**Acceptance Criteria:** `FORCE RLS` on both new tables; super-admin full access; subscribed institutions read their pinned version rows; no non-super-admin write policy; verified with an RLS test (member cannot read another institution's version).

## Subtask 7 — Frontend feature-gate

**Title:** `useFeatureFlags()` + `<FeatureGate>` + cap enforcement
**Acceptance Criteria:** Boolean-false features are absent from the DOM (hidden, not disabled); integer caps block the boundary action with an upgrade message; no component reads plan codes directly; gate is UX-only with server-side enforcement intact.

## Subtask 8 — Backfill migration

**Title:** Snapshot existing plans, repoint live subscriptions
**Acceptance Criteria:** Each existing plan with entitlements gets a `version_no = 1` published snapshot; every active `institution_subscriptions` row is repointed to its snapshot; a verification query shows effective flags before == after for all institutions.

---

## Open Questions

1. **Custom vs. catalog plans:** Should custom one-institution plans live in the same `plan_catalog` (flagged, e.g. `is_active = false`, hidden from generic listings) or get an explicit `is_custom boolean` / `target_institution_id` column? Recommendation: add `is_custom boolean DEFAULT false` to `plan_catalog` so bespoke tiers don't pollute the public catalog.
2. **Mid-term version change:** When re-assigning a new version mid-period, is it immediate or at `current_period_end`? Recommend honoring `cancel_at_period_end` semantics: immediate for upgrades, period-end for downgrades.
3. **Override precedence vs. snapshot:** Confirm `institution_entitlement_overrides` still wins over the frozen version (it does today). Overrides remain the escape hatch for temporary promos via `starts_at/ends_at`.

