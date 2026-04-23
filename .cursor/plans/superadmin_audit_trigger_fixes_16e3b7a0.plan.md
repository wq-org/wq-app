---
name: Superadmin Audit Trigger Fixes
overview: Fix the tasks audit trigger to use the schema-safe audit API and add missing audit coverage for notifications and rewards tables using the same superadmin/domain trigger pattern already used by game runtime and attendance.
todos:
  - id: fix-tasks-audit-function
    content: Refactor tasks audit function to use audit.log_event(...) with schema-safe payload/metadata
    status: completed
  - id: add-notifications-audit
    content: Add notification audit trigger function(s) and wire triggers in notifications domain migration
    status: completed
  - id: add-rewards-audit
    content: Add rewards audit trigger function(s) and wire triggers in rewards domain migration
    status: completed
  - id: verify-sql-patterns
    content: Validate naming/idempotency consistency and ensure no direct incompatible inserts into audit.events remain
    status: completed
isProject: false
---

# Superadmin audit fixes for tasks, notifications, rewards

## Scope

Implement three related audit improvements under `supabase/migrations`:

- Fix the existing tasks audit trigger function that writes incompatible columns to `audit.events`.
- Add missing audit trigger functions for notifications and rewards domains.
- Wire domain table triggers to those functions in each domain `*_06_triggers.sql` migration.

## Why this is needed

- Current tasks function `audit.log_task_state_change()` directly inserts old column names (`actor_id`, `action`, `entity_type`, `entity_id`) that do not match current `audit.events` (`actor_user_id`, `event_type`, `subject_type`, `subject_id`).
- Existing schema-safe pattern is to call `audit.log_event(...)`, already established in superadmin functions/triggers and reused by attendance/game runtime.

## Files to update

- Fix tasks audit function in `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260323000004_tasks_notes_04_functions_rpcs.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260323000004_tasks_notes_04_functions_rpcs.sql)`
- Add/extend shared audit trigger functions in `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260321000001_super_admin_06_triggers.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260321000001_super_admin_06_triggers.sql)`
- Add notification table audit triggers in `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260323000006_notifications_06_triggers.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260323000006_notifications_06_triggers.sql)`
- Add rewards table audit triggers in `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260323000007_rewards_mvp_06_triggers.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260323000007_rewards_mvp_06_triggers.sql)`

## Implementation approach

- Update `audit.log_task_state_change()` to call `PERFORM audit.log_event(...)` with stable event naming and payload metadata, instead of direct `INSERT INTO audit.events`.
- Add schema-safe trigger functions for notifications/rewards that:
  - branch on `TG_OP` (`INSERT`, `UPDATE`, `DELETE`),
  - call `audit.log_event(...)` with domain-specific `event_type`/`subject_type`,
  - use `COALESCE(NEW.institution_id, OLD.institution_id)` style institution resolution,
  - include before/after delta details in payload for admin-sensitive changes (especially rewards points/settings).
- In each domain trigger migration, create `AFTER INSERT OR UPDATE OR DELETE` triggers that execute the shared audit functions.
- Keep naming consistent with current convention (`audit.log_*_audit`, `trg_*_audit_*`) and include `DROP TRIGGER IF EXISTS` / `DROP FUNCTION IF EXISTS` safety pattern already used in this repo.

## Validation

- Confirm all new/updated functions compile as SQL migration text.
- Verify no remaining direct writes to `audit.events` from these domain triggers that bypass `audit.log_event(...)`.
- Check for duplicate trigger names and idempotent rerun behavior in updated trigger migration files.

