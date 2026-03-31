-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Functions & RPCs
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- =============================================================================
-- 1b. Membership-derived role helpers + student access helpers (Variant A)
-- =============================================================================
CREATE OR REPLACE FUNCTION app.caller_is_student_in(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.institution_memberships m
    where m.user_id = (select app.auth_uid())
      and m.membership_role = 'student'::public.membership_role
      and m.status = 'active'::public.membership_status
      and m.deleted_at is null
      and m.left_institution_at is null
      and (
        m.institution_id = p_institution_id
        -- Legacy NULL institution_id rows in courses still need deterministic branching.
        or (p_institution_id is null)
      )
  );
$$;

COMMENT ON FUNCTION app.caller_is_student_in(uuid) IS
  'True if caller is an active student in the given institution; for NULL institution_id, evaluates as active student in any institution.';

CREATE OR REPLACE FUNCTION app.caller_is_active_member_of(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.institution_memberships m
    where m.user_id = (select app.auth_uid())
      and m.status = 'active'::public.membership_status
      and m.deleted_at is null
      and m.left_institution_at is null
      and (
        m.institution_id = p_institution_id
        or (p_institution_id is null)
      )
  );
$$;

COMMENT ON FUNCTION app.caller_is_active_member_of(uuid) IS
  'True if caller has any active membership for the institution; for NULL institution_id, evaluates as active member in any institution.';

CREATE OR REPLACE FUNCTION app.student_can_access_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.classroom_course_links ccl
    inner join public.classroom_members cm
      on cm.classroom_id = ccl.classroom_id
     and cm.user_id = auth.uid()
     and cm.withdrawn_at is null
    where ccl.course_id = p_course_id
      and ccl.deleted_at is null
      and ccl.published_at is not null
      and ccl.institution_id in (select app.member_institution_ids())
  )
$$;

COMMENT ON FUNCTION app.student_can_access_course(uuid) IS
  'True if caller may access this course via published classroom_course_link in an assigned classroom (Variant A; no enrollment required).';

CREATE OR REPLACE FUNCTION app.student_can_access_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.lessons l
    inner join public.topics t on t.id = l.topic_id
    where l.id = p_lesson_id
      and app.student_can_access_course(t.course_id)
  )
$$;

COMMENT ON FUNCTION app.student_can_access_lesson(uuid) IS
  'True if caller may access this lesson via classroom-delivered course access (Variant A).';

-- =============================================================================
-- 1d. Frontend contract (future): tenant-aware membership lookup
-- =============================================================================
CREATE OR REPLACE FUNCTION app.get_my_membership(p_institution_id uuid)
RETURNS TABLE (
  membership_role text,
  status text,
  institution_id uuid,
  institution_name text,
  left_at timestamptz
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  select
    m.membership_role::text as membership_role,
    m.status::text as status,
    m.institution_id,
    i.name as institution_name,
    m.left_institution_at as left_at
  from public.institution_memberships m
  inner join public.institutions i on i.id = m.institution_id
  where m.user_id = (select app.auth_uid())
    and m.institution_id = p_institution_id
    and m.deleted_at is null
  order by m.created_at desc
  limit 1;
$$;

COMMENT ON FUNCTION app.get_my_membership(uuid) IS
  'Returns caller membership context for one institution (role/status/name/left_at). For tenant-aware frontend routing after login.';
