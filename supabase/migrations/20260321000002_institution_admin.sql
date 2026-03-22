-- =============================================================================
-- INSTITUTION ADMIN — Tenant plane (docs 02_Institution, 01/14 consumers)
--
-- Doc map:
--   02_Institution.md → institution_memberships, faculties → class_groups, staff_scopes,
--                      classrooms, institution_settings, quotas_usage, invoice records,
--                      data_subject_requests, multitenant institutions RLS.
--   01 / 14 → read policies on institution_subscriptions, institution_entitlement_overrides,
--              billing_providers (this file); platform DDL in 20260321000001.
--
-- Requires: 20260209000002_super_admin (app helpers), 20260321000001_super_admin
-- =============================================================================

-- =============================================================================
-- 1. ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE membership_role AS ENUM ('institution_admin', 'teacher', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('invited', 'active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 2. profiles.active_institution_id — "active tenant" context
--    Used by app.current_institution_id(); RLS always verifies membership.
-- =============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_institution_id uuid
    REFERENCES public.institutions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.active_institution_id IS
  'Currently selected tenant. Convenience column; RLS validates membership independently.';

-- =============================================================================
-- 3. INSTITUTION MEMBERSHIPS — replaces user_institutions for authorization
--    user_institutions is kept for backward compat; new code should use this.
-- =============================================================================
CREATE TABLE public.institution_memberships (
  id                  uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid              NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  institution_id      uuid              NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  membership_role     membership_role   NOT NULL DEFAULT 'student',
  status              membership_status NOT NULL DEFAULT 'active',
  created_at          timestamptz       NOT NULL DEFAULT now(),
  updated_at          timestamptz       NOT NULL DEFAULT now(),
  deleted_at          timestamptz,
  left_institution_at timestamptz,
  leave_reason        text
);

COMMENT ON TABLE  public.institution_memberships                   IS 'Authoritative user-to-tenant mapping with role and lifecycle status.';
COMMENT ON COLUMN public.institution_memberships.institution_id    IS 'Tenant boundary.';
COMMENT ON COLUMN public.institution_memberships.membership_role   IS 'Tenant-scoped role (institution_admin | teacher | student).';
COMMENT ON COLUMN public.institution_memberships.status            IS 'Lifecycle: invited → active → suspended. Default active; set invited for email invite flows.';
COMMENT ON COLUMN public.institution_memberships.deleted_at        IS 'Soft-delete; allows re-invitation.';
COMMENT ON COLUMN public.institution_memberships.left_institution_at IS 'When set, user no longer has tenant access (graduation, transfer, expulsion). Excluded from app.member_institution_ids().';
COMMENT ON COLUMN public.institution_memberships.leave_reason      IS 'Optional: year_end, graduated, transfer, expelled, manual, etc.';

-- Active-unique: one active membership per (user, institution).
CREATE UNIQUE INDEX idx_memberships_active_unique
  ON public.institution_memberships (user_id, institution_id)
  WHERE deleted_at IS NULL;

-- RLS-hot path: "which institutions does this user admin / belong to?"
CREATE INDEX idx_memberships_user_role
  ON public.institution_memberships (user_id, membership_role)
  WHERE status = 'active' AND deleted_at IS NULL AND left_institution_at IS NULL;

CREATE INDEX idx_memberships_institution
  ON public.institution_memberships (institution_id)
  WHERE deleted_at IS NULL;

-- Backfill from legacy user_institutions (safe for fresh and existing DBs).
INSERT INTO public.institution_memberships
  (user_id, institution_id, membership_role, status, created_at)
SELECT
  ui.user_id,
  ui.institution_id,
  CASE
    WHEN p.role = 'institution_admin' THEN 'institution_admin'::membership_role
    WHEN p.role = 'teacher'           THEN 'teacher'::membership_role
    ELSE 'student'::membership_role
  END,
  'active'::membership_status,
  COALESCE(ui.joined_at, now())
FROM public.user_institutions ui
JOIN public.profiles p ON p.user_id = ui.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.institution_memberships m
  WHERE m.user_id = ui.user_id
    AND m.institution_id = ui.institution_id
    AND m.deleted_at IS NULL
);

COMMENT ON TABLE public.user_institutions IS
  'DEPRECATED — use institution_memberships. Kept for backward compat during transition.';

-- =============================================================================
-- 4. APP HELPERS — depend on institution_memberships
-- =============================================================================

-- Set-returning: use in policies as institution_id IN (select app.xxx())
-- for initPlan-cached evaluation.
CREATE OR REPLACE FUNCTION app.admin_institution_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select m.institution_id
  from public.institution_memberships m
  where m.user_id = auth.uid()
    and m.membership_role = 'institution_admin'
    and m.status = 'active'
    and m.deleted_at is null
    and m.left_institution_at is null
$$;

CREATE OR REPLACE FUNCTION app.member_institution_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select m.institution_id
  from public.institution_memberships m
  where m.user_id = auth.uid()
    and m.status = 'active'
    and m.deleted_at is null
    and m.left_institution_at is null
$$;

COMMENT ON FUNCTION app.admin_institution_ids() IS
  'Institution IDs where the caller is an active institution_admin. Use in RLS IN-subqueries.';
COMMENT ON FUNCTION app.member_institution_ids() IS
  'Institution IDs where the caller has any active membership. Use in RLS IN-subqueries.';

-- Scalar helpers: for RPC / application code.
CREATE OR REPLACE FUNCTION app.is_institution_admin(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1 from public.institution_memberships m
    where m.institution_id = p_institution_id
      and m.user_id = auth.uid()
      and m.membership_role = 'institution_admin'
      and m.status = 'active'
      and m.deleted_at is null
      and m.left_institution_at is null
  )
$$;

CREATE OR REPLACE FUNCTION app.is_institution_member(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1 from public.institution_memberships m
    where m.institution_id = p_institution_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.deleted_at is null
      and m.left_institution_at is null
  )
$$;

CREATE OR REPLACE FUNCTION app.current_institution_id()
RETURNS uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select active_institution_id
  from public.profiles
  where user_id = auth.uid()
$$;

COMMENT ON FUNCTION app.is_institution_admin(uuid) IS
  'True when caller is an active institution_admin for the given institution.';
COMMENT ON FUNCTION app.is_institution_member(uuid) IS
  'True when caller has any active membership in the given institution.';
COMMENT ON FUNCTION app.current_institution_id() IS
  'Returns the caller''s active_institution_id from profiles.';

-- =============================================================================
-- 5. INSTITUTION MEMBERSHIPS — RLS
-- =============================================================================
ALTER TABLE public.institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY memberships_super_admin ON public.institution_memberships
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY memberships_institution_admin ON public.institution_memberships
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY memberships_own_read ON public.institution_memberships
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

DROP TRIGGER IF EXISTS memberships_updated_at ON public.institution_memberships;
CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON public.institution_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 5b. INSTITUTIONS — multitenant RLS (source of truth; replaces baseline + Feb)
--     Super admin: full access. Members: read own tenants (not soft-deleted).
--     Institution admins: update their tenant row; cannot set deleted_at via RLS check.
-- =============================================================================
DROP POLICY IF EXISTS "Everyone can view institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins and SuperAdmin can manage institutions" ON public.institutions;

CREATE POLICY institutions_super_admin ON public.institutions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY institutions_member_select ON public.institutions
  FOR SELECT TO authenticated
  USING (
    deleted_at is null
    AND id in (select app.member_institution_ids())
  );

CREATE POLICY institutions_admin_update ON public.institutions
  FOR UPDATE TO authenticated
  USING (
    deleted_at is null
    AND id in (select app.admin_institution_ids())
  )
  WITH CHECK (
    deleted_at is null
    AND id in (select app.admin_institution_ids())
  );

-- =============================================================================
-- 6. FACULTIES
-- =============================================================================
CREATE TABLE public.faculties (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  description     text,
  sort_order      integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  CONSTRAINT faculties_inst_unique UNIQUE (id, institution_id)
);

COMMENT ON TABLE  public.faculties                IS 'Top-level academic division within an institution.';
COMMENT ON COLUMN public.faculties.institution_id IS 'Tenant boundary.';

CREATE UNIQUE INDEX idx_faculties_name_unique
  ON public.faculties (institution_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_faculties_institution
  ON public.faculties (institution_id)
  WHERE deleted_at IS NULL;

ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties FORCE ROW LEVEL SECURITY;

CREATE POLICY faculties_super_admin ON public.faculties
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY faculties_institution_admin ON public.faculties
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY faculties_member_read ON public.faculties
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

DROP TRIGGER IF EXISTS faculties_updated_at ON public.faculties;
CREATE TRIGGER faculties_updated_at
  BEFORE UPDATE ON public.faculties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 7. PROGRAMMES
-- =============================================================================
CREATE TABLE public.programmes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id   uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  faculty_id       uuid        NOT NULL,
  name             text        NOT NULL,
  description      text,
  duration_years   integer,
  progression_type text        CHECK (progression_type IN ('year_group', 'stage')),
  sort_order       integer     NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,
  CONSTRAINT programmes_inst_unique   UNIQUE (id, institution_id),
  CONSTRAINT programmes_faculty_fk   FOREIGN KEY (faculty_id, institution_id)
    REFERENCES public.faculties (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE  public.programmes                   IS 'Study programme within a faculty (e.g. Maler & Lackierer, TBK I).';
COMMENT ON COLUMN public.programmes.institution_id    IS 'Tenant boundary; must match parent faculty.';
COMMENT ON COLUMN public.programmes.duration_years    IS 'Programme length in years.';
COMMENT ON COLUMN public.programmes.progression_type  IS 'year_group = annual cohorts, stage = sequential stages.';

CREATE UNIQUE INDEX idx_programmes_name_unique
  ON public.programmes (faculty_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_programmes_institution
  ON public.programmes (institution_id, faculty_id)
  WHERE deleted_at IS NULL;

ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes FORCE ROW LEVEL SECURITY;

CREATE POLICY programmes_super_admin ON public.programmes
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY programmes_institution_admin ON public.programmes
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY programmes_member_read ON public.programmes
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

DROP TRIGGER IF EXISTS programmes_updated_at ON public.programmes;
CREATE TRIGGER programmes_updated_at
  BEFORE UPDATE ON public.programmes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 8. COHORTS
-- =============================================================================
CREATE TABLE public.cohorts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  programme_id    uuid        NOT NULL,
  name            text        NOT NULL,
  description     text,
  academic_year   integer,
  sort_order      integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  CONSTRAINT cohorts_inst_unique      UNIQUE (id, institution_id),
  CONSTRAINT cohorts_programme_fk     FOREIGN KEY (programme_id, institution_id)
    REFERENCES public.programmes (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE  public.cohorts                IS 'Year-group or intake within a programme (e.g. Jahrgang 2024).';
COMMENT ON COLUMN public.cohorts.institution_id IS 'Tenant boundary; must match parent programme.';
COMMENT ON COLUMN public.cohorts.academic_year  IS 'Start year for this cohort, e.g. 2024.';

CREATE UNIQUE INDEX idx_cohorts_name_unique
  ON public.cohorts (programme_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_cohorts_institution
  ON public.cohorts (institution_id, programme_id)
  WHERE deleted_at IS NULL;

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts FORCE ROW LEVEL SECURITY;

CREATE POLICY cohorts_super_admin ON public.cohorts
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY cohorts_institution_admin ON public.cohorts
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY cohorts_member_read ON public.cohorts
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

DROP TRIGGER IF EXISTS cohorts_updated_at ON public.cohorts;
CREATE TRIGGER cohorts_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 9. CLASS GROUPS
-- =============================================================================
CREATE TABLE public.class_groups (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  cohort_id       uuid        NOT NULL,
  name            text        NOT NULL,
  description     text,
  sort_order      integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  CONSTRAINT class_groups_inst_unique UNIQUE (id, institution_id),
  CONSTRAINT class_groups_cohort_fk   FOREIGN KEY (cohort_id, institution_id)
    REFERENCES public.cohorts (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE  public.class_groups                IS 'Operational student group within a cohort (e.g. ML-3A).';
COMMENT ON COLUMN public.class_groups.institution_id IS 'Tenant boundary; must match parent cohort.';

CREATE UNIQUE INDEX idx_class_groups_name_unique
  ON public.class_groups (cohort_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_class_groups_institution
  ON public.class_groups (institution_id, cohort_id)
  WHERE deleted_at IS NULL;

ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_groups FORCE ROW LEVEL SECURITY;

CREATE POLICY class_groups_super_admin ON public.class_groups
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY class_groups_institution_admin ON public.class_groups
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY class_groups_member_read ON public.class_groups
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

DROP TRIGGER IF EXISTS class_groups_updated_at ON public.class_groups;
CREATE TRIGGER class_groups_updated_at
  BEFORE UPDATE ON public.class_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 10. INSTITUTION STAFF SCOPES — teacher assignment to faculty / programme
-- =============================================================================
CREATE TABLE public.institution_staff_scopes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  faculty_id      uuid,
  programme_id    uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_scope_faculty_inst_fk   FOREIGN KEY (faculty_id, institution_id)
    REFERENCES public.faculties (id, institution_id) ON DELETE CASCADE,
  CONSTRAINT staff_scope_programme_inst_fk FOREIGN KEY (programme_id, institution_id)
    REFERENCES public.programmes (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE  public.institution_staff_scopes IS
  'Scopes a teacher to a faculty and/or programme within an institution.';

CREATE INDEX idx_staff_scopes_user
  ON public.institution_staff_scopes (user_id, institution_id);
CREATE INDEX idx_staff_scopes_institution
  ON public.institution_staff_scopes (institution_id);

ALTER TABLE public.institution_staff_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_staff_scopes FORCE ROW LEVEL SECURITY;

CREATE POLICY staff_scopes_super_admin ON public.institution_staff_scopes
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY staff_scopes_institution_admin ON public.institution_staff_scopes
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY staff_scopes_own_read ON public.institution_staff_scopes
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

DROP TRIGGER IF EXISTS staff_scopes_updated_at ON public.institution_staff_scopes;
CREATE TRIGGER staff_scopes_updated_at
  BEFORE UPDATE ON public.institution_staff_scopes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 11. CLASSROOMS — minimal governance shell (pedagogy fields in doc 05)
-- =============================================================================
CREATE TABLE public.classrooms (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id      uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  class_group_id      uuid        NOT NULL,
  primary_teacher_id  uuid        REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  title               text        NOT NULL,
  status              text        NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  deactivated_at      timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classrooms_class_group_fk FOREIGN KEY (class_group_id, institution_id)
    REFERENCES public.class_groups (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE  public.classrooms                    IS 'Operational classroom; governance managed here, pedagogy in doc 05.';
COMMENT ON COLUMN public.classrooms.institution_id     IS 'Tenant boundary; must match parent class_group.';
COMMENT ON COLUMN public.classrooms.primary_teacher_id IS 'Ownership; can be reassigned by institution admin.';

CREATE INDEX idx_classrooms_institution    ON public.classrooms (institution_id);
CREATE INDEX idx_classrooms_class_group    ON public.classrooms (class_group_id);
CREATE INDEX idx_classrooms_teacher        ON public.classrooms (primary_teacher_id);

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms FORCE ROW LEVEL SECURITY;

CREATE POLICY classrooms_super_admin ON public.classrooms
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY classrooms_institution_admin ON public.classrooms
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY classrooms_member_read ON public.classrooms
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

DROP TRIGGER IF EXISTS classrooms_updated_at ON public.classrooms;
CREATE TRIGGER classrooms_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 11b. CLASSROOM_MEMBERS — student/co-teacher assignment + year rollover (doc 05)
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE classroom_member_role AS ENUM ('student', 'co_teacher');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE public.classroom_members (
  id              uuid                   PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid                   NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid                   NOT NULL,
  user_id         uuid                   NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  membership_role classroom_member_role  NOT NULL DEFAULT 'student',
  enrolled_at     timestamptz            NOT NULL DEFAULT now(),
  withdrawn_at    timestamptz,
  leave_reason    text,
  created_at      timestamptz            NOT NULL DEFAULT now(),
  updated_at      timestamptz            NOT NULL DEFAULT now(),
  CONSTRAINT classroom_members_inst_unique UNIQUE (id, institution_id),
  CONSTRAINT classroom_members_classroom_fk FOREIGN KEY (classroom_id, institution_id)
    REFERENCES public.classrooms (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE  public.classroom_members                IS 'Assigns students (and co-teachers) to classrooms; withdrawn_at ends assignment without deleting history (year rollover).';
COMMENT ON COLUMN public.classroom_members.institution_id IS 'Tenant boundary; must match classroom.';
COMMENT ON COLUMN public.classroom_members.withdrawn_at   IS 'NULL = active in classroom; set at year-end or transfer to close assignment.';
COMMENT ON COLUMN public.classroom_members.leave_reason   IS 'Optional: year_end, transfer, graduated, course_change, manual.';

CREATE UNIQUE INDEX idx_classroom_members_active_unique
  ON public.classroom_members (classroom_id, user_id)
  WHERE withdrawn_at IS NULL;

CREATE INDEX idx_classroom_members_user_active
  ON public.classroom_members (user_id)
  WHERE withdrawn_at IS NULL;

CREATE INDEX idx_classroom_members_classroom
  ON public.classroom_members (classroom_id)
  WHERE withdrawn_at IS NULL;

CREATE INDEX idx_classroom_members_institution
  ON public.classroom_members (institution_id);

ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members FORCE ROW LEVEL SECURITY;

CREATE POLICY classroom_members_super_admin ON public.classroom_members
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY classroom_members_institution_admin ON public.classroom_members
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY classroom_members_primary_teacher_manage ON public.classroom_members
  FOR ALL TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
  )
  WITH CHECK (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
    AND institution_id IN (
      SELECT cr2.institution_id FROM public.classrooms cr2
      WHERE cr2.id = classroom_id
    )
  );

CREATE POLICY classroom_members_own_read ON public.classroom_members
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

CREATE POLICY classroom_members_teacher_roster_read ON public.classroom_members
  FOR SELECT TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm_lead
      WHERE cm_lead.classroom_id = classroom_members.classroom_id
        AND cm_lead.user_id = (select app.auth_uid())
        AND cm_lead.withdrawn_at IS NULL
        AND cm_lead.membership_role = 'co_teacher'::public.classroom_member_role
    )
  );

DROP TRIGGER IF EXISTS classroom_members_updated_at ON public.classroom_members;
CREATE TRIGGER classroom_members_updated_at
  BEFORE UPDATE ON public.classroom_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Tighten classroom visibility now that classroom_members exists.
DROP POLICY IF EXISTS classrooms_member_read ON public.classrooms;
CREATE POLICY classrooms_scoped_read ON public.classrooms
  FOR SELECT TO authenticated
  USING (
    institution_id in (select app.member_institution_ids())
    AND (
      primary_teacher_id = (select app.auth_uid())
      OR EXISTS (
        SELECT 1 FROM public.classroom_members cm
        WHERE cm.classroom_id = classrooms.id
          AND cm.user_id = (select app.auth_uid())
          AND cm.withdrawn_at IS NULL
      )
    )
  );

-- =============================================================================
-- 11c. APP HELPERS — classroom scoping (student_can_access_* in Phase B after ccl exists)
-- =============================================================================
CREATE OR REPLACE FUNCTION app.my_active_classroom_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select cm.classroom_id
  from public.classroom_members cm
  where cm.user_id = auth.uid()
    and cm.withdrawn_at is null
$$;

COMMENT ON FUNCTION app.my_active_classroom_ids() IS
  'Classroom IDs where the caller has an active (non-withdrawn) classroom_members row.';

-- =============================================================================
-- 12. INSTITUTION SETTINGS — one row per institution
-- =============================================================================
CREATE TABLE public.institution_settings (
  institution_id       uuid        PRIMARY KEY REFERENCES public.institutions(id) ON DELETE CASCADE,
  default_locale       text        NOT NULL DEFAULT 'de',
  timezone             text        NOT NULL DEFAULT 'Europe/Berlin',
  retention_policy_code text,
  notification_defaults jsonb,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.institution_settings                      IS 'Per-institution configuration (locale, retention, notifications).';
COMMENT ON COLUMN public.institution_settings.retention_policy_code IS 'References a retention policy; drives deletion pipeline timing.';
COMMENT ON COLUMN public.institution_settings.notification_defaults IS 'Default notification preferences for new users in this institution.';

ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_settings FORCE ROW LEVEL SECURITY;

CREATE POLICY inst_settings_super_admin ON public.institution_settings
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY inst_settings_institution_admin ON public.institution_settings
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY inst_settings_member_read ON public.institution_settings
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

DROP TRIGGER IF EXISTS inst_settings_updated_at ON public.institution_settings;
CREATE TRIGGER inst_settings_updated_at
  BEFORE UPDATE ON public.institution_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 13. INSTITUTION QUOTAS USAGE — counters maintained by app / triggers
-- =============================================================================
CREATE TABLE public.institution_quotas_usage (
  institution_id     uuid    PRIMARY KEY REFERENCES public.institutions(id) ON DELETE CASCADE,
  seats_used         integer NOT NULL DEFAULT 0,
  storage_used_bytes bigint  NOT NULL DEFAULT 0,
  updated_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.institution_quotas_usage                IS 'Live seat and storage usage counters per institution.';
COMMENT ON COLUMN public.institution_quotas_usage.seats_used     IS 'Count of active membership rows.';
COMMENT ON COLUMN public.institution_quotas_usage.storage_used_bytes IS 'Aggregate storage consumed (bytes).';

ALTER TABLE public.institution_quotas_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_quotas_usage FORCE ROW LEVEL SECURITY;

CREATE POLICY quotas_super_admin ON public.institution_quotas_usage
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY quotas_institution_admin ON public.institution_quotas_usage
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

DROP TRIGGER IF EXISTS quotas_updated_at ON public.institution_quotas_usage;
CREATE TRIGGER quotas_updated_at
  BEFORE UPDATE ON public.institution_quotas_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 13b. Bootstrap — super_admin creates tenant + first active institution_admin
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_institution_with_initial_admin(
  p_name text,
  p_initial_admin_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_institution_id uuid;
  v_admin_id       uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT (SELECT app.is_super_admin()) THEN
    RAISE EXCEPTION 'Forbidden: only super_admin may create institutions';
  END IF;

  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'p_name is required';
  END IF;

  v_admin_id := coalesce(p_initial_admin_user_id, auth.uid());

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_admin_id) THEN
    RAISE EXCEPTION 'initial admin profile not found';
  END IF;

  INSERT INTO public.institutions (name)
  VALUES (btrim(p_name))
  RETURNING id INTO v_institution_id;

  INSERT INTO public.institution_memberships (
    user_id, institution_id, membership_role, status
  )
  VALUES (
    v_admin_id, v_institution_id, 'institution_admin'::membership_role, 'active'::membership_status
  );

  INSERT INTO public.user_institutions (user_id, institution_id)
  VALUES (v_admin_id, v_institution_id)
  ON CONFLICT (user_id, institution_id) DO NOTHING;

  INSERT INTO public.institution_settings (institution_id)
  VALUES (v_institution_id);

  INSERT INTO public.institution_quotas_usage (institution_id)
  VALUES (v_institution_id);

  -- Default trial subscription when plan_catalog row code=trial exists (doc 14; seed in file 1).
  INSERT INTO public.institution_subscriptions (
    institution_id,
    plan_id,
    billing_status,
    trial_ends_at,
    effective_from
  )
  SELECT
    v_institution_id,
    pc.id,
    'trialing'::billing_status,
    now() + interval '90 days',
    now()
  FROM public.plan_catalog pc
  WHERE pc.code = 'trial'
    AND pc.deleted_at IS NULL
    AND pc.is_active = true
  LIMIT 1;

  RETURN v_institution_id;
END;
$$;

COMMENT ON FUNCTION public.create_institution_with_initial_admin(text, uuid) IS
  'Super admin only: creates institution, institution_admin membership, legacy user_institutions row, settings, quotas, and trial subscription if plan trial exists.';

REVOKE ALL ON FUNCTION public.create_institution_with_initial_admin(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_institution_with_initial_admin(text, uuid) TO authenticated;

-- =============================================================================
-- 14. INSTITUTION INVOICE RECORDS — billing visibility
-- =============================================================================
CREATE TABLE public.institution_invoice_records (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  external_id     text,
  amount_cents    integer     NOT NULL,
  currency        text        NOT NULL DEFAULT 'EUR',
  issued_at       timestamptz NOT NULL,
  due_at          timestamptz,
  paid_at         timestamptz,
  status          text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.institution_invoice_records IS 'Invoice history for billing transparency (external payment processor).';

CREATE INDEX idx_invoice_records_institution
  ON public.institution_invoice_records (institution_id, issued_at DESC);

ALTER TABLE public.institution_invoice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_invoice_records FORCE ROW LEVEL SECURITY;

CREATE POLICY invoice_records_super_admin ON public.institution_invoice_records
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY invoice_records_institution_admin ON public.institution_invoice_records
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

DROP TRIGGER IF EXISTS invoice_records_updated_at ON public.institution_invoice_records;
CREATE TRIGGER invoice_records_updated_at
  BEFORE UPDATE ON public.institution_invoice_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 15. DATA SUBJECT REQUESTS — GDPR export / erasure tracking
-- =============================================================================
CREATE TABLE public.data_subject_requests (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  subject_user_id uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  request_type    text        NOT NULL
    CHECK (request_type IN ('access', 'erasure', 'portability', 'rectification')),
  status          text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  notes           text,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.data_subject_requests IS
  'GDPR data-subject request tracker. Institution admin initiates; super admin approves.';

CREATE INDEX idx_dsr_institution
  ON public.data_subject_requests (institution_id, status);

ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests FORCE ROW LEVEL SECURITY;

CREATE POLICY dsr_super_admin ON public.data_subject_requests
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY dsr_institution_admin ON public.data_subject_requests
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

DROP TRIGGER IF EXISTS dsr_updated_at ON public.data_subject_requests;
CREATE TRIGGER dsr_updated_at
  BEFORE UPDATE ON public.data_subject_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 16. ADDITIONAL RLS — institution-admin / member reads on platform tables (file 1)
-- =============================================================================

DROP POLICY IF EXISTS inst_subs_institution_admin ON public.institution_subscriptions;
CREATE POLICY inst_subs_institution_admin ON public.institution_subscriptions
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

-- Members read entitlement overrides for effective feature resolution (doc 14 §7).
DROP POLICY IF EXISTS inst_entitlement_overrides_member_read ON public.institution_entitlement_overrides;
CREATE POLICY inst_entitlement_overrides_member_read ON public.institution_entitlement_overrides
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- Institution admins see PSP linkage for their tenant (doc 14 §8.6).
DROP POLICY IF EXISTS billing_providers_institution_admin_select ON public.billing_providers;
CREATE POLICY billing_providers_institution_admin_select ON public.billing_providers
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));
