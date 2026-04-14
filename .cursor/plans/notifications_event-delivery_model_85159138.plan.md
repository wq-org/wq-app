---
name: Notifications event-delivery model
overview: Rewrite the existing notifications migration bundle (same _01…_07 split) in place at a new timestamp appended after course delivery, chat, and cloud—so FKs to course_deliveries and conversations are valid. Intentionally supersedes 20260323000006_notifications_* in repo history (accepted migration-identity break for unapplied / greenfield DBs).
todos:
  - id: renumber-and-rewrite-bundle
    content: Remove 20260323000006_notifications_*; add 20260329000024–030_notifications_* (or next free tail) with full event/delivery/preferences schema + Requires headers
    status: completed
  - id: backfill-in-05
    content: If any seed/backfill needed for empty DBs, use _05_backfills; no legacy public.notifications rows in greenfield
    status: completed
  - id: rls-rpc-07-04
    content: RLS on events/deliveries/preferences; SECURITY DEFINER RPC or service_role pattern for fan-out inserts (_07, _04)
    status: completed
  - id: prefs-scopes-indexes-03
    content: Partial unique indexes for scoped notification_preferences (_03); dedupe partial unique on events
    status: completed
  - id: docs-update
    content: 12_notification, 15_platform_roles_schema_map, role_flow_diagrams—new migration IDs and event/delivery model
    status: completed
isProject: false
---

# Notifications: rewrite migration bundle (event / delivery / context)

## Intent (read this first)

- **Rewrite** the notifications domain **inside the existing migration layout**: same `_notifications_01_types` … `_07_rls_policies` split, not a separate ad-hoc `20260330_*` one-off domain.
- **Do not** keep an obsolete `20260323000006_notifications_*` chain alongside a new timestamp; **retire** the old prefix and **append** the rewritten suite **after** everything that the new schema references.
- **Migration-history rule break is intentional**: you accept replacing/removing `20260323000006_notifications_*` in Git even though general guidance says “never edit applied migrations.” This is only appropriate for **environments that have not applied** the old files (or you will repair `supabase_migrations` / reset).

## Why the timestamp must move

Today `[20260323000006_notifications_02_tables.sql](supabase/migrations/20260323000006_notifications_02_tables.sql)` runs **before** `[20260329000002_course_delivery_02_tables.sql](supabase/migrations/20260329000002_course_delivery_02_tables.sql)` and **before** chat. A robust model needs nullable FKs such as:

- `course_delivery_id` → `public.course_deliveries`
- optional `conversation_id` → `public.conversations`

Those tables **do not exist** at `20260323…` apply order. **Renumbering** the whole notifications suite to the **tail of the repo** fixes ordering without deferred FK tricks.

**Suggested new prefix** (after current last file `20260329000023_storage_cloud_objects_rls_01_policies.sql`):


| Part         | New filename (example)                                    |
| ------------ | --------------------------------------------------------- |
| 01 types     | `20260329000024_notifications_01_types.sql`               |
| 02 tables    | `20260329000025_notifications_02_tables.sql`              |
| 03 indexes   | `20260329000026_notifications_03_indexes_constraints.sql` |
| 04 functions | `20260329000027_notifications_04_functions_rpcs.sql`      |
| 05 backfills | `20260329000028_notifications_05_backfills_seed.sql`      |
| 06 triggers  | `20260329000029_notifications_06_triggers.sql`            |
| 07 RLS       | `20260329000030_notifications_07_rls_policies.sql`        |


Adjust the numeric block if another migration lands first; rule: **seven consecutive files**, sorted **after** `…00023`.

## Prerequisites (Requires: headers)

Each file’s header should list the **immediate** predecessor in the bundle plus **domain** dependencies, for example:

- **01**: `20260321000002_institution_admin` (all parts).
- **02**: 01 + `20260329000002_course_delivery_02_tables` (for `course_deliveries`) + `20260329000010_chat_02_tables` (if `conversation_id` FK) + `20260323000004_tasks_notes_02_tables` (if `task_id`) + `20260323000003_game_runtime_02_tables` (if `game_session_id`). Trim if you omit a FK in v1.
- **03–07**: previous part in the `…24…30` chain.

## Target schema (what the rewrite implements)

Same conceptual model as before; **replace** `public.notifications` (single user row) with:

1. `**notification_events`** — canonical event; `institution_id`, `category` (keep five-bucket CHECK or enum), finer `event_type`, optional `actor_user_id`, `dedupe_key`, `title`, `body`, `link_payload` (UI routing only), nullable `classroom_id`, `course_delivery_id`, `task_id`, `game_session_id`, `conversation_id`, `created_at`.
2. `**notification_deliveries`** — per user × channel (`in_app` first); `read_at`, `dismissed_at`, `failed_at`, `delivered_at`; FK to event.
3. `**notification_preferences`** — evolve with nullable scope columns + **partial unique indexes** (institution-only row vs classroom override vs delivery override) in **03**.

**Optional separate `notification_contexts`**: skip; keep context columns on **events** (like chat’s inlined context).

**Dedupe**: partial unique on `(institution_id, dedupe_key)` WHERE `dedupe_key IS NOT NULL`.

**No `task_delivery_id` in v1** unless you add a `task_deliveries` table; use `task_id` + classroom/delivery context as needed.

## Bundle contents by part

- **01_types**: `notification_delivery_channel`, optional `notification_event_type` enum, or keep `event_type` as constrained `text`.
- **02_tables**: `CREATE TABLE` for events + deliveries; `CREATE TABLE` or `ALTER` for expanded `notification_preferences` (if you drop old tables, create preferences fresh here).
- **03_indexes_constraints**: inbox indexes, dedupe partial unique, preference partial uniques, analytics indexes on events.
- **04_functions_rpcs**: `app.`* helpers for preference resolution; `SECURITY DEFINER` RPC to create event + deliveries (validate tenant + membership).
- **05_backfills_seed**: empty or minimal for greenfield; if you ever need data migration from legacy `notifications`, it lives here (not a second migration suite).
- **06_triggers**: `updated_at` on preferences / any mutable tables.
- **07_rls_policies**: mirror current super_admin / institution_admin / user-own patterns on **deliveries**; tighten **events** insert/update to service/RPC only.

## What to delete from the repo

- All `20260323000006_notifications_*.sql` files after the new bundle is added (or replace in one PR: delete old, add `…24…30`).

## Documentation

- `[docs/domain/12_notification.md](docs/domain/12_notification.md)`: event vs delivery, fix `data` → `link_payload`, preference precedence.
- `[docs/domain/15_platform_roles_schema_map.md](docs/domain/15_platform_roles_schema_map.md)` and `[docs/architecture/role_flow_diagrams.md](docs/architecture/role_flow_diagrams.md)`: replace `20260323000006_notifications`_* with the new `20260329000024`–`030` (or final) names.

## Verify

- `npm run lint:sql`
- Fresh `supabase db reset` (or equivalent) applies full chain without missing-relation errors.

## Risks (acknowledged)

- **Renaming migration files** breaks Supabase history for any DB that already ran `20260323000006_notifications`_*; you are explicitly choosing rewrite + renumber over additive migrations.
- Fan-out: many `notification_deliveries` per event; index and RPC design matter at scale.

