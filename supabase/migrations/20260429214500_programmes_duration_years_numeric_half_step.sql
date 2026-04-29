-- =============================================================================
-- INSTITUTION ADMIN — Programmes duration_years numeric half-step support
-- =============================================================================

-- 1) Convert duration_years from integer to exact fixed-point numeric.
ALTER TABLE public.programmes
  ALTER COLUMN duration_years TYPE numeric(3,1)
  USING duration_years::numeric(3,1);

-- 2) Enforce valid duration values (0.5 increments between 0.5 and 10.0).
ALTER TABLE public.programmes
  DROP CONSTRAINT IF EXISTS chk_programmes_duration_years_half_step;

ALTER TABLE public.programmes
  ADD CONSTRAINT chk_programmes_duration_years_half_step
  CHECK (
    duration_years IS NULL
    OR (
      duration_years >= 0.5
      AND mod(duration_years * 2, 1) = 0
    )
  );

COMMENT ON COLUMN public.programmes.duration_years IS
  'Programme length in years (0.5 increments supported, e.g. 1.5).';
