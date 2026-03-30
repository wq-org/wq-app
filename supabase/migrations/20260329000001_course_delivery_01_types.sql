-- =============================================================================
-- COURSE DELIVERY — enums
-- Requires: institution_admin, classroom_course_links domain
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.course_version_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.course_delivery_status AS ENUM (
    'draft',
    'scheduled',
    'active',
    'archived',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
