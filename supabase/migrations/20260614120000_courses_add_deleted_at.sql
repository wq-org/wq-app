-- Courses soft-delete marker.
--
-- A published course cannot be hard-deleted: its immutable course_version
-- snapshots pin topic_versions via ON DELETE RESTRICT, and cascading topic
-- deletes trip chk_course_version_topics_pin_consistent (error 23514). Teachers
-- therefore "delete" a course by setting deleted_at; published version
-- snapshots and their deliveries are retained for auditability.
--
-- Visibility is filtered at the query layer (deleted_at IS NULL); this column is
-- not a tenant-isolation boundary, so existing RLS policies are unchanged.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

COMMENT ON COLUMN public.courses.deleted_at IS
  'Soft-delete marker. NULL = active; non-NULL = hidden from teacher and catalog lists. Published snapshots are retained.';

CREATE INDEX IF NOT EXISTS idx_courses_deleted_at
  ON public.courses (deleted_at);
