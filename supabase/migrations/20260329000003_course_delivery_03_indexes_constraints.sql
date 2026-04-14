-- =============================================================================
-- COURSE DELIVERY — indexes (naming: idx_*)
-- Requires: 20260329000002_course_delivery_02_tables.sql
-- =============================================================================

CREATE INDEX idx_course_versions_institution_id ON public.course_versions (institution_id);
CREATE INDEX idx_course_versions_course_id ON public.course_versions (course_id);
CREATE INDEX idx_course_versions_status ON public.course_versions (status);

CREATE INDEX idx_course_version_topics_course_version_id ON public.course_version_topics (course_version_id);
CREATE INDEX idx_course_version_topics_source_topic_id ON public.course_version_topics (source_topic_id);

CREATE INDEX idx_course_version_lessons_course_version_topic_id ON public.course_version_lessons (course_version_topic_id);
CREATE INDEX idx_course_version_lessons_source_lesson_id ON public.course_version_lessons (source_lesson_id);

CREATE INDEX idx_course_deliveries_institution_id ON public.course_deliveries (institution_id);
CREATE INDEX idx_course_deliveries_classroom_id ON public.course_deliveries (classroom_id);
CREATE INDEX idx_course_deliveries_course_id ON public.course_deliveries (course_id);
CREATE INDEX idx_course_deliveries_course_version_id ON public.course_deliveries (course_version_id);
CREATE INDEX idx_course_deliveries_status ON public.course_deliveries (status);
CREATE INDEX idx_course_deliveries_published_at ON public.course_deliveries (published_at)
  WHERE published_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'task_deliveries'
      AND constraint_name = 'fk_task_deliveries_course_deliveries'
  ) THEN
    ALTER TABLE public.task_deliveries
      ADD CONSTRAINT fk_task_deliveries_course_deliveries
      FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'point_ledger'
      AND constraint_name = 'fk_point_ledger_course_deliveries'
  ) THEN
    ALTER TABLE public.point_ledger
      ADD CONSTRAINT fk_point_ledger_course_deliveries
      FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE SET NULL;
  END IF;
END;
$$;
