-- =============================================================================
-- TOPIC VERSIONS — types + topic_versions table + course_version_topics FK cols
-- Immutable topic metadata shells (title, description, order, gates) per
-- canonical topics.id; version_major aligns with course_versions.version_no
-- for snapshot baselines; patches increment version_patch within that major.
-- docs/architecture/principle_database.md: tenant-scoped rows (institution_id), UUID PKs,
-- comments on published-version tables.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Types
-- -----------------------------------------------------------------------------
CREATE TYPE public.topic_change_kind AS ENUM (
  'editorial_patch',
  'availability_patch',
  'structural_major'
);

COMMENT ON TYPE public.topic_change_kind IS
  'Kind of topic version change: editorial/availability patches may auto-apply when delivery resolution_mode is auto_patch; structural_major never auto-applies to active deliveries.';

CREATE TYPE public.topic_resolution_mode AS ENUM (
  'pinned',
  'auto_patch'
);

COMMENT ON TYPE public.topic_resolution_mode IS
  'How a course_version_topics row resolves topic_versions for students: pinned uses pinned_topic_version_id only; auto_patch follows latest editorial/availability patch within the same version_major.';

-- -----------------------------------------------------------------------------
-- 2) Table topic_versions
-- -----------------------------------------------------------------------------
CREATE TABLE public.topic_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  version_major integer NOT NULL,
  version_patch integer NOT NULL,
  change_kind public.topic_change_kind NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_locked boolean NOT NULL DEFAULT false,
  unlock_at timestamptz,
  published_by uuid NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_topic_versions_institutions FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_versions_topics FOREIGN KEY (topic_id) REFERENCES public.topics (id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_versions_profiles_published_by FOREIGN KEY (published_by) REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  CONSTRAINT chk_topic_versions_version_major_positive CHECK (version_major >= 1),
  CONSTRAINT chk_topic_versions_version_patch_non_negative CHECK (version_patch >= 0),
  CONSTRAINT chk_topic_versions_order_index_non_negative CHECK (order_index >= 0),
  CONSTRAINT uq_topic_versions_institution_topic_major_patch UNIQUE (institution_id, topic_id, version_major, version_patch)
);

COMMENT ON TABLE public.topic_versions IS
  'Immutable published shell for a canonical topic (metadata + availability fields); lessons remain versioned via course_version_lessons.';
COMMENT ON COLUMN public.topic_versions.institution_id IS 'Tenant isolation key (mirrors course_versions.institution_id).';
COMMENT ON COLUMN public.topic_versions.topic_id IS 'Canonical topics.id this version row belongs to.';
COMMENT ON COLUMN public.topic_versions.version_major IS 'Aligns with course_versions.version_no for rows created at course publish baseline.';
COMMENT ON COLUMN public.topic_versions.version_patch IS 'Monotonic patch within version_major for editorial/availability updates.';
COMMENT ON COLUMN public.topic_versions.change_kind IS 'Controls auto-patch eligibility for active deliveries.';
COMMENT ON COLUMN public.topic_versions.title IS 'Topic title as published in this version.';
COMMENT ON COLUMN public.topic_versions.description IS 'Topic description as published in this version.';
COMMENT ON COLUMN public.topic_versions.order_index IS 'Display order within the course version snapshot.';
COMMENT ON COLUMN public.topic_versions.is_locked IS 'When true, students are blocked unless unlock_at has passed (delivery-resolved reads).';
COMMENT ON COLUMN public.topic_versions.unlock_at IS 'Scheduled unlock time for gated access.';
COMMENT ON COLUMN public.topic_versions.published_by IS 'Profile user_id that published this version row.';
COMMENT ON COLUMN public.topic_versions.published_at IS 'When this version row was published.';
COMMENT ON COLUMN public.topic_versions.is_active IS 'When false, ignored by resolution (soft-disable a patch).';

CREATE INDEX idx_topic_versions_institution_id ON public.topic_versions (institution_id);
CREATE INDEX idx_topic_versions_topic_id ON public.topic_versions (topic_id);
CREATE INDEX idx_topic_versions_institution_topic_major_patch_desc
  ON public.topic_versions (institution_id, topic_id, version_major, version_patch DESC);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_topic_versions_set_updated_at ON public.topic_versions;
CREATE TRIGGER trg_topic_versions_set_updated_at
  BEFORE UPDATE ON public.topic_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- course_version_topics — link snapshot row to pinned topic version + policy
-- -----------------------------------------------------------------------------
ALTER TABLE public.course_version_topics
  ADD COLUMN pinned_topic_version_id uuid,
  ADD COLUMN resolution_mode public.topic_resolution_mode NOT NULL DEFAULT 'pinned'::public.topic_resolution_mode;

COMMENT ON COLUMN public.course_version_topics.pinned_topic_version_id IS
  'topic_versions row frozen for this snapshot topic; resolution_mode controls whether newer patches apply for students.';
COMMENT ON COLUMN public.course_version_topics.resolution_mode IS
  'pinned: students always see pinned_topic_version_id; auto_patch: latest active editorial/availability patch within same version_major.';

ALTER TABLE public.course_version_topics
  ADD CONSTRAINT fk_course_version_topics_topic_versions FOREIGN KEY (pinned_topic_version_id) REFERENCES public.topic_versions (id) ON DELETE RESTRICT;
