---
name: Institution Offering Alignment
overview: Adapt the long-term institution/offering architecture to the current branch by preserving shipped delivery foundations, eliminating duplicate enrollment truth incrementally, and introducing a safe migration path for stable identity vs time-bound offerings.
todos:
  - id: map-canonical-access
    content: Document and lock canonical access path to classroom_members + course_deliveries across migrations and docs.
    status: completed
  - id: add-drift-detectors
    content: Add read-only drift detector SQL artifacts for course_enrollments/classroom_course_links divergence.
    status: completed
  - id: freeze-legacy-writes
    content: Plan and implement write freeze for course_enrollments and classroom_course_links while preserving reads.
    status: completed
  - id: add-offering-layer
    content: Design additive programme/cohort/class_group offering tables and classroom binding migration.
    status: completed
  - id: separate-scope-vs-delivery
    content: Define reporting helpers that join authorization scopes and actual delivery assignments.
    status: completed
  - id: retire-legacy-surfaces
    content: Phase out legacy enrollment/link operational usage after parity and drift targets are met.
    status: completed
isProject: false
---

# Institution/Offering Adaptation Plan

## Current-state read (what to keep)

- Keep the current canonical delivery foundation already in place: `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260329000002_course_delivery_02_tables.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260329000002_course_delivery_02_tables.sql)`, `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260329000006_course_delivery_06_functions_rpcs.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260329000006_course_delivery_06_functions_rpcs.sql)`, `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260329000007_course_delivery_07_rls_policies.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260329000007_course_delivery_07_rls_policies.sql)`.
- Preserve institution hierarchy and classroom core in `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260321000002_institution_admin_02_tables.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260321000002_institution_admin_02_tables.sql)` and role/RLS behavior in `[/Users/willfryd/Documents/wq-health/supabase/migrations/20260321000002_institution_admin_07_rls_policies.sql](/Users/willfryd/Documents/wq-health/supabase/migrations/20260321000002_institution_admin_07_rls_policies.sql)`.
- Treat docs as target intent constraints: `[/Users/willfryd/Documents/wq-health/docs/domain/02_institution.md](/Users/willfryd/Documents/wq-health/docs/domain/02_institution.md)`, `[/Users/willfryd/Documents/wq-health/docs/domain/05_classroom.md](/Users/willfryd/Documents/wq-health/docs/domain/05_classroom.md)`, `[/Users/willfryd/Documents/wq-health/docs/domain/07_course.md](/Users/willfryd/Documents/wq-health/docs/domain/07_course.md)`, `[/Users/willfryd/Documents/wq-health/docs/domain/15_platform_roles_schema_map.md](/Users/willfryd/Documents/wq-health/docs/domain/15_platform_roles_schema_map.md)`.

## Target adaptation (pre-apply history rewrite allowed)

- Since this migration chain has not been applied yet (except files excluded by `.sqlfluffignore`), refactoring existing migrations in place is allowed.
- Prefer a clean, coherent final migration history over additive compatibility layers while the database is still pre-apply.
- Define one canonical student course-access truth as `classroom_members + course_deliveries`.
- Keep `course_enrollments` and `classroom_course_links` as compatibility surfaces during transition, then reduce to read-only historical use.

## Phased migration strategy

### Phase 0 — Rewrite baseline and policy guardrails

- Add read-only reconciliation SQL views/functions to detect divergence between:
  - `course_enrollments` vs `course_deliveries + classroom_members`
  - `classroom_course_links` vs `course_deliveries`
- Update existing migration files directly where needed (tables/helpers/RLS/docs comments) instead of only appending new migrations.
- Document canonical path in domain docs + schema map so app and SQL policy assumptions match.

### Phase 1 — Freeze duplicate-write paths

- Restrict new app writes to `course_enrollments` and legacy `classroom_course_links` paths (keep reads).
- If needed, add DB-level protections (trigger or RLS narrowing) that allow only service/backfill-maintenance writes to legacy tables.
- Keep existing delivery-based helper functions as the required access gate.

### Phase 2 — Stable identity vs offering layer for institution tree

- Introduce offering tables that preserve stable identities from the hierarchy (in-place in foundational migrations if cleaner):
  - `programme_offerings`, `cohort_offerings`, `class_group_offerings` (linked to year/term and anchored to existing stable entities).
- Bind operational classrooms to offering rows (nullable FK first, then enforce once backfilled in the same rewrite chain).
- Maintain admin/reporting compatibility by joining stable hierarchy + offering layer explicitly.

### Phase 3 — Staff scope and delivery assignment separation

- Keep `institution_staff_scopes` as authorization boundary only.
- Add/report delivery-assignment facts using classroom/course-delivery membership and ownership.
- Provide explicit reporting helpers that combine:
  - structural allowed area (`institution_staff_scopes`)
  - actual delivered activity (`classroom_members`, `course_deliveries`, progress/events).

### Phase 4 — Canonical enrollment completion + legacy retirement

- Move all student access analytics and policy checks to delivery-driven sources only.
- Convert `course_enrollments` to historical/optional exception mode (or archive table) once consumers are migrated.
- Lock down or deprecate active `classroom_course_links` usage after all write/read dependencies are removed.

## Concrete implementation order (pre-apply optimized)

1. Rewrite foundational migrations for target model (hierarchy/offering/access), keeping file sequence coherent.
2. Add Phase 0 drift SQL artifacts and docs updates.
3. Apply Phase 1 legacy-write freeze (app + optional DB guardrails).
4. Finalize offering-aware reporting/helpers and remove duplicate-truth paths.
5. Keep only necessary historical compatibility surfaces.

## Validation gates per phase

- SQL naming/lint passes (`npm run lint:sql`).
- No RLS regression for student/teacher/institution_admin access paths.
- Drift report trends toward zero before each deprecation step.
- Docs (`02_institution`, `05_classroom`, `07_course`, `15_platform_roles_schema_map`) updated in lockstep with migration phase rollout.


Completed exactly as requested: consolidated the `20260331000001_*` SQL into existing migration suites, then removed the temporary files.

What I changed, by suite:

- `*_02_tables`
  - Added offering-layer tables and classroom binding to `supabase/migrations/20260321000002_institution_admin_02_tables.sql`:
    - `programme_offerings`
    - `cohort_offerings`
    - `class_group_offerings`
    - `classrooms.class_group_offering_id` (+ FK/comment)
- `*_03_indexes_constraints`
  - Added offering indexes to `supabase/migrations/20260321000002_institution_admin_03_indexes_constraints.sql`
- `*_05_backfills_seed` (for safe data derivation/backfill)
  - Moved offering derivation/backfill logic to `supabase/migrations/20260321000002_institution_admin_05_backfills_seed.sql`
  - Includes backfill of `classrooms.class_group_offering_id`
- `*_07_rls_policies`
  - Added offering-table RLS to `supabase/migrations/20260321000002_institution_admin_07_rls_policies.sql`
  - Enforced legacy write-freeze behavior in existing RLS suites:
    - `supabase/migrations/20260323000002_classroom_course_links_lesson_progress_07_rls_policies.sql` (drop teacher/admin `FOR ALL`, replace with `SELECT`-only policies)
    - `supabase/migrations/20260323000001_baseline_lms_rls_memberships_07_rls_policies.sql` (`REVOKE INSERT, UPDATE, DELETE` on `course_enrollments` for `authenticated`)
- `*_04_functions_rpcs` equivalent placement (compat-safe)
  - Moved drift views + reporting helper into `supabase/migrations/20260329000006_course_delivery_06_functions_rpcs.sql` (this is where `course_deliveries` already exists, avoiding early dependency breaks)
  - Added drift-view grants in `supabase/migrations/20260329000007_course_delivery_07_rls_policies.sql`

Temporary files removed:

- `supabase/migrations/20260331000001_institution_offering_alignment_02_tables.sql`
- `supabase/migrations/20260331000001_institution_offering_alignment_03_indexes_constraints.sql`
- `supabase/migrations/20260331000001_institution_offering_alignment_04_functions_rpcs.sql`
- `supabase/migrations/20260331000001_institution_offering_alignment_07_rls_policies.sql`

Compatibility-safety checks performed:

- Kept ordering aligned with existing dependency chain:
  - tables/indexes/backfills in `20260321000002_*`
  - delivery-dependent views/functions in `20260329000006_*`
  - related grants in `20260329000007_*`
- Re-ran SQL lint twice: `npm run lint:sql` passed.
- Verified no lingering references to deleted `20260331000001_*` migration files in SQL chain docs (updated `docs/domain/15_platform_roles_schema_map.md` accordingly).

If you want, next I can do a strict dependency audit pass (scan every `Requires:` header and referenced object creation order) and return a short risk matrix before commit.