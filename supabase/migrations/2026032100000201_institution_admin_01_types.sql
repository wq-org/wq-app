-- =============================================================================
-- INSTITUTION ADMIN — Types & Enums
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
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
