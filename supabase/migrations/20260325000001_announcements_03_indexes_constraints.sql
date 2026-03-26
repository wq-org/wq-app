-- =============================================================================
-- ANNOUNCEMENTS — Indexes & constraints
-- Split layout (8-section) for a new domain migration
-- Requires: 20260321000002_institution_admin (all parts), 20260323000002 (all parts)
-- =============================================================================

-- classroom_announcements
CREATE INDEX idx_classroom_announcements_institution_id ON public.classroom_announcements (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_classroom_announcements_classroom_id   ON public.classroom_announcements (classroom_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_classroom_announcements_classroom_id_published_at   ON public.classroom_announcements (classroom_id, published_at DESC)
  WHERE published_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_classroom_announcements_classroom_id_created_at  ON public.classroom_announcements (classroom_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- course_announcements
CREATE INDEX idx_course_announcements_institution_id ON public.course_announcements (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_course_announcements_course_id      ON public.course_announcements (course_id)      WHERE deleted_at IS NULL;
CREATE INDEX idx_course_announcements_course_id_published_at   ON public.course_announcements (course_id, published_at DESC)
  WHERE published_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_course_announcements_course_id_created_at  ON public.course_announcements (course_id, created_at DESC)
  WHERE deleted_at IS NULL;
