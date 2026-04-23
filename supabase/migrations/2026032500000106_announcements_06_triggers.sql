-- =============================================================================
-- ANNOUNCEMENTS — Triggers
-- Split layout (8-section) for a new domain migration
-- Requires: 20260209000001_baseline_schema (public.update_updated_at), 20260321000002_institution_admin (all parts)
-- =============================================================================

DROP TRIGGER IF EXISTS ca_updated_at ON public.classroom_announcements;
DROP TRIGGER IF EXISTS trg_classroom_announcements_set_updated_at ON public.classroom_announcements;
CREATE TRIGGER trg_classroom_announcements_set_updated_at
  BEFORE UPDATE ON public.classroom_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS coa_updated_at ON public.course_announcements;
DROP TRIGGER IF EXISTS trg_course_announcements_set_updated_at ON public.course_announcements;
CREATE TRIGGER trg_course_announcements_set_updated_at
  BEFORE UPDATE ON public.course_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
