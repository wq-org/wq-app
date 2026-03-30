---
name: CourseDeliveryRefactor
overview: Audit the current course/lesson delivery model in `supabase/migrations` and draft a migration plan to introduce `course_versions` + `course_deliveries`, then move `lesson_progress` and `learning_events` to delivery-scoped truth (as described in your design note), updating helper functions, RLS policies, and backfills accordingly.
todos:
  - id: audit-existing-course-delivery
    content: Audit current `classroom_course_links`-based delivery + `lesson_progress`/`learning_events` policies and helpers (tables, functions, RLS). Identify every migration that joins against `classroom_course_links`.
    status: completed
  - id: design-course-versions-snapshots
    content: Draft the concrete Postgres schema for `course_versions` and versioned snapshot tables for topics/lessons (immutable snapshot depth) plus any supporting constraints/indexes.
    status: completed
  - id: add-course-deliveries
    content: Add `course_deliveries` table and backfill from existing `classroom_course_links` published rows; define mapping from delivery → course_version snapshot.
    status: completed
  - id: migrate-progress-events-to-delivery
    content: Add `course_delivery_id` to `lesson_progress` and `learning_events`, update uniqueness/indexes, and update triggers if needed.
    status: completed
  - id: backfill-progress-events
    content: Backfill lesson_progress and learning_events into delivery scope (duplicate or map depending on entitlements), and ensure new uniqueness constraints remain correct.
    status: completed
  - id: update-helpers-policies
    content: Add delivery-scoped helper functions and update RLS on `lesson_progress`/`learning_events` to prove both entitlement and lesson membership via the delivery’s course version.
    status: completed
  - id: update-attendance-dependencies
    content: Update attendance recurrence + topic gates triggers/RPCs/policies to use `course_deliveries` rather than `classroom_course_links`.
    status: completed
  - id: transition-and-docs
    content: Update docs (`docs/architecture/role_flow_diagrams.md`) to reflect delivery container change, and add/adjust any domain documentation expected by `docs/architecture/db_design_principles.md`.
    status: completed
  - id: verify
    content: Run `npm run lint:sql` and then validate via local Supabase apply/reset and end-to-end policy checks for teacher/institution/student flows.
    status: completed
isProject: false
---

## 1) Audit what exists today

- Inspect current delivery + progress model:
  - `[supabase/migrations/20260323000002_classroom_course_links_lesson_progress_02_tables.sql](supabase/migrations/20260323000002_classroom_course_links_lesson_progress_02_tables.sql)` for `classroom_course_links`, `lesson_progress`, `learning_events`.
  - `[supabase/migrations/20260323000002_classroom_course_links_lesson_progress_04_functions_rpcs.sql](supabase/migrations/20260323000002_classroom_course_links_lesson_progress_04_functions_rpcs.sql)` for `app.student_can_access_course()` and `app.student_can_access_lesson()` (currently rooted in `classroom_course_links`).
  - `[supabase/migrations/20260323000002_classroom_course_links_lesson_progress_07_rls_policies.sql](supabase/migrations/20260323000002_classroom_course_links_lesson_progress_07_rls_policies.sql)` for RLS on `lesson_progress` and `learning_events`.
- Confirm there is no `course_versions` / `course_deliveries` yet by scanning `supabase/migrations/`.
- Identify all downstream dependencies that reference `classroom_course_links` (attendance triggers/RPCs, topic gates, etc.).
  - `[supabase/migrations/20260326000004_attendance_topic_gates_04_functions_rpcs.sql](supabase/migrations/20260326000004_attendance_topic_gates_04_functions_rpcs.sql)` and `_06_triggers.sql`
  - `[supabase/migrations/20260326000005_attendance_recurrence_03_functions_rpcs.sql](supabase/migrations/20260326000005_attendance_recurrence_03_functions_rpcs.sql)` and `_05_triggers.sql`
  - Any other policies/functions that call `app.student_can_access_course()`.

## 2) Define the target schema (aligned with `docs/architecture/db_design_principles.md`)

- Create `course_versions` (draft/published immutable snapshots) and `course_deliveries` (operational classroom rollout container).
- Snapshot depth decision (from your answers): implement true immutable snapshots for content.
  - Add versioned snapshot tables for topics/lessons (so published content cannot change under the same delivery).
  - Keep stable `lesson_progress.lesson_id` and `learning_events.lesson_id` columns for compatibility/perf, but ensure delivery-scoped policies can prove lesson membership via the snapshot mapping.

## 3) Migrations: introduce delivery-scoped storage

- Add `course_delivery_id uuid not null` to:
  - `public.lesson_progress`
  - `public.learning_events`
- Update constraints/indexes:
  - Replace existing uniqueness on `lesson_progress(user_id, lesson_id)` with `lesson_progress(user_id, lesson_id, course_delivery_id)`.
  - Add indexes that match the new RLS predicates (typical patterns: `(user_id, course_delivery_id)`, `(course_delivery_id, lesson_id, event_type)`).

## 4) Backfill strategy (replace approach)

- Backfill `course_deliveries` from existing `classroom_course_links`:
  - Create one `course_deliveries` per published `classroom_course_links` row.
  - Bootstrap `course_versions` for existing `courses` so each delivery can point to a version (e.g., legacy → version 1 snapshot).
  - Generate snapshot topic/lesson rows as the published baseline for those versions.
- Backfill `lesson_progress` and `learning_events`:
  - Duplicate or map existing rows into delivery scope where the student is entitled for the corresponding delivery.
  - Ensure the new uniqueness constraint doesn’t drop user data unexpectedly (use duplication when a student can access the same lesson in multiple deliveries).

## 5) Update helper functions and policies

- Introduce delivery-scoped access helpers:
  - `app.student_can_access_course_delivery(p_course_delivery_id)`
  - `app.student_can_access_course_version_lesson(p_course_delivery_id, p_lesson_id)` (or equivalent join logic through snapshot mapping)
- Update:
  - `app.student_can_access_course(p_course_id)` to rely on `course_deliveries` (published deliveries in assigned classrooms) instead of `classroom_course_links`.
  - `app.student_can_access_lesson(p_lesson_id)` to remain correct under versioned snapshots (still rooted in delivery entitlements).
- RLS updates:
  - For `lesson_progress`, enforce that a row’s `course_delivery_id` is entitled and that `lesson_id` belongs to the delivery’s course version.
  - For `learning_events` insert/select, enforce the same delivery ownership and lesson membership.

## 6) Update dependencies that still read `classroom_course_links`

- Attendance recurrence + topic gates triggers/RPCs:
  - Replace joins against `classroom_course_links` with equivalent joins against `course_deliveries` (or a compatibility view).
- Ensure any other schema objects referencing delivery context are updated (cloud file scope, announcement gates, etc.) via updated helper functions.

## 7) Transition + cleanup

- After app queries/policies use delivery-scoped truth:
  - Deprecate `classroom_course_links` usage (keep table for history/bridge if needed, but stop relying on it for entitlements).
  - Optionally keep compatibility helper functions temporarily.
- Update documentation:
  - Extend `docs/architecture/role_flow_diagrams.md` sections to reference `course_deliveries` as the delivery container.

## 8) Verification

- Run naming checks: `npm run lint:sql` (ensures new constraints/triggers/policies follow naming conventions).
- Run SQLFluff formatting manually as an opt-in: `npm run format:sql` after migrations are done.
- Run a local Supabase reset and validate flows:
  - teacher publishes course → delivery created
  - student accesses topics/lessons → insert progress/events
  - institution_admin analytics read by delivery

