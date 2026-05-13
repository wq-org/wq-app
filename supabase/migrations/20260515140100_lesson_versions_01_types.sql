-- =============================================================================
-- LESSON VERSIONS — 01_types
-- Enums for lesson versioning: change kinds and resolution modes
-- =============================================================================

CREATE TYPE public.lesson_change_kind AS ENUM (
  'editorial_patch',      -- typo, wording, image alt text → safe for auto-patch
  'safe_content_patch',   -- corrected image, improved explanation → eligible for auto-patch
  'structural_major',     -- new section, removed section, reordered → forces new course version
  'assessment_major'      -- changed outcomes, progression, grading → forces new course version
);

COMMENT ON TYPE public.lesson_change_kind IS
  'Classifies lesson update impact. Editorial/safe patches can auto-propagate to active deliveries; structural/assessment changes require course republish.';

CREATE TYPE public.lesson_resolution_mode AS ENUM (
  'pinned',               -- Always use the specific lesson_version_id pinned at course publish
  'auto_patch'            -- Follow latest active patch within same version_major (auto-update deliveries)
);

COMMENT ON TYPE public.lesson_resolution_mode IS
  'How course_version_lessons resolves student-facing content. Pinned locks version; auto_patch allows patch updates.';
