-- =============================================================================
-- INSTITUTION ADMIN — Indexes & Constraints
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

-- =============================================================================
-- institution_memberships indexes
-- =============================================================================

-- Active-unique: one active membership per (user, institution).
CREATE UNIQUE INDEX idx_institution_memberships_user_id_institution_id_active
  ON public.institution_memberships (user_id, institution_id)
  WHERE deleted_at IS NULL;

-- RLS-hot path: "which institutions does this user admin / belong to?"
CREATE INDEX idx_institution_memberships_user_id_membership_role
  ON public.institution_memberships (user_id, membership_role)
  WHERE status = 'active' AND deleted_at IS NULL AND left_institution_at IS NULL;

CREATE INDEX idx_institution_memberships_institution_id
  ON public.institution_memberships (institution_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- faculties indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_faculties_institution_id_name
  ON public.faculties (institution_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_faculties_institution_id
  ON public.faculties (institution_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- programmes indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_programmes_faculty_id_name
  ON public.programmes (faculty_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_programmes_institution_id_faculty_id
  ON public.programmes (institution_id, faculty_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- cohorts indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_cohorts_programme_id_name
  ON public.cohorts (programme_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_cohorts_institution_id_programme_id
  ON public.cohorts (institution_id, programme_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- class_groups indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_class_groups_cohort_id_name
  ON public.class_groups (cohort_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_class_groups_institution_id_cohort_id
  ON public.class_groups (institution_id, cohort_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- institution_staff_scopes indexes
-- =============================================================================
CREATE INDEX idx_institution_staff_scopes_user_id_institution_id
  ON public.institution_staff_scopes (user_id, institution_id);
CREATE INDEX idx_institution_staff_scopes_institution_id
  ON public.institution_staff_scopes (institution_id);

-- =============================================================================
-- classrooms indexes
-- =============================================================================
CREATE INDEX idx_classrooms_institution_id    ON public.classrooms (institution_id);
CREATE INDEX idx_classrooms_class_group_id    ON public.classrooms (class_group_id);
CREATE INDEX idx_classrooms_primary_teacher_id        ON public.classrooms (primary_teacher_id);

-- =============================================================================
-- classroom_members indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_classroom_members_classroom_id_user_id_active
  ON public.classroom_members (classroom_id, user_id)
  WHERE withdrawn_at IS NULL;

CREATE INDEX idx_classroom_members_user_id_active
  ON public.classroom_members (user_id)
  WHERE withdrawn_at IS NULL;

CREATE INDEX idx_classroom_members_classroom_id
  ON public.classroom_members (classroom_id)
  WHERE withdrawn_at IS NULL;

CREATE INDEX idx_classroom_members_institution_id
  ON public.classroom_members (institution_id);

-- =============================================================================
-- institution_invites indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_institution_invites_institution_id_email_pending
  ON public.institution_invites (institution_id, lower(email))
  WHERE accepted_at IS NULL;

CREATE INDEX idx_institution_invites_institution_id_pending
  ON public.institution_invites (institution_id)
  WHERE accepted_at IS NULL;

-- =============================================================================
-- institution_invoice_records indexes
-- =============================================================================
CREATE INDEX idx_institution_invoice_records_institution_id_issued_at
  ON public.institution_invoice_records (institution_id, issued_at DESC);

-- =============================================================================
-- data_subject_requests indexes
-- =============================================================================
CREATE INDEX idx_data_subject_requests_institution_id_status
  ON public.data_subject_requests (institution_id, status);
