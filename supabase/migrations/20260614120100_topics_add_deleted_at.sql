-- Topics soft-delete marker.
--
-- A published topic cannot be hard-deleted: its course_version_topics snapshot
-- pins a topic_versions row via ON DELETE RESTRICT, and the source_topic_id
-- SET NULL on delete trips chk_course_version_topics_pin_consistent (error
-- 23514). Teachers therefore "delete" a topic by setting deleted_at; published
-- snapshots are retained for auditability.
--
-- Visibility is filtered at the query layer (deleted_at IS NULL); this column is
-- not a tenant-isolation boundary, so existing RLS policies are unchanged.

ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

COMMENT ON COLUMN public.topics.deleted_at IS
  'Soft-delete marker. NULL = active; non-NULL = hidden from course topic lists. Published snapshots are retained.';

CREATE INDEX IF NOT EXISTS idx_topics_deleted_at
  ON public.topics (deleted_at);
