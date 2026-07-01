-- HETZNER_TEARDOWN: KEEP_CORE
-- =============================================================================
-- SERVICE ROLE — restore DML privileges on public schema tables
--
-- Problem:
--   Edge Functions (e.g. `request-email-change`) construct a Supabase client
--   with `SUPABASE_SERVICE_ROLE_KEY` and query application tables directly,
--   relying on Supabase's default behavior where `service_role` has full DML
--   access (it bypasses RLS via the `bypassrls` attribute, but PostgreSQL
--   table privileges are a separate layer).
--
--   On this database `service_role` only has the auto-granted REFERENCES /
--   TRIGGER / TRUNCATE privileges on `public.institution_memberships`,
--   `public.profiles`, `public.institutions`, `public.classroom_members`,
--   and the rest of `public`. SELECT/INSERT/UPDATE/DELETE were never granted
--   (or were revoked by an earlier migration), so every Edge Function that
--   touches these tables fails with:
--
--     ERROR:  permission denied for table institution_memberships
--
--   First surfaced by the "Send Confirmation Link" institution email change
--   flow, but it affects every server-side path that uses the service key.
--
-- Fix (per docs/architecture/principle_database.md — server-side admin paths
-- use service_role; never expose it to clients):
--   * Grant SELECT/INSERT/UPDATE/DELETE on all existing public tables.
--   * Set ALTER DEFAULT PRIVILEGES so future tables created by `postgres`
--     in `public` inherit the same grants and don't reintroduce the gap.
--
-- Scope: privileges only — no RLS changes, no policy changes, no schema
-- changes. RLS still applies for the `authenticated` role; `service_role`
-- bypasses RLS as designed for trusted server-side operations.
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO service_role;

NOTIFY pgrst, 'reload schema';
