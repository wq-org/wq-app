-- =============================================================================
-- SUPER ADMIN — Types and enums
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE institution_health_state AS ENUM ('healthy', 'warning', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE entitlement_value_type AS ENUM ('boolean', 'integer', 'bigint', 'text');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_status AS ENUM (
    'active', 'trialing', 'past_due', 'grace', 'suspended', 'expired', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- If billing_status existed from an older draft without suspended, add the value (portable).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'billing_status'
      AND e.enumlabel = 'suspended'
  ) THEN
    ALTER TYPE billing_status ADD VALUE 'suspended';
  END IF;
END $$;

COMMENT ON TYPE billing_status IS
  'Subscription lifecycle. UK spelling cancelled; app may display US canceled.';
