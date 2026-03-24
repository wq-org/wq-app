-- =============================================================================
-- INSTITUTION ADMIN — Indexes & Constraints
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

-- =============================================================================
-- institution_memberships indexes
-- =============================================================================

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

-- =============================================================================
-- faculties indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_faculties_name_unique
  ON public.faculties (institution_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_faculties_institution
  ON public.faculties (institution_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- programmes indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_programmes_name_unique
  ON public.programmes (faculty_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_programmes_institution
  ON public.programmes (institution_id, faculty_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- cohorts indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_cohorts_name_unique
  ON public.cohorts (programme_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_cohorts_institution
  ON public.cohorts (institution_id, programme_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- class_groups indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_class_groups_name_unique
  ON public.class_groups (cohort_id, name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_class_groups_institution
  ON public.class_groups (institution_id, cohort_id)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- institution_staff_scopes indexes
-- =============================================================================
CREATE INDEX idx_staff_scopes_user
  ON public.institution_staff_scopes (user_id, institution_id);
CREATE INDEX idx_staff_scopes_institution
  ON public.institution_staff_scopes (institution_id);

-- =============================================================================
-- classrooms indexes
-- =============================================================================
CREATE INDEX idx_classrooms_institution    ON public.classrooms (institution_id);
CREATE INDEX idx_classrooms_class_group    ON public.classrooms (class_group_id);
CREATE INDEX idx_classrooms_teacher        ON public.classrooms (primary_teacher_id);

-- =============================================================================
-- classroom_members indexes
-- =============================================================================
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

-- =============================================================================
-- institution_invites indexes
-- =============================================================================
CREATE UNIQUE INDEX idx_institution_invites_pending_email
  ON public.institution_invites (institution_id, lower(email))
  WHERE accepted_at IS NULL;

CREATE INDEX idx_institution_invites_institution
  ON public.institution_invites (institution_id)
  WHERE accepted_at IS NULL;

-- =============================================================================
-- institution_invoice_records indexes
-- =============================================================================
CREATE INDEX idx_invoice_records_institution
  ON public.institution_invoice_records (institution_id, issued_at DESC);

-- =============================================================================
-- data_subject_requests indexes
-- =============================================================================
CREATE INDEX idx_dsr_institution
  ON public.data_subject_requests (institution_id, status);
