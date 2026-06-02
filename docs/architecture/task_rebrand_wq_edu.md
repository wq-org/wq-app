# Task — Rebrand from WQ Health / wq-app to WQ Edu

## Goal

Standardize the product, technical identifiers, and Supabase-facing naming from legacy `wq-health` / `wq-app` references to `wq-edu`, while preserving runtime stability and multi-tenant integrity.

## Description

**Context:** The current codebase still mixes three identities: npm/package naming uses `wq-health`, the web manifest exposes `WQ Health`, and at least one browser storage key uses `wq-app`. The repository root remains `wq-app`, but the product direction is now `WQ Edu`. Existing project files confirm these legacy identifiers are still active in `package.json`, `package-lock.json`, `public/site.webmanifest`, and `src/locales/i18n.ts`. [cite:21][cite:23]

**Scope:** This task covers frontend branding, technical package naming, browser/local-storage key prefixes, Supabase-facing config and naming review, environment/config files, and documentation updates. The repository folder may remain `wq-app` for now unless an explicit repo rename is approved. Security-sensitive identifiers, auth settings, and RLS policies must be reviewed before renaming to avoid breaking access control or environment resolution. [cite:22][cite:25]

## User Action 1

**Trigger:** A user opens the app in the browser or installs it as a PWA.
**Outcome:** The visible app/product name displays `WQ Edu` instead of `WQ Health` or `wq-app` in manifest-driven surfaces such as install prompts, app labels, and browser UI.

## User Action 2

**Trigger:** A developer installs dependencies, runs local development, or checks project metadata.
**Outcome:** The technical project identifier uses `wq-edu` consistently in package metadata, lockfile metadata, and developer-facing configuration where a slug is required.

## User Action 3

**Trigger:** A returning user opens the app after the rebrand and the app initializes localization, preferences, and Supabase-backed features.
**Outcome:** Browser storage keys, Supabase configuration references, and application bootstrapping continue to work without data corruption, auth regressions, or tenant leakage.

## Initial State

1. `package.json` currently contains `"name": "wq-health"`, and `package-lock.json` mirrors that technical identifier. [cite:21][cite:23]
2. `public/site.webmanifest` currently contains the visible app name `WQ Health`. [cite:21]
3. `src/locales/i18n.ts` currently uses the storage key `wq-app:language`, which means browser state still carries the old product slug. [cite:21]
4. A task template already exists at `docs/architecture/principle_task_template.md`, and Supabase-related files exist under `supabase/`, so this change should be documented and executed against the real project structure rather than as an abstract note. [cite:24][cite:25]

## Sample Interaction

1. The developer runs the app locally and verifies current branding shows mixed identifiers such as `WQ Health`, `wq-health`, or `wq-app` in config and runtime surfaces.
2. The developer updates package metadata to `wq-edu`, changes visible branding to `WQ Edu`, and migrates browser key prefixes from `wq-app:*` to `wq-edu:*` with a compatibility fallback where needed.
3. The developer reviews Supabase config, SQL, storage buckets, Edge Functions, auth redirect URLs, secrets, and docs for legacy branding references and renames only the safe identifiers.
4. The developer rebuilds and validates that app boot, localization, auth, and tenant-scoped access still work correctly.
5. The final state shows a user-facing product named `WQ Edu`, a technical slug `wq-edu`, and no uncontrolled legacy branding leaks in active configuration.

## Detailed Requirements

1. Replace the npm/package slug in `package.json` from `wq-health` to `wq-edu`, and update any generated lockfile/package metadata that still exposes the old slug. [cite:23]
2. Replace visible PWA/app branding in `public/site.webmanifest` from `WQ Health` to `WQ Edu`; also review `short_name`, description, and related metadata if present so branding is consistent. [cite:21]
3. Replace browser storage key prefixes such as `wq-app:language` with `wq-edu:language`; implement a one-time fallback read from the old key to the new key if preserving existing user preference state is important. [cite:21]
4. Search the codebase for all remaining references to `wq-health`, `WQ Health`, `wq-app`, `WQ App`, `wq_edu`, and `wq-edu`, then classify each hit as one of: visible branding, technical slug, migration-sensitive identifier, or safe-to-ignore historical text. [cite:21][cite:22]
5. Review all Supabase files under `supabase/` for legacy naming in the following categories: project URL variables, anon/service role key variable names, storage bucket names, SQL comments, migration names, function names, seed data, redirect URLs, and Edge Function configuration. Only rename items that are safe and do not break deployed environments or migration history. [cite:25]
6. Do **not** rename historical migration filenames or already-applied SQL object names blindly if that would create schema drift, failed deployments, or broken rollback assumptions. Security implication: careless renaming in Postgres functions, triggers, policies, or bucket identifiers can break RLS enforcement or tenant-isolation assumptions. [cite:25]
7. Validate Supabase auth and multi-tenant behavior after the rename by checking environment variable mapping, redirect URL settings, and any hard-coded product URLs or app titles used in email/auth flows. Security implication: incorrect renaming can cause login failures, invalid callback targets, or cross-environment confusion. [cite:25]
8. Review Docker/Compose-related configuration for `COMPOSE_PROJECT_NAME`, `container_name`, image names, and environment naming if those files are present or added later; prefer `wq-edu` as the compose/project slug to reduce future naming drift. Existing workspace scans did not confirm a root compose file, so this review must include non-standard locations if Docker is introduced elsewhere. [cite:22]
9. Update README and architecture/docs references so onboarding, deployment, and branding documentation use `WQ Edu` consistently. This reduces developer confusion and lowers the chance of misconfigured environments. [cite:22][cite:25]
10. Add regression checks for visible branding and configuration naming, such as a repository search assertion or lint-style rule, so future commits do not reintroduce `WQ Health` or `wq-app` in active runtime files.
11. Performance implication: keep the rename configuration-only where possible; avoid broad refactors that increase bundle size or trigger unnecessary client-side state invalidation.
12. UX implication: use a silent migration path for local preference keys where possible so users retain language settings and do not see a reset after rebranding.
13. Accessibility implication: if app title or manifest metadata changes surface in UI headings or browser labels, ensure the visible label remains concise and screen-reader friendly (`WQ Edu` preferred over punctuation-heavy variants).
14. GDPR/operations implication: audit logs, backups, and self-hosted deployment docs should document the rename so support teams can trace legacy identifiers during incident response without deleting historical context.

## Subtask 1

**Title:** Frontend and package rebrand
**Acceptance Criteria:** `package.json`, lockfile metadata, web manifest, title/meta surfaces, and storage key prefixes are updated to `wq-edu` / `WQ Edu`; the app runs locally without broken localization or install metadata.

## Subtask 2

**Title:** Supabase naming audit and safe migration plan
**Acceptance Criteria:** All legacy branding references under `supabase/`, `.env`, and auth-related config are inventoried; each reference is labeled as safe-to-rename, requires compatibility handling, or must remain historical. The output includes explicit notes for security-sensitive items such as RLS-related SQL objects, bucket names, secrets, redirect URLs, and applied migration artifacts.

## Subtask 3

**Title:** Documentation and DevOps alignment
**Acceptance Criteria:** README and architecture/task documentation reflect `WQ Edu`; Docker/Compose naming guidance is documented for `wq-edu`; the team has a clear rollout note explaining which identifiers change now, which remain stable temporarily, and why.
