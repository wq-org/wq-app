-- =============================================================================
-- INSTITUTION ADMIN — Tables & Column Additions
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

-- =============================================================================
-- 2. profiles.active_institution_id — "active tenant" context
--    Used by app.current_institution_id(); RLS always verifies membership.
-- =============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_institution_id uuid
    REFERENCES public.institutions (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.active_institution_id IS
  'Currently selected tenant. Convenience column; RLS validates membership independently.';

-- =============================================================================
-- 3. INSTITUTION MEMBERSHIPS — replaces user_institutions for authorization
--    user_institutions is kept for backward compat; new code should use this.
-- =============================================================================
CREATE TABLE public.institution_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  membership_role membership_role NOT NULL DEFAULT 'student',
  status membership_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  left_institution_at timestamptz,
  leave_reason text
);

COMMENT ON TABLE public.institution_memberships IS 'Authoritative user-to-tenant mapping with role and lifecycle status.';
COMMENT ON COLUMN public.institution_memberships.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.institution_memberships.membership_role IS 'Tenant-scoped role (institution_admin | teacher | student).';
COMMENT ON COLUMN public.institution_memberships.status IS 'Lifecycle: invited → active → suspended. Default active; set invited for email invite flows.';
COMMENT ON COLUMN public.institution_memberships.deleted_at IS 'Soft-delete; allows re-invitation.';
COMMENT ON COLUMN public.institution_memberships.left_institution_at IS 'When set, user no longer has tenant access (graduation, transfer, expulsion). Excluded from app.member_institution_ids().';
COMMENT ON COLUMN public.institution_memberships.leave_reason IS 'Optional: year_end, graduated, transfer, expelled, manual, etc.';

-- =============================================================================
-- 6. FACULTIES
-- =============================================================================
CREATE TABLE public.faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT uq_faculties_id_institution_id UNIQUE (id, institution_id)
);

COMMENT ON TABLE public.faculties IS 'Top-level academic division within an institution.';
COMMENT ON COLUMN public.faculties.institution_id IS 'Tenant boundary.';

-- =============================================================================
-- 7. PROGRAMMES
-- =============================================================================
CREATE TABLE public.programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  duration_years integer,
  progression_type text CHECK (progression_type IN ('year_group', 'stage')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT uq_programmes_id_institution_id UNIQUE (id, institution_id),
  CONSTRAINT fk_programmes_faculties FOREIGN KEY (faculty_id, institution_id)
    REFERENCES public.faculties (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE public.programmes IS 'Study programme within a faculty (e.g. Maler & Lackierer, TBK I).';
COMMENT ON COLUMN public.programmes.institution_id IS 'Tenant boundary; must match parent faculty.';
COMMENT ON COLUMN public.programmes.duration_years IS 'Programme length in years.';
COMMENT ON COLUMN public.programmes.progression_type IS 'year_group = annual cohorts, stage = sequential stages.';

-- =============================================================================
-- 8. COHORTS
-- =============================================================================
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  programme_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  academic_year integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT uq_cohorts_id_institution_id UNIQUE (id, institution_id),
  CONSTRAINT fk_cohorts_programmes FOREIGN KEY (programme_id, institution_id)
    REFERENCES public.programmes (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE public.cohorts IS 'Year-group or intake within a programme (e.g. Jahrgang 2024).';
COMMENT ON COLUMN public.cohorts.institution_id IS 'Tenant boundary; must match parent programme.';
COMMENT ON COLUMN public.cohorts.academic_year IS 'Start year for this cohort, e.g. 2024.';

-- =============================================================================
-- 9. CLASS GROUPS
-- =============================================================================
CREATE TABLE public.class_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT uq_class_groups_id_institution_id UNIQUE (id, institution_id),
  CONSTRAINT fk_class_groups_cohorts FOREIGN KEY (cohort_id, institution_id)
    REFERENCES public.cohorts (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE public.class_groups IS 'Operational student group within a cohort (e.g. ML-3A).';
COMMENT ON COLUMN public.class_groups.institution_id IS 'Tenant boundary; must match parent cohort.';

-- =============================================================================
-- 10. INSTITUTION STAFF SCOPES — teacher assignment to faculty / programme
-- =============================================================================
CREATE TABLE public.institution_staff_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  faculty_id uuid,
  programme_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_institution_staff_scopes_faculties FOREIGN KEY (faculty_id, institution_id)
    REFERENCES public.faculties (id, institution_id) ON DELETE CASCADE,
  CONSTRAINT fk_institution_staff_scopes_programmes FOREIGN KEY (programme_id, institution_id)
    REFERENCES public.programmes (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE public.institution_staff_scopes IS
  'Scopes a teacher to a faculty and/or programme within an institution.';

-- =============================================================================
-- 11. CLASSROOMS — minimal governance shell (pedagogy fields in doc 05)
-- =============================================================================
CREATE TABLE public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  class_group_id uuid NOT NULL,
  primary_teacher_id uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_classrooms_class_groups FOREIGN KEY (class_group_id, institution_id)
    REFERENCES public.class_groups (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE public.classrooms IS 'Operational classroom; governance managed here, pedagogy in doc 05.';
COMMENT ON COLUMN public.classrooms.institution_id IS 'Tenant boundary; must match parent class_group.';
COMMENT ON COLUMN public.classrooms.primary_teacher_id IS 'Ownership; can be reassigned by institution admin.';

-- =============================================================================
-- 11b. CLASSROOM_MEMBERS — student/co-teacher assignment + year rollover (doc 05)
-- =============================================================================
CREATE TABLE public.classroom_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  membership_role classroom_member_role NOT NULL DEFAULT 'student',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,
  leave_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_classroom_members_id_institution_id UNIQUE (id, institution_id),
  CONSTRAINT fk_classroom_members_classrooms FOREIGN KEY (classroom_id, institution_id)
    REFERENCES public.classrooms (id, institution_id) ON DELETE CASCADE
);

COMMENT ON TABLE public.classroom_members IS 'Assigns students (and co-teachers) to classrooms; withdrawn_at ends assignment without deleting history (year rollover).';
COMMENT ON COLUMN public.classroom_members.institution_id IS 'Tenant boundary; must match classroom.';
COMMENT ON COLUMN public.classroom_members.withdrawn_at IS 'NULL = active in classroom; set at year-end or transfer to close assignment.';
COMMENT ON COLUMN public.classroom_members.leave_reason IS 'Optional: year_end, transfer, graduated, course_change, manual.';

-- =============================================================================
-- 12. INSTITUTION SETTINGS — one row per institution
-- =============================================================================
CREATE TABLE public.institution_settings (
  institution_id uuid PRIMARY KEY REFERENCES public.institutions (id) ON DELETE CASCADE,
  default_locale text NOT NULL DEFAULT 'de',
  timezone text NOT NULL DEFAULT 'Europe/Berlin',
  retention_policy_code text,
  notification_defaults jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.institution_settings IS 'Per-institution configuration (locale, retention, notifications).';
COMMENT ON COLUMN public.institution_settings.retention_policy_code IS 'References a retention policy; drives deletion pipeline timing.';
COMMENT ON COLUMN public.institution_settings.notification_defaults IS 'Default notification preferences for new users in this institution.';

-- =============================================================================
-- 13. INSTITUTION QUOTAS USAGE — counters maintained by app / triggers
-- =============================================================================
CREATE TABLE public.institution_quotas_usage (
  institution_id uuid PRIMARY KEY REFERENCES public.institutions (id) ON DELETE CASCADE,
  seats_used integer NOT NULL DEFAULT 0,
  storage_used_bytes bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.institution_quotas_usage IS 'Live seat and storage usage counters per institution.';
COMMENT ON COLUMN public.institution_quotas_usage.seats_used IS 'Count of active membership rows.';
COMMENT ON COLUMN public.institution_quotas_usage.storage_used_bytes IS 'Aggregate storage consumed (bytes).';

-- =============================================================================
-- 13f. Email-first invites (no auth user yet) — token link + redemption after signup
-- =============================================================================
CREATE TABLE public.institution_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  email text NOT NULL,
  membership_role public.membership_role NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL,
  invited_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  accepted_at timestamptz,
  accepted_user_id uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_institution_invites_token UNIQUE (token),
  CONSTRAINT chk_institution_invites_membership_role CHECK (
    membership_role IN ('teacher'::public.membership_role, 'student'::public.membership_role)
  )
);

COMMENT ON TABLE public.institution_invites IS
  'Pending email invites when user_id is unknown; app sends token in URL and calls redeem_institution_invite after Auth signup.';
COMMENT ON COLUMN public.institution_invites.token IS 'Secret embedded in invite URL; treat like a magic link.';

-- =============================================================================
-- 14. INSTITUTION INVOICE RECORDS — billing visibility
-- =============================================================================
CREATE TABLE public.institution_invoice_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  external_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  issued_at timestamptz NOT NULL,
  due_at timestamptz,
  paid_at timestamptz,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.institution_invoice_records IS 'Invoice history for billing transparency (external payment processor).';

-- =============================================================================
-- 15. DATA SUBJECT REQUESTS — GDPR export / erasure tracking
-- =============================================================================
CREATE TABLE public.data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  subject_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  request_type text NOT NULL
    CHECK (request_type IN ('access', 'erasure', 'portability', 'rectification')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.data_subject_requests IS
  'GDPR data-subject request tracker. Institution admin initiates; super admin approves.';
