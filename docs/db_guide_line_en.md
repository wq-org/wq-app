# PostgreSQL Database Design & Operations Guideline for a Multi-Tenant Wound-Care Learning Platform

## Scope and design goals

This guideline defines how the project's PostgreSQL database must behave in production when used through Supabase (Auth + Data APIs + Storage + Realtime) in a self-hosted Docker setup on Hetzner. It is written specifically for a multi-tenant wound-care education platform with LMS-style course management plus a flow-based "Game Studio" (teachers author node/graph games; learners play runs; educators review outcomes). The database is treated as the final enforcement layer for tenant isolation, authorization, and data lifecycle rules (save/audit/delete/export).

Tenant separation must be enforced with PostgreSQL Row Level Security (RLS) and policies, because Supabase's auto-generated APIs are designed to rely on RLS for authorization rather than application-side filtering.

Non‑negotiables you must design around:

- **RLS bypass risks are real**: superusers and roles with the `BYPASSRLS` attribute always bypass RLS; table owners also bypass RLS unless you explicitly `FORCE ROW LEVEL SECURITY`. Your schema/migrations must account for this (including how you test).
- **Health-related media can be "special category" data** if you ever store real wound photos or real patient-linked case narratives. "Data concerning health" is defined in GDPR definitions, and processing health data is covered under special categories. Treat all real clinical media as high-risk by default.
- **GDPR operational duties shape schema design**: data minimization, storage limitation, privacy-by-design/default, security of processing, erasure, and data subject access/portability all have concrete impact on table structure, logs, retention metadata, and deletion pipelines.
- **Infrastructure is shared responsibility**: Hetzner's DPA/TOMs describe provider measures, but for cloud/dedicated servers you remain responsible for secure system management. Design DB controls assuming you must implement hardening, backups, monitoring, and incident preparedness yourself.
- **Tracking/analytics is regulated**: if you store tracking identifiers (device IDs, cross-session analytics IDs) or supported telemetry, align cookie/device-storage behavior with German guidance and TDDDG rules.

## Schema and data modeling conventions

### Schema boundaries

Use explicit schema boundaries so you can reason about exposure and privilege:

- `auth` schema: owned/managed by Supabase Auth; do **not** expose directly via APIs. If you need user profile data, create your own table (e.g., `public.profiles`) referencing `auth.users`, protect it with RLS, and define data-integrity relationships such as `ON DELETE CASCADE` where appropriate.
- `public` schema: only tenant-scoped application data that is safe to expose through PostgREST/Supabase Data API under RLS. (Assume anything in exposed schemas is reachable with at least the `anon` key; therefore RLS is mandatory.)
- `audit` schema: append-only audit/event tables and supporting functions. Prefer not exposing this schema publicly at all; if you must expose, expose via views with strict RLS. (PostgreSQL warns that functions/triggers/RLS policies can be "Trojan horse" vectors; keep who can create them tightly controlled.)

### Core table conventions

Adopt conventions that make multi-tenancy and compliance enforceable:

- Every tenant-scoped table **must** include `tenant_id uuid not null` and use it in all uniqueness constraints and performance indexes.
- Every write-sensitive table **must** include:
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
  - optional `deleted_at timestamptz null` (soft delete marker; see deletion section)
- Prefer immutable primary keys (UUIDs) and never reuse identifiers after deletion (to keep audit trails consistent).

These are project rules (not PostgreSQL requirements), but they enable simple, uniform RLS policies and reliable deletion workflows under storage limitation and erasure obligations.

### Documenting database entries (built-in documentation)

All schema objects that matter must be documented using PostgreSQL comments:

- Use `COMMENT ON TABLE ...` and `COMMENT ON COLUMN ...` in migrations for every application table/column that is accessed from application code.
- If you need to programmatically retrieve comments (e.g., to generate docs), PostgreSQL provides comment lookup functions such as `col_description` / `obj_description`.

### Migrations, version control, and reproducibility

All schema changes must be applied via SQL migrations committed to version control:

- Supabase migrations are SQL statements to create/update/delete schemas and are the canonical way to track database changes over time.
- Local development should capture schema changes into migration files (so what you test is what you deploy).

### Content payloads for "Game Studio" and rich text

You will store two kinds of "structured content" that change often:

- **Rich text** (e.g., lesson text, explanations, feedback). A headless editor like Yoopta exposes "content logic" and supports exports (HTML/Markdown/text/email). Store the canonical editor value as `jsonb`, plus a `content_schema_version` integer so you can migrate formats later.
- **Game graphs** (nodes/edges, branching rules, scoring). Store (a) a normalized relational model where you must query/inspect nodes individually, or (b) a versioned `jsonb` document for fast load + immutable publishing. For authorization/audit simplicity, publishing should always create a new immutable "version row" rather than mutating a published version.

"Versioned JSONB + immutable publish" is a project guideline; it aligns with auditability and reduces accidental cross-tenant leakage because you can treat published content as read-only and cacheable.

## Multi-tenancy and authorization with RLS

### RLS foundations you must design for

PostgreSQL RLS works by attaching policies to a specific table; policies are created with `CREATE POLICY` and enforced when row security is enabled. Superusers and `BYPASSRLS` roles bypass RLS; table owners bypass RLS unless the table is set to `FORCE ROW LEVEL SECURITY`.

When you enable RLS on a table and **no policies exist**, PostgreSQL applies a default-deny behavior for that table (so you must explicitly create the policies you want).

Project enforcement rule:

- Every tenant-scoped table must include both:
  - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
  - `ALTER TABLE ... FORCE ROW LEVEL SECURITY;`  
    so that owners don't bypass policies during testing/operations.

### The tenant model to standardize on

Use **one shared database** + **one shared set of tables** + a `tenant_id` column on every tenant-scoped row.

This model is operationally simpler with Supabase/PostgREST and is explicitly compatible with RLS-based authorization (the DB becomes the "tenant firewall").

Baseline tables (conceptual):

- `tenants` (institution/school/clinic tenant)
- `tenant_memberships` (user ↔ tenant with role + status)
- domain tables: `courses`, `course_enrollments`, `cases`, `lessons`, `game_projects`, `game_versions`, `game_runs`, `game_events`, etc. (all tenant-scoped)

### How Supabase context reaches RLS

Supabase Auth issues JWTs; Supabase products decode/verify JWTs and use them for RLS authorization.

In Supabase's RLS model, `auth.uid()` resolves the current user ID from JWT claims; under the hood it references a request setting (`request.jwt.claim.sub`) that is set at the beginning of each REST API request.

On the PostgREST side, request headers/cookies/JWT claims are exposed to SQL via transaction-scoped settings (e.g., `request.jwt.claims`, `request.headers`) and can be read with `current_setting(...)`. Some settings are not reset to NULL after COMMIT; they become an empty string, so you must treat empty string as "missing".

PostgreSQL's `current_setting(setting_name, true)` returns NULL if a setting is missing (with `missing_ok = true`).

### RLS policy templates you can standardize

**Rule A: tenant scoping is always checked in the DB**  
Every tenant table must enforce `tenant_id` equality, and it must be validated at INSERT/UPDATE time (`WITH CHECK`) as well as SELECT/DELETE time (`USING`). (This is the core purpose of RLS `USING` vs `WITH CHECK`.)

**Rule B: compute user/tenant context once per statement (performance + correctness)**  
Supabase explicitly recommends wrapping JWT helper functions using a scalar subquery (e.g., `(select auth.uid())`) so PostgreSQL caches the value per statement (initPlan) instead of re-evaluating on every row. Only do this when the value does not depend on row data.

Example pattern (illustrative; adapt to your actual table names and roles):

```sql
-- 1) A helper function to read "active tenant" from the user's profile.
-- Keep it SECURITY INVOKER unless you have a specific reason otherwise.
create or replace function app.current_tenant_id()
returns uuid
language sql
stable
as $$
  select active_tenant_id
  from public.profiles
  where user_id = auth.uid()
$$;

-- 2) A helper to check membership.
create or replace function app.is_tenant_member(t uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.tenant_memberships m
    where m.tenant_id = t
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
$$;

-- 3) Table policy template (SELECT shown; apply similar patterns for INSERT/UPDATE/DELETE).
alter table public.courses enable row level security;
alter table public.courses force row level security;

create policy courses_select
on public.courses
for select
to authenticated
using (
  tenant_id = (select app.current_tenant_id())
  and (select app.is_tenant_member(tenant_id))
);
```

Why the "active tenant" approach works well operationally: it avoids putting tenant_id into JWT claims (which complicates switching tenants) while still making tenant context unspoofable, because access is always validated against `tenant_memberships` inside the policy. This is a project guideline.

### Admin boundaries (super admins vs tenant admins)

Separate "platform super admin" from "tenant admin":

- **Tenant admin** should still be enforced by RLS and membership (no bypass).
- **Platform super admin operations** (support/debug) should use a dedicated, non-public DB connection path and should not run through public APIs. If you do need cross-tenant reads via API, implement them through tightly scoped security-definer RPC functions and strong audit logging (see audit section).

## Data lifecycle rules

This section answers the concrete "how to save / what to audit / what to monitor / how to delete" questions.

### How to save (writes)

**Principle: writes are accepted only if they are tenant-valid and role-valid under RLS.** Supabase APIs are designed to work with RLS policies; do not rely on the frontend to filter or to set `tenant_id` correctly.

Project saving rules:

- All client-visible writes must go through:
  1. table constraints (FKs, checks, uniqueness)
  2. RLS `WITH CHECK` policies
  3. audit triggers for high-risk tables
- Prefer **immutable publishing**: teacher edits occur in draft rows; publishing creates a new immutable version row. This makes audits deterministic and reduces "mutable history" issues.

### What needs an audit log (two layers)

You need **two complementary audit layers**:

**Layer 1: application/business audit events (in tables)**  
Use an append-only `audit.events` table for actions that matter to security, safety, grading integrity, and compliance.

Audit events are mandatory for:

- tenant lifecycle: tenant created/disabled, domain changes, SSO enabled/changed
- membership lifecycle: user invited, role changed, removed, institution admin changes
- content lifecycle: course published/unpublished, game published/unpublished, assessment rubric changes
- learner outcomes: manual overrides, grade re-computation, feedback edits, instructor annotations on learner runs
- privacy operations: export initiated, deletion/erasure requested/completed, consent granted/withdrawn
- privileged actions: "support mode" access, cross-tenant admin reads, impersonation workflows

This is a project requirement derived from accountability, minimization, and breach-response preparedness.

**Layer 2: database-level session/object auditing (in logs)**  
For compliance and forensics, you may need to audit actual SQL activity. `pgaudit` provides detailed session/object audit logging via PostgreSQL's standard logging facility, and Supabase documents it as an auditing extension you can enable/selectively configure.

Important audit minimization constraints:

- Logs and audit events can become personal data; keep what you store proportional and define retention windows (storage limitation).
- If an incident occurs, GDPR requires breach documentation and (in many cases) notification within 72 hours; good audit trails materially reduce time-to-assess.

### What needs monitoring

Monitoring is mandatory at three levels:

**Database behavior**

- slow queries, high-error queries, lock waits, deadlocks, connection saturation, disk usage, WAL growth, vacuum lag

PostgreSQL supports multiple logging destinations including structured formats like `jsonlog`; configure logging so operations can detect performance and security issues.

Use `pg_stat_statements` to track planning/execution statistics for SQL statements and to make "top queries" observable.

**Authorization health**

- RLS denials/spikes (403-like behavior at API), policy regressions (sudden increase in "rows removed by filter" patterns), performance regressions in policies (e.g., expensive `current_setting(... )::jsonb` parsing)

Supabase explicitly documents RLS performance patterns and the "wrap JWT helpers" optimization; use this to guide policy performance dashboards.

**Platform services**

- Auth availability and sign-in error rates (especially for SSO tenants)
- PostgREST error rates/latency
- Storage upload errors/latency and bucket permission failures

### How to delete (GDPR-aware deletion model)

Deletion must distinguish three operations:

1. **Soft delete (product behavior)**: reversible removal from UI, keeps row for audit/undo.
2. **Hard delete (true erase)**: removes row content from primary tables.
3. **Anonymization/pseudonymization**: irreversible removal of identifiers while preserving aggregate learning analytics.

GDPR's storage limitation principle requires you not store identifiable personal data longer than necessary, and GDPR provides data subjects a right to erasure in many cases.

Project deletion rules:

- Soft delete is allowed for **content** (courses/games) to support undo and traceability, but must be paired with retention limits and a hard-delete job for stale deleted content.
- For **learner records**, default to:
  - keep the minimal educational record needed for legitimate educational purposes (tenant policy), and
  - anonymize identifiers when erasure applies (depending on legal basis and retention duties).
- When deleting a user, you must:
  - delete or anonymize application rows that identify them (profiles, memberships, authored content attribution if required), and
  - ensure cascading behavior is intentional. Supabase's own docs recommend referencing `auth.users`, enabling RLS, and using `ON DELETE CASCADE` in the reference where appropriate.
- For analytics/tracking data, ensure consent-based storage aligns to TDDDG/cookie guidance and is removable.

Design for "data subject requests":

- Right of access: be able to export a user's data and explain categories, recipients, and retention periods.
- Right to portability: exports should be structured and machine-readable where applicable.

## Security layers

Security must be layered; the database layer is only one part.

### Database authorization layer

- RLS must be enabled + forced on tenant tables.
- Understand role bypass: `BYPASSRLS` exists as a role attribute and bypasses RLS. Use it only for tightly controlled operator accounts, never public API roles.
- PostgREST uses JWTs and cares specifically about the `role` claim for user impersonation; your policies should assume that role separation matters.

### Secret management and key boundaries

In self-hosted Supabase Docker, `JWT_SECRET` is used across Auth/PostgREST/other services to sign and verify JWTs; `ANON_KEY` is a client-side key with limited permissions and `SERVICE_ROLE_KEY` is a server-side key with full database access and must never be exposed in browsers.

Key rotation and JWT security must be planned; Supabase documents rotation workflows for anon/service/JWT secrets.

### Security-definer functions and safe SQL

PostgreSQL explicitly warns that `SECURITY DEFINER` functions execute with the function owner's privileges, and therefore you must set a safe `search_path` that excludes schemas writable by untrusted users to prevent object-masking attacks.

Supabase reiterates: default to `security invoker`; if you use `security definer`, you must set `search_path` (including the option of an empty search path requiring explicit schema qualification).

### SSO tenants and identity assurance

If you integrate institutional SSO:

- Supabase Auth supports enterprise Single Sign-On with SAML 2.0.
- If an institution uses entity["company","Microsoft","technology company"] Entra SAML SSO, follow Entra's SAML setup patterns and enforce MFA expectations at the IdP level where possible (security defaults describe MFA registration/enforcement).

The DB impact: store identity-provider metadata (issuer, IdP user identifier, tenant mapping) in a dedicated table, but keep it minimal and avoid duplicating immutable IdP identifiers in many rows (data minimization).

### Compliance baseline references

When hosting in entity["country","Germany","country in europe"] or serving German schools/clinics, security baselines frequently reference frameworks such as entity["organization","Bundesamt für Sicherheit in der Informationstechnik (BSI)","federal it security agency, de"] C5 (minimum requirements for secure cloud computing) and IT-Grundschutz (module-based security recommendations). Use them as a checklist driver for logging, backup, access control, and ops documentation, even if you are not formally certified.

## Operations on Hetzner with self-hosted Supabase

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["Supabase self-hosting docker architecture diagram Kong PostgREST GoTrue Realtime Storage","PostgreSQL row level security multi tenant diagram"],"num_per_query":1}

### Deployment realities of self-hosted Supabase on Docker

Supabase documents Docker as the easiest path to self-hosting. Treat the Docker Compose file as production infrastructure-as-code (reviewed, versioned, and with secrets kept out of git).

Self-hosted Auth configuration differs from hosted: some Auth configuration (e.g., providers) must be configured through Docker Compose rather than the hosted dashboard.

### Storage: use S3-compatible backends for durability and separation

Supabase Storage can use an S3-compatible backend (instead of local filesystem) and can also expose an S3 protocol endpoint; these are independent features.

Hetzner Object Storage is S3-compatible. This makes it a good candidate for (a) Storage backends and (b) offsite backup targets.

### Backups: DB-consistent strategy beats "disk snapshots only"

PostgreSQL documents three fundamental approaches to backups: SQL dumps, filesystem-level backups, and continuous archiving (PITR).

For PITR, PostgreSQL requires archiving a continuous sequence of WAL files covering the period back to the start of a base backup; you must set up and test WAL archiving before relying on PITR. Also, WAL settings must support archiving/replication (`wal_level` must be `replica` or higher for continuous archiving).

`pg_basebackup` can take a base backup of a running PostgreSQL cluster without stopping other clients, and it is explicitly usable for PITR and as a standby starting point.

Hetzner provides server backups/snapshots; use them for fast host recovery, but do not treat them as your only DB recovery mechanism. Snapshots are not a substitute for tested PostgreSQL PITR with WAL archiving, because crash consistency and restore granularity differ (project ops guideline).

Also note storage durability primitives: Hetzner Volumes store blocks on multiple physical servers (a durability mechanism), but this still doesn't replace logical/PITR backups or protect against application-level deletes.

### Logging & monitoring

Configure PostgreSQL logs so they can be ingested by your monitoring stack; PostgreSQL supports multiple log destinations including `jsonlog`.

Use `pg_stat_statements` for continuous query performance observability, and build alerting around "top time consumers" and "top error generators."

If you enable `pgaudit`, ensure logs are routed and retained according to your data minimization and storage limitation policies.

Hetzner DPA/TOMs context: Hetzner's DPA describes processing obligations and requires technical and organizational measures aligned to GDPR Art. 32 (including confidentiality/integrity/availability/resilience), and the TOM appendix clarifies that for cloud/dedicated servers you are responsible for managing and securing the server—so do not outsource DB hardening to assumptions.

For web tracking and stored identifiers (analytics), align to German data protection authority guidance (e.g., entity["organization","LfDI Baden-Württemberg","state data protection authority"]) and TDDDG requirements on storing/reading information on end devices.
