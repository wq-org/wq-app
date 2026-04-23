-- =============================================================================
-- COURSE VERSIONS + DELIVERIES — tables (immutable snapshots + classroom rollout)
-- Requires: 20260329000001_course_delivery_01_types.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- course_versions — published snapshots of course structure + lesson payloads
-- -----------------------------------------------------------------------------
CREATE TABLE public.course_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  course_id uuid NOT NULL,
  version_no integer NOT NULL,
  status public.course_version_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_course_versions_institutions FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_versions_courses FOREIGN KEY (course_id) REFERENCES public.courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_versions_profiles FOREIGN KEY (created_by) REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  CONSTRAINT uq_course_versions_course_id_version_no UNIQUE (course_id, version_no),
  CONSTRAINT chk_course_versions_version_no_positive CHECK (version_no > 0)
);

COMMENT ON TABLE public.course_versions IS
  'Immutable published snapshots of a course; topics/lessons copied into course_version_* at publish time.';
COMMENT ON COLUMN public.course_versions.id IS 'Primary key.';
COMMENT ON COLUMN public.course_versions.institution_id IS 'Tenant boundary (from course or classroom at publish).';
COMMENT ON COLUMN public.course_versions.course_id IS 'Authoring course this version belongs to.';
COMMENT ON COLUMN public.course_versions.version_no IS 'Monotonic version number per course (starts at 1).';
COMMENT ON COLUMN public.course_versions.status IS 'draft / published / archived.';
COMMENT ON COLUMN public.course_versions.published_at IS 'When this version row was published; NULL while draft.';
COMMENT ON COLUMN public.course_versions.created_by IS 'Profile that created the version row.';
COMMENT ON COLUMN public.course_versions.created_at IS 'Row creation time.';
COMMENT ON COLUMN public.course_versions.updated_at IS 'Last update time.';

-- -----------------------------------------------------------------------------
-- course_version_topics — snapshot topic rows for one course version
-- -----------------------------------------------------------------------------
CREATE TABLE public.course_version_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_version_id uuid NOT NULL,
  source_topic_id uuid,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_course_version_topics_course_versions FOREIGN KEY (course_version_id) REFERENCES public.course_versions (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_version_topics_topics FOREIGN KEY (source_topic_id) REFERENCES public.topics (id) ON DELETE SET NULL
);

COMMENT ON TABLE public.course_version_topics IS
  'Immutable snapshot topic row for one course_version.';
COMMENT ON COLUMN public.course_version_topics.id IS 'Primary key.';
COMMENT ON COLUMN public.course_version_topics.course_version_id IS 'Parent published course version.';
COMMENT ON COLUMN public.course_version_topics.source_topic_id IS 'Original topics.id at snapshot time; audit trace only.';
COMMENT ON COLUMN public.course_version_topics.title IS 'Copied topic title at publish.';
COMMENT ON COLUMN public.course_version_topics.description IS 'Copied topic description at publish.';
COMMENT ON COLUMN public.course_version_topics.order_index IS 'Display order within the version.';
COMMENT ON COLUMN public.course_version_topics.created_at IS 'Snapshot row creation time.';
COMMENT ON COLUMN public.course_version_topics.updated_at IS 'Last update time.';

-- -----------------------------------------------------------------------------
-- course_version_lessons — snapshot lesson content for one version topic
-- -----------------------------------------------------------------------------
CREATE TABLE public.course_version_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_version_topic_id uuid NOT NULL,
  source_lesson_id uuid,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL,
  pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  content_schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_course_version_lessons_course_version_topics FOREIGN KEY (course_version_topic_id) REFERENCES public.course_version_topics (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_version_lessons_lessons FOREIGN KEY (source_lesson_id) REFERENCES public.lessons (id) ON DELETE SET NULL
);

COMMENT ON TABLE public.course_version_lessons IS
  'Immutable snapshot lesson payload for one course_version topic.';
COMMENT ON COLUMN public.course_version_lessons.id IS 'Primary key.';
COMMENT ON COLUMN public.course_version_lessons.course_version_topic_id IS 'Parent snapshot topic.';
COMMENT ON COLUMN public.course_version_lessons.source_lesson_id IS
  'Original lessons.id at snapshot; lesson_progress.lesson_id maps here via delivery.';
COMMENT ON COLUMN public.course_version_lessons.title IS 'Copied lesson title at publish.';
COMMENT ON COLUMN public.course_version_lessons.description IS 'Copied lesson description at publish.';
COMMENT ON COLUMN public.course_version_lessons.content IS 'Lexical / rich-text JSONB at publish.';
COMMENT ON COLUMN public.course_version_lessons.pages IS 'Slide/page JSONB at publish.';
COMMENT ON COLUMN public.course_version_lessons.order_index IS 'Order within the snapshot topic.';
COMMENT ON COLUMN public.course_version_lessons.content_schema_version IS 'Schema version for content JSON.';
COMMENT ON COLUMN public.course_version_lessons.created_at IS 'Snapshot row creation time.';
COMMENT ON COLUMN public.course_version_lessons.updated_at IS 'Last update time.';

-- -----------------------------------------------------------------------------
-- course_deliveries — one classroom rollout of a specific course version
-- -----------------------------------------------------------------------------
CREATE TABLE public.course_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  classroom_id uuid NOT NULL,
  course_id uuid NOT NULL,
  course_version_id uuid NOT NULL,
  status public.course_delivery_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  legacy_classroom_course_link_id uuid,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_course_deliveries_institutions FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_deliveries_classrooms FOREIGN KEY (classroom_id) REFERENCES public.classrooms (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_deliveries_courses FOREIGN KEY (course_id) REFERENCES public.courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_deliveries_course_versions FOREIGN KEY (course_version_id) REFERENCES public.course_versions (id) ON DELETE RESTRICT,
  CONSTRAINT uq_course_deliveries_legacy_classroom_course_link_id UNIQUE (legacy_classroom_course_link_id),
  CONSTRAINT chk_course_deliveries_time_window CHECK (
    ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at
  )
);

COMMENT ON TABLE public.course_deliveries IS
  'Operational classroom rollout: binds classroom + course + immutable course_version. Replaces entitlement previously inferred only from classroom_course_links; entitlements and analytics use this row.';
COMMENT ON COLUMN public.course_deliveries.id IS 'Primary key.';
COMMENT ON COLUMN public.course_deliveries.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.course_deliveries.classroom_id IS 'Classroom receiving this delivery.';
COMMENT ON COLUMN public.course_deliveries.course_id IS 'Course identity (denormalized for queries).';
COMMENT ON COLUMN public.course_deliveries.course_version_id IS 'Immutable snapshot used for this rollout.';
COMMENT ON COLUMN public.course_deliveries.status IS 'draft / scheduled / active / archived / canceled.';
COMMENT ON COLUMN public.course_deliveries.published_at IS 'When the delivery became visible to students; NULL if draft.';
COMMENT ON COLUMN public.course_deliveries.starts_at IS 'Optional scheduled start of teaching window.';
COMMENT ON COLUMN public.course_deliveries.ends_at IS 'Optional scheduled end of teaching window.';
COMMENT ON COLUMN public.course_deliveries.legacy_classroom_course_link_id IS
  'Backfill key to the pre-delivery classroom_course_links row, if any.';
COMMENT ON COLUMN public.course_deliveries.deleted_at IS 'Soft delete; NULL when active.';
COMMENT ON COLUMN public.course_deliveries.created_at IS 'Row creation time.';
COMMENT ON COLUMN public.course_deliveries.updated_at IS 'Last update time.';

CREATE UNIQUE INDEX idx_course_deliveries_classroom_course_version_active
  ON public.course_deliveries (classroom_id, course_id, course_version_id)
  WHERE deleted_at IS NULL;
