-- =============================================================================
-- ANNOUNCEMENTS — Tables
-- Split layout (8-section) for a new domain migration
-- Requires: 20260321000002_institution_admin (all parts), 20260323000002 (all parts)
-- =============================================================================

-- =============================================================================
-- classroom_announcements — classroom feed (pinned + timeline)
-- =============================================================================
CREATE TABLE public.classroom_announcements (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid        NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  created_by      uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title           text        NOT NULL,
  link_payload    jsonb,
  is_pinned       boolean     NOT NULL DEFAULT false,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

COMMENT ON TABLE  public.classroom_announcements IS 'Teacher-created classroom feed items (not calendar events).';
COMMENT ON COLUMN public.classroom_announcements.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.classroom_announcements.classroom_id IS 'Target classroom for this feed item.';
COMMENT ON COLUMN public.classroom_announcements.created_by IS 'Author user id (teacher/co-teacher).';
COMMENT ON COLUMN public.classroom_announcements.link_payload IS 'Structured payload for deep linking: {type, ref_id, action_url, attachments}.';
COMMENT ON COLUMN public.classroom_announcements.is_pinned IS 'Pinned items surface at top of classroom feed.';
COMMENT ON COLUMN public.classroom_announcements.published_at IS 'NULL = draft; set to publish for students.';
COMMENT ON COLUMN public.classroom_announcements.deleted_at IS 'Soft delete marker.';

-- =============================================================================
-- course_announcements — course feed items (course-wide, classroom delivery aware)
-- =============================================================================
CREATE TABLE public.course_announcements (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  course_id       uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_by      uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title           text        NOT NULL,
  link_payload    jsonb,
  is_pinned       boolean     NOT NULL DEFAULT false,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

COMMENT ON TABLE  public.course_announcements IS 'Teacher-created course feed items (not calendar events).';
COMMENT ON COLUMN public.course_announcements.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.course_announcements.course_id IS 'Target course for this feed item.';
COMMENT ON COLUMN public.course_announcements.created_by IS 'Author user id (course teacher).';
COMMENT ON COLUMN public.course_announcements.link_payload IS 'Structured payload for deep linking: {type, ref_id, action_url, attachments}.';
COMMENT ON COLUMN public.course_announcements.is_pinned IS 'Pinned items surface at top of course feed.';
COMMENT ON COLUMN public.course_announcements.published_at IS 'NULL = draft; set to publish for students.';
COMMENT ON COLUMN public.course_announcements.deleted_at IS 'Soft delete marker.';

