-- =============================================================================
-- COURSE DELIVERY — access helpers (delivery-scoped entitlements)
-- Requires: 20260329000005_course_delivery_05_lesson_progress_learning_events.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION app.student_can_access_course_delivery(p_course_delivery_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.course_deliveries cd
    inner join public.classroom_members cm
      on cm.classroom_id = cd.classroom_id
     and cm.user_id = (select app.auth_uid())
     and cm.withdrawn_at is null
    where cd.id = p_course_delivery_id
      and cd.deleted_at is null
      and cd.published_at is not null
      and cd.status in (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status
      )
      and cd.institution_id in (select app.member_institution_ids())
  )
$$;

COMMENT ON FUNCTION app.student_can_access_course_delivery(uuid) IS
  'True if caller is an active classroom student for a published, non-deleted course_delivery in their institutions.';

CREATE OR REPLACE FUNCTION app.lesson_in_course_delivery_version(p_lesson_id uuid, p_course_delivery_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.course_deliveries cd
    inner join public.course_version_lessons cvl
      on cvl.source_lesson_id = p_lesson_id
    inner join public.course_version_topics cvt
      on cvt.id = cvl.course_version_topic_id
     and cvt.course_version_id = cd.course_version_id
    where cd.id = p_course_delivery_id
      and cd.deleted_at is null
  )
$$;

COMMENT ON FUNCTION app.lesson_in_course_delivery_version(uuid, uuid) IS
  'True if the canonical lesson_id appears in the course_delivery''s immutable course_version snapshot.';

CREATE OR REPLACE FUNCTION app.student_can_access_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.course_deliveries cd
    inner join public.classroom_members cm
      on cm.classroom_id = cd.classroom_id
     and cm.user_id = (select app.auth_uid())
     and cm.withdrawn_at is null
    where cd.course_id = p_course_id
      and cd.deleted_at is null
      and cd.published_at is not null
      and cd.status in (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status
      )
      and cd.institution_id in (select app.member_institution_ids())
  )
$$;

COMMENT ON FUNCTION app.student_can_access_course(uuid) IS
  'True if caller may access this course via a published course_delivery in an assigned classroom (replaces classroom_course_links-only checks).';

CREATE OR REPLACE FUNCTION app.student_can_access_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.course_deliveries cd
    inner join public.classroom_members cm
      on cm.classroom_id = cd.classroom_id
     and cm.user_id = (select app.auth_uid())
     and cm.withdrawn_at is null
    where cd.deleted_at is null
      and cd.published_at is not null
      and cd.status in (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status
      )
      and cd.institution_id in (select app.member_institution_ids())
      and exists (
        select 1
        from public.course_version_lessons cvl
        inner join public.course_version_topics cvt
          on cvt.id = cvl.course_version_topic_id
         and cvt.course_version_id = cd.course_version_id
        where cvl.source_lesson_id = p_lesson_id
      )
  )
$$;

COMMENT ON FUNCTION app.student_can_access_lesson(uuid) IS
  'True if caller may access this lesson via a published course_delivery whose version snapshot includes the lesson.';
