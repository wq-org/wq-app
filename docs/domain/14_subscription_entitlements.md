# Subscription and Entitlements

Role: commercial control layer — plans, feature access, quotas, and billing state.
Scope: platform-level (plan catalog, feature definitions); per-institution (subscription, overrides, quotas).

## Mission and context

Subscriptions define what each institution can access and how much. A plan sets defaults — seats, storage, and which features are enabled. Institution-specific overrides allow super admin to grant custom terms without changing the plan for everyone. The effective entitlement for any feature is resolved in layers: institution override first, then plan default, then the global feature default. Quota enforcement is automatic — storage usage is trigger-maintained and checked at upload time. All plan and entitlement changes are auditable.

**Scope:** super admin manages the commercial model globally; institution admin reads their own subscription
**Accountability:** plan catalog integrity, entitlement resolution accuracy, quota enforcement, billing state lifecycle

```mermaid
flowchart TD
  SA[Super Admin]
  SA --> PC[plan_catalog]
  SA --> FD[feature_definitions]
  SA --> PE[plan_entitlements plan × feature]
  SA --> IS[institution_subscriptions]
  SA --> IEO[institution_entitlement_overrides]

  IS --> BS[billing_status trialing|active|past_due|suspended|canceled]
  BS --> ACCESS[App layer enforces access behavior]

  RESOLVE[Effective entitlement resolution]
  IEO --> RESOLVE
  PE --> RESOLVE
  FD --> RESOLVE
  RESOLVE --> APP[Feature gating in product]

  CF[cloud_files INSERT] --> TRG[Trigger → institution_quotas_usage.storage_used_bytes]
  RPC[register_cloud_file_record] --> QC[Quota check before file creation]
```

---

## Feature tree

### Plan management (super admin only)

**Create plan**

- Table: `plan_catalog`
- Fields: code (unique text key), name, seat_cap_default, storage_bytes_cap_default, price_amount, currency, billing_interval, is_active
- RLS: `plan_catalog_super_admin` — full CRUD for super admin only

**Deactivate plan**

- Update: `plan_catalog.is_active = false`
- Effect: plan hidden from new subscriptions; existing subscriptions are unaffected

---

### Feature catalog (super admin writes; all authenticated users read)

**Define feature**

- Table: `feature_definitions`
- Fields: key (unique text), name, description, default_enabled, category, value_type (boolean | integer | bigint | text)
- RLS: `feature_defs_super_admin` (CRUD); `feature_defs_authenticated_read` (SELECT for any logged-in user)
- Super admin UI: catalog rows are managed in-app (Feature definitions); `key` is immutable after insert and globally unique. Hard delete is allowed only when no `plan_entitlements` or `institution_entitlement_overrides` row references the feature.

**Set plan default for feature**

- Table: `plan_entitlements`
- Input: plan_id, feature_id, boolean_value | integer_value | bigint_value | text_value (one typed column per row)
- Unique: (plan_id, feature_id)
- Every change audited via `audit.log_event()`

---

### Institution subscription management (super admin full CRUD; institution admin read)

**Assign plan to institution**

- Table: `institution_subscriptions`
- Fields: institution_id, plan_id, effective_from, effective_to, billing_status (active | suspended | trialing | past_due | canceled), seats_cap, storage_bytes_cap, renewal_at, grace_ends_at, trial_ends_at, cancel_at_period_end
- RLS: `inst_subs_super_admin` (full CRUD); `inst_subs_institution_admin` (read)

**Change billing status**

- Update: `institution_subscriptions.billing_status`
- Grace period tracked via `grace_ends_at` timestamp (not a separate status value)
- Expired = past `effective_to` with no renewal (no separate expired status)

**Link external billing provider**

- Table: `billing_providers`
- Fields: institution_id, provider (e.g. stripe), external_customer_id, external_subscription_id, external_price_id
- Unique: (institution_id, provider)
- RLS: `billing_providers_super_admin` (full CRUD); `billing_providers_institution_admin_select` (read)

---

### Institution-specific overrides (super admin full CRUD; active members read)

**Create entitlement override**

- Table: `institution_entitlement_overrides`
- Input: institution_id, feature_id, typed value (boolean_value | integer_value | bigint_value | text_value), reason, starts_at (optional), ends_at (optional), created_by
- Unique: (institution_id, feature_id)
- RLS: `inst_entitlement_overrides_super_admin` (CRUD); `inst_entitlement_overrides_member_read` (SELECT for any active institution member — not admin-gated)

**Effective entitlement resolution order (app layer)**

1. `institution_entitlement_overrides` (if row exists and active by date range)
2. `plan_entitlements` for the institution's current `plan_id`
3. `feature_definitions.default_enabled`

---

### Quota enforcement (automatic via triggers)

**Track seat usage**

- Table: `institution_quotas_usage` (seats_used, storage_used_bytes)
- seats_used: updated by app layer on institution_memberships changes

**Track storage usage**

- Trigger: `trg_cloud_files_quota_usage` — AFTER INSERT OR UPDATE OF size_bytes, status OR DELETE on `cloud_files`
- Calls: `public.apply_cloud_file_storage_quota_delta()` (SECURITY DEFINER)
- Only `status = active` files count toward quota; status change away from active subtracts

**Check quota before upload**

- RPC: `register_cloud_file_record(...)` checks `storage_used_bytes + new_file_size ≤ storage_bytes_cap` before creating file row

---

### Billing history (institution admin read)

**View invoices**

- Table: `institution_invoice_records`
- Fields: external_id, amount_cents, currency, issued_at, due_at, paid_at, status (pending | paid | overdue | cancelled | refunded)
- RLS: institution_admin reads own institution; super_admin full access

---

## Schema visualization

```text
[Platform level — super admin only]
│
├── plan_catalog
│   ├── {code: basic,      name: "Basic",      price_amount: 999,  currency: EUR, billing_interval: monthly, is_active: true}
│   └── {code: plus,       name: "Plus",       price_amount: 1499, currency: EUR, billing_interval: monthly, is_active: true}
│       plan_entitlements (Plus plan)
│       ├── game_studio_enabled    → boolean_value: true
│       ├── chat_enabled           → boolean_value: true
│       ├── reward_system_enabled  → boolean_value: true
│       ├── max_students           → integer_value: 500
│       └── storage_bytes_cap      → bigint_value: 10_737_418_240  (10 GB)
│       [every row change → audit.log_event()]
│
└── feature_definitions  (any authenticated user can SELECT)
    ├── {key: game_studio_enabled,   value_type: boolean, default_enabled: false}
    ├── {key: chat_enabled,          value_type: boolean, default_enabled: false}
    ├── {key: reward_system_enabled, value_type: boolean, default_enabled: false}
    ├── {key: max_students,          value_type: integer, default_enabled: true}
    └── {key: storage_bytes_cap,     value_type: bigint,  default_enabled: true}

[Schule für Farbe und Gestaltung — per institution]
│
└── institution_subscriptions
    │   plan_id → Plus
    │   billing_status: active
    │   seats_cap: 200   storage_bytes_cap: 10_737_418_240
    │   effective_from: 2025-09-01   renewal_at: 2026-09-01
    │   grace_ends_at: null   trial_ends_at: null
    │
    ├── institution_entitlement_overrides
    │   └── feature: max_students  integer_value: 350
    │       reason: "School expanded enrollment for 2025–26"
    │       starts_at: 2025-09-01   ends_at: 2026-08-31   created_by: super_admin
    │       [readable by all active members — not admin-gated]
    │
    ├── billing_providers
    │   └── provider: stripe
    │       external_customer_id: cus_abc123   external_subscription_id: sub_xyz789
    │
    ├── institution_quotas_usage
    │   └── seats_used: 87   storage_used_bytes: 1_420_800
    │       [seats: updated by app layer; storage: trigger-maintained]
    │
    └── institution_invoice_records
        ├── 2026-03-01  amount: 1499 EUR  status: paid    paid_at: 2026-03-03
        └── 2026-04-01  amount: 1499 EUR  status: pending paid_at: null

[Effective entitlement resolution for max_students]
  1. institution_entitlement_overrides → 350   ← active, wins
  2. plan_entitlements (Plus)          → 500   (would apply if no override)
  3. feature_definitions.default       → true  (fallback)
```

### CRUD surface by role

| Operation                                     | Super Admin | Institution Admin | Teacher / Student |
| --------------------------------------------- | ----------- | ----------------- | ----------------- |
| plan_catalog — full CRUD                      | yes         | —                 | —                 |
| feature_definitions — full CRUD               | yes         | —                 | —                 |
| feature_definitions — read                    | yes         | yes               | yes               |
| plan_entitlements — full CRUD                 | yes         | —                 | —                 |
| institution_subscriptions — full CRUD         | yes         | read-only         | —                 |
| institution_entitlement_overrides — full CRUD | yes         | read-only         | read-only         |
| billing_providers — full CRUD                 | yes         | read-only         | —                 |
| institution_quotas_usage — read               | yes         | yes               | —                 |
| institution_invoice_records — read            | yes         | yes               | —                 |

### Billing state → access behavior (app layer enforcement)

| Status    | Write access        | Premium features          | Data preserved         | Billing UI     |
| --------- | ------------------- | ------------------------- | ---------------------- | -------------- |
| trialing  | full                | yes (trial policy)        | yes                    | yes            |
| active    | full                | yes                       | yes                    | yes            |
| past_due  | full                | yes (until grace_ends_at) | yes                    | warning banner |
| suspended | read-only / blocked | no                        | yes                    | yes            |
| canceled  | blocked             | no                        | yes (retention policy) | reactivate CTA |

---

## Constraints

1. **Entitlement resolution is layered** — The app must never rely on a single `plan_name` check. Effective access is always resolved as: override → plan default → feature default. Hardcoding plan names in product code is not permitted.
2. **Plan changes are audited** — Every write to `plan_entitlements` must call `audit.log_event()`. Super admin cannot modify plan entitlements without producing an audit record.
3. **Quota is a hard cap** — `register_cloud_file_record` rejects uploads if `storage_used_bytes + size_bytes > storage_bytes_cap`. Only super admin can raise the cap. Institution admin cannot bypass it.
4. **Override uniqueness is per institution × feature** — Only one override row exists per (institution_id, feature_id). To change an override, update the existing row; do not insert a second.
5. **Grace is a timestamp, not a status** — `grace_ends_at` tracks the grace window within `past_due` status. There is no separate `grace` billing_status enum value. The app layer compares `now()` to `grace_ends_at` to determine access behavior.
6. **Data is always preserved** — No billing status causes a hard purge. `status = canceled` or `suspended` preserves all institution data. Hard purge follows only a completed GDPR erasure or super admin DBA operation.

## Open product decisions

1. Are plans priced per institution, per teacher, per classroom, or hybrid?
2. Is the 9.99 € tier monthly only or does annual billing apply?
3. Are student seats unlimited or capped on any plan?
4. Is Game Studio fully locked behind Plus or is there a limited Basic tier?
5. Is Chat included in Basic or Plus-only?
6. Do schools and clinics need separate plan families?
