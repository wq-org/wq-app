-- =============================================================================
-- NOTIFICATIONS — delivery channel enum (event/delivery model)
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.notification_delivery_channel AS ENUM ('in_app', 'email', 'push');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.notification_delivery_channel IS
  'Channel for notification_deliveries: in-app centre first; email and push reserved.';
