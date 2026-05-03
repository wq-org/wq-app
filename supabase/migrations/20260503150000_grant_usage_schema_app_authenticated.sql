-- =============================================================================
-- Grant USAGE on schema app to authenticated (Supabase PostgREST role)
-- =============================================================================
-- Helpers in schema app (app.auth_uid(), app.is_super_admin(),
-- app.student_can_access_topic(), app.caller_can_manage_course(), etc.) are
-- referenced from RLS policies on public tables. PostgreSQL requires USAGE
-- on the schema before it will resolve app-qualified names; EXECUTE on the
-- functions alone is insufficient. Without this grant, teachers hit:
--   42501 permission denied for schema app
-- when inserting topics, lessons, or any row whose policies call app.*.
--
-- Aligns with docs/architecture/db_principles.md (explicit schema boundaries).
-- =============================================================================

GRANT USAGE ON SCHEMA app TO authenticated;
