-- DANGEROUS: wipes the entire public schema (all app tables, types, functions, policies, triggers, data).
-- Do this only if you intentionally want a full rebuild.

begin;

drop schema if exists public cascade;
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres;

alter default privileges in schema public
  grant all on tables to postgres, anon, authenticated, service_role;

alter default privileges in schema public
  grant all on routines to postgres, anon, authenticated, service_role;

alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;

commit;
