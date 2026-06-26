-- =============================================================================
-- COURSE DELIVERY — offline status
-- =============================================================================

ALTER TYPE public.course_delivery_status ADD VALUE IF NOT EXISTS 'offline';

COMMENT ON TYPE public.course_delivery_status IS
  'Operational state of a classroom course delivery: draft, scheduled, active, offline, archived, or canceled. Offline is a reversible hidden state; archived is historical/final.';
