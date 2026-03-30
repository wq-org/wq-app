-- =============================================================================
-- COURSE VERSIONS + DELIVERIES — tables (immutable snapshots + classroom rollout)
-- Requires: 20260329000001_course_delivery_01_types.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- course_versions — published snapshots of course structure + lesson payloads
-- -----------------------------------------------------------------------------
CREATE TABLE public.course_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  version_no integer NOT NULL,
  status public.course_version_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_course_versions_course_id_version_no UNIQUE (course_id, version_no),
  CONSTRAINT chk_course_versions_version_no_positive CHECK (version_no > 0)
);

COMMENT ON TABLE public.course_versions IS
  'Immutable published snapshots of a course; topics/lessons copied into course_version_* at publish time.';
COMMENT ON COLUMN public.course_versions.institution_id IS 'Tenant boundary (from course or classroom at publish).';

-- -----------------------------------------------------------------------------
-- course_version_topics — snapshot topic rows for one course version
-- -----------------------------------------------------------------------------
CREATE TABLE public.course_version_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_version_id uuid NOT NULL REFERENCES public.course_versions (id) ON DELETE CASCADE,
  source_topic_id uuid REFERENCES public.topics (id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.course_version_topics.source_topic_id IS 'Original topics.id at snapshot time; audit trace only.';

-- -----------------------------------------------------------------------------
-- course_version_lessons — snapshot lesson content for one version topic
-- -----------------------------------------------------------------------------
CREATE TABLE public.course_version_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_version_topic_id uuid NOT NULL REFERENCES public.course_version_topics (id) ON DELETE CASCADE,
  source_lesson_id uuid REFERENCES public.lessons (id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL,
  pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  content_schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.course_version_lessons.source_lesson_id IS
  'Original lessons.id at snapshot; RLS on lesson_progress ties canonical lesson_id to this row via delivery.';

-- -----------------------------------------------------------------------------
-- course_deliveries — one classroom rollout of a specific course version
-- -----------------------------------------------------------------------------
CREATE TABLE public.course_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL REFERENCES public.classrooms (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  course_version_id uuid NOT NULL REFERENCES public.course_versions (id) ON DELETE RESTRICT,
  status public.course_delivery_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  legacy_classroom_course_link_id uuid,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_course_deliveries_legacy_classroom_course_link_id
    UNIQUE (legacy_classroom_course_link_id),
  CONSTRAINT chk_course_deliveries_time_window CHECK (
    ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at
  )
);

COMMENT ON TABLE public.course_deliveries IS
  'Operational classroom rollout: binds classroom + course + immutable course_version. Replaces entitlement previously inferred only from classroom_course_links.';
COMMENT ON COLUMN public.course_deliveries.legacy_classroom_course_link_id IS
  'Backfill key to the pre-delivery classroom_course_links row, if any.';

CREATE UNIQUE INDEX idx_course_deliveries_classroom_course_version_active
  ON public.course_deliveries (classroom_id, course_id, course_version_id)
  WHERE deleted_at IS NULL;
