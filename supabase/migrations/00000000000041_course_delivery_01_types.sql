-- =============================================================================
-- COURSE DELIVERY — enums
-- Requires: institution_admin, classroom_course_links domain
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.course_version_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.course_version_status IS
  'Lifecycle of a course version row: draft, published snapshot, or archived.';

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

COMMENT ON TYPE public.course_delivery_status IS
  'Operational state of a classroom course delivery (rollout window, cancellation, etc.).';
