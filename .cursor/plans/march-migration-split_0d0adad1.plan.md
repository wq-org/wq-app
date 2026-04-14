---
name: March-migration-split
overview: Restructure the largest March Supabase migrations into a clean 8-section layout (types/tables/indexes/constraints/functions/backfills/triggers/RLS/comments) following `docs/db_guide_line_en.md`, creating new split migration files and updating the originals to avoid double-application.
todos:
  - id: collect-targets
    content: Identify the three largest March migrations and confirm they are not yet applied (needed to safely replace originals).
    status: completed
  - id: split-institution-admin
    content: Split `supabase/migrations/20260321000002_institution_admin.sql` into 8 ordered section files based on the guide (types/tables/indexes+constraints/functions/backfills/triggers/RLS/comments).
    status: completed
  - id: split-super-admin
    content: Split `supabase/migrations/20260321000001_super_admin.sql` into 8 ordered section files using the same mapping.
    status: completed
  - id: split-baseline-lms
    content: Split `supabase/migrations/20260323000001_baseline_lms_rls_memberships.sql` into 8 ordered section files; ensure games trigger/backfill stays before RLS split.
    status: completed
  - id: remove-or-noop-originals
    content: Delete or no-op the original 3 migrations to avoid double-creation/policy duplication.
    status: completed
  - id: validate
    content: "After applying: run `supabase db lint`, then apply to a clean local DB to confirm successful execution and RLS correctness."
    status: completed
isProject: false
---

## Targets

- Split into 8 new migrations (section-based “reason to change”) the largest March files:
  - `supabase/migrations/20260321000002_institution_admin.sql`
  - `supabase/migrations/20260321000001_super_admin.sql`
  - `supabase/migrations/20260323000001_baseline_lms_rls_memberships.sql`

## 8-section mapping (per `docs/db_guide_line_en.md`)

Create 8 split files per original migration, each file holding one concern:

1. `*_01_types.sql`
  - `CREATE TYPE ...` / enum add-values blocks
2. `*_02_tables.sql`
  - `CREATE TABLE ...` and schema extensions (`ALTER TABLE ... ADD COLUMN/SET ...` that primarily belong to schema shape)
3. `*_03_indexes_constraints.sql`
  - `CREATE INDEX ...`, `UNIQUE` constraints and FK constraints added outside table definitions
4. `*_04_functions_rpcs.sql`
  - SQL/plpgsql helpers, RPC functions, `SECURITY DEFINER` implementations, plus `GRANT EXECUTE` for those functions
5. `*_05_backfills_seed.sql`
  - `INSERT ... SELECT`, `UPDATE ...` backfills, data seeds that are not pure DDL
6. `*_06_triggers_constraints.sql`
  - trigger functions + `CREATE TRIGGER`, check constraints/triggers that enforce data integrity beyond RLS
7. `*_07_rls_policies.sql`
  - `ENABLE/FORCE ROW LEVEL SECURITY`, `DROP POLICY`, `CREATE POLICY`, and table-specific RLS grants/revokes
8. `*_08_comments_docs.sql`
  - `COMMENT ON TABLE/COLUMN/FUNCTION`, plus any remaining documentation comments moved out of executable sections

## Execution steps

1. **Classify SQL statements** in each target migration by scanning for:
  - `CREATE TYPE`, `CREATE TABLE`, `ALTER TABLE ... ADD COLUMN`
  - `CREATE INDEX`, `ALTER TABLE ... ADD CONSTRAINT`
  - `CREATE OR REPLACE FUNCTION`, `GRANT EXECUTE`, `SECURITY DEFINER/INVOKER`
  - backfills (`INSERT INTO ... SELECT`, `UPDATE ... SET` blocks early in the file)
  - triggers (`CREATE TRIGGER`, `DROP TRIGGER`)
  - RLS (`ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`, `CREATE POLICY`)
  - documentation (`COMMENT ON ...`)
2. **Create split migration filenames**
  - Keep the same timestamp prefix as the original so order stays correct.
  - Add a lexicographically ordered suffix for the 8 sections, e.g.:
    - `20260321000002_institution_admin_01_types.sql`
    - `20260321000002_institution_admin_02_tables.sql`
    - ... up to `_08_comments_docs.sql`
3. **Prevent double-application**
  - Since you indicated March migrations are not applied yet, replace the original files by either:
    - deleting them, or
    - turning them into a minimal no-op stub containing only comments.
  - The goal is: objects are created exactly once across the new split files.
4. **Preserve dependencies**
  - Ensure any function referenced by a trigger/policy is created in an earlier split file.
  - Ensure any table/index referenced by constraints and RLS policies exists before the RLS split file.
5. **Run local validation after changes are applied**
  - Run `supabase db lint`.
  - Apply the migrations to a fresh local DB and verify:
    - all expected tables/enums/functions exist
    - RLS is `FORCE`d on the intended tables
    - no missing-function errors during trigger/policy creation

## Why this matches the guideline

- The approach follows the “reason to change” separation from `docs/db_guide_line_en.md` (“one migration = one coherent domain/concern slice” + recommended internal ordering).
- It makes AI parsing and human review easier because the execution order aligns with creation dependencies.

## Suggested sanity check (after split)

- Spot-check in each split target that:
  - `ALTER TABLE ... ENABLE/FORCE ROW LEVEL SECURITY` and `CREATE POLICY` live in `_07_rls_policies.sql`.
  - all `COMMENT ON ...` live in `_08_comments_docs.sql`.
  - backfills live only in `_05_backfills_seed.sql`.

