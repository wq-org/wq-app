-- HETZNER_TEARDOWN: KEEP_CORE
-- Fix: convert drift detector views from implicit SECURITY DEFINER to SECURITY INVOKER
-- so RLS on the underlying tables is evaluated as the querying user, not the view owner.
-- Supabase advisor rule 0010 flags views without security_invoker = true.

-- -----------------------------------------------------------------------------
-- Functions / Views
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.course_enrollment_delivery_drift
    WITH (security_invoker = true) AS
SELECT
    'enrollment_without_delivery_membership'::text AS drift_type,
    ce.student_id AS user_id,
    c.institution_id,
    ce.course_id,
    NULL::uuid AS classroom_id,
    ce.enrolled_at AS evidence_at
FROM public.course_enrollments ce
INNER JOIN public.courses c ON ce.course_id = c.id
WHERE NOT EXISTS (
    SELECT 1
    FROM public.course_deliveries cd
    INNER JOIN public.classroom_members cm ON cd.classroom_id = cm.classroom_id
    WHERE cd.course_id = ce.course_id
        AND cd.institution_id = c.institution_id
        AND cd.deleted_at IS NULL
        AND cd.published_at IS NOT NULL
        AND cm.user_id = ce.student_id
        AND cm.withdrawn_at IS NULL
)
UNION ALL
SELECT
    'delivery_membership_without_enrollment'::text AS drift_type,
    cm.user_id,
    cd.institution_id,
    cd.course_id,
    cd.classroom_id,
    COALESCE(cd.published_at, cd.created_at) AS evidence_at
FROM public.course_deliveries cd
INNER JOIN public.classroom_members cm ON cd.classroom_id = cm.classroom_id
WHERE cd.deleted_at IS NULL
    AND cd.published_at IS NOT NULL
    AND cm.withdrawn_at IS NULL
    AND NOT EXISTS (
        SELECT 1
        FROM public.course_enrollments ce
        WHERE ce.course_id = cd.course_id
            AND ce.student_id = cm.user_id
    );

COMMENT ON VIEW public.course_enrollment_delivery_drift IS
    'Read-only drift detector between legacy course_enrollments and canonical classroom_members + course_deliveries. Runs as security invoker so tenant RLS is enforced.';

CREATE OR REPLACE VIEW public.classroom_link_delivery_drift
    WITH (security_invoker = true) AS
SELECT
    'link_without_delivery'::text AS drift_type,
    ccl.institution_id,
    ccl.classroom_id,
    ccl.course_id,
    ccl.id AS classroom_course_link_id,
    NULL::uuid AS course_delivery_id,
    COALESCE(ccl.published_at, ccl.created_at) AS evidence_at
FROM public.classroom_course_links ccl
WHERE ccl.deleted_at IS NULL
    AND NOT EXISTS (
        SELECT 1
        FROM public.course_deliveries cd
        WHERE cd.legacy_classroom_course_link_id = ccl.id
            AND cd.deleted_at IS NULL
    )
UNION ALL
SELECT
    'delivery_without_link'::text AS drift_type,
    cd.institution_id,
    cd.classroom_id,
    cd.course_id,
    NULL::uuid AS classroom_course_link_id,
    cd.id AS course_delivery_id,
    COALESCE(cd.published_at, cd.created_at) AS evidence_at
FROM public.course_deliveries cd
WHERE cd.deleted_at IS NULL
    AND cd.legacy_classroom_course_link_id IS NULL;

COMMENT ON VIEW public.classroom_link_delivery_drift IS
    'Read-only drift detector between legacy classroom_course_links and canonical course_deliveries. Runs as security invoker so tenant RLS is enforced.';
