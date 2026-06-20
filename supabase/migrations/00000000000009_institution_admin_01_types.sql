-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-ORG-HIERARCHY | faculty→programme→cohort→class_group + programme/cohort/class_group_offerings + institution_staff_scopes — strip all hierarchy DDL/RLS/triggers/seeds; KEEP institution_memberships/classrooms/classroom_members/institution_invites/institution_settings/quotas + membership enums + core app/RPC helpers | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- INSTITUTION ADMIN — Types & Enums
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260000000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

-- =============================================================================
-- 1. ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE membership_role AS ENUM ('institution_admin', 'teacher', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('invited', 'active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 11b. classroom_member_role enum
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE classroom_member_role AS ENUM ('student', 'co_teacher');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
