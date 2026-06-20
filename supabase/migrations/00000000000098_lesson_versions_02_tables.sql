-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-LESSON-PROGRESS | strip §4 lesson_progress.lesson_version_id | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- LESSON VERSIONS — 02_tables
-- Create lesson_versions table; add columns to course_versions, course_version_lessons,
-- and learning_events for version tracking
-- =============================================================================

-- =============================================================================
-- 1. lesson_versions table (immutable published snapshots)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lesson_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,

  -- Versioning semantics
  version_major INTEGER NOT NULL CHECK (version_major >= 1),
  version_patch INTEGER NOT NULL CHECK (version_patch >= 0),
  change_kind public.lesson_change_kind NOT NULL,

  -- Published lesson content (immutable snapshot)
  lexical_state JSONB NOT NULL,              -- Immutable snapshot of the lesson draft JSONB
  plain_text TEXT NULL,                      -- Optional: plaintext for full-text search
  content_schema_version INTEGER NOT NULL DEFAULT 1 CHECK (content_schema_version >= 1),

  -- Publication metadata
  published_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Optional: track what this version supersedes
  supersedes_lesson_version_id UUID NULL REFERENCES public.lesson_versions(id) ON DELETE RESTRICT,

  -- Soft-enable/disable for auto-patch resolution
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit & lifecycle
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Per principle_database.md: multi-tenant uniqueness includes institution_id
  UNIQUE (institution_id, lesson_id, version_major, version_patch)
);

COMMENT ON TABLE public.lesson_versions IS
  'Immutable published snapshots of lesson content. One row per lesson publish event. Each includes version_major (aligns with course_version.version_no) and version_patch (incremental within major).';

COMMENT ON COLUMN public.lesson_versions.institution_id IS
  'Tenant key. Enables multi-tenant RLS and ensures uniqueness within institution scope.';

COMMENT ON COLUMN public.lesson_versions.lexical_state IS
  'Canonical Lexical document JSONB captured at publish time from lessons.content.';

COMMENT ON COLUMN public.lesson_versions.change_kind IS
  'Determines auto-patch eligibility. Editorial/safe patches can propagate; structural/assessment require course republish.';

COMMENT ON COLUMN public.lesson_versions.is_active IS
  'FALSE disables version for auto-patch resolution (e.g., if patch is revoked). Pinned versions always used regardless.';

-- =============================================================================
-- 2. Modify course_versions: add has_pending_changes flag
-- =============================================================================

ALTER TABLE public.course_versions
  ADD COLUMN IF NOT EXISTS has_pending_changes BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.course_versions.has_pending_changes IS
  'TRUE if any lesson in this course_version has published a major version (structural_major, assessment_major). Signals to teacher that course republish is needed to include latest lesson changes.';

-- =============================================================================
-- 3. Modify course_version_lessons: add lesson version resolution columns
-- =============================================================================

ALTER TABLE public.course_version_lessons
  ADD COLUMN IF NOT EXISTS source_lesson_version_id UUID
    CONSTRAINT fk_course_version_lessons_lesson_versions
    REFERENCES public.lesson_versions(id) ON DELETE RESTRICT;

ALTER TABLE public.course_version_lessons
  ADD COLUMN IF NOT EXISTS resolution_mode public.lesson_resolution_mode NOT NULL DEFAULT 'pinned';

ALTER TABLE public.course_version_lessons
  ADD COLUMN IF NOT EXISTS allow_auto_patch BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.course_version_lessons.source_lesson_version_id IS
  'The lesson_version_id pinned at course publish time. Always used for pinned resolution; baseline for auto_patch.';

COMMENT ON COLUMN public.course_version_lessons.resolution_mode IS
  'How student-facing content resolves. Pinned → always use source_lesson_version_id. auto_patch → follow latest active patch.';

COMMENT ON COLUMN public.course_version_lessons.allow_auto_patch IS
  'If true and resolution_mode=auto_patch, editorial/safe patches are auto-delivered without course republish.';

-- =============================================================================
-- 4. Modify learning_events: add lesson_version_id tracking
-- =============================================================================

ALTER TABLE public.learning_events
  ADD COLUMN IF NOT EXISTS lesson_version_id UUID
    CONSTRAINT fk_learning_events_lesson_versions
    REFERENCES public.lesson_versions(id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.learning_events.lesson_version_id IS
  'The exact lesson_version_id viewed by student. Enables per-version analytics and patch effectiveness measurement.';
