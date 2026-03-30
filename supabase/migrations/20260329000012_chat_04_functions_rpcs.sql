-- =============================================================================
-- CHAT — access helpers (membership + contextual eligibility)
-- Requires: 20260329000006_course_delivery_06_functions_rpcs.sql (student_can_access_course_delivery)
-- =============================================================================

CREATE OR REPLACE FUNCTION app.user_in_active_conversation(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members cm
    WHERE cm.conversation_id = p_conversation_id
      AND cm.user_id = (SELECT app.auth_uid())
      AND cm.left_at IS NULL
      AND cm.removed_at IS NULL
  );
$$;

COMMENT ON FUNCTION app.user_in_active_conversation(uuid) IS
  'True if caller is an active member (not left, not removed) of the conversation.';

CREATE OR REPLACE FUNCTION app.caller_eligible_for_conversation_context(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT
        CASE
          WHEN
            cc.classroom_id IS NULL
            AND cc.course_delivery_id IS NULL
            AND cc.task_id IS NULL
            AND cc.game_session_id IS NULL
          THEN TRUE
          WHEN cc.classroom_id IS NOT NULL THEN EXISTS (
            SELECT 1
            FROM public.classroom_members cm
            WHERE cm.classroom_id = cc.classroom_id
              AND cm.user_id = (SELECT app.auth_uid())
              AND cm.withdrawn_at IS NULL
          )
          WHEN cc.course_delivery_id IS NOT NULL THEN (
            (SELECT app.student_can_access_course_delivery(cc.course_delivery_id))
            OR EXISTS (
              SELECT 1
              FROM public.course_deliveries cd
              INNER JOIN public.classrooms cr ON cr.id = cd.classroom_id
              WHERE cd.id = cc.course_delivery_id
                AND (
                  cr.primary_teacher_id = (SELECT app.auth_uid())
                  OR EXISTS (
                    SELECT 1
                    FROM public.classroom_members cm
                    WHERE cm.classroom_id = cd.classroom_id
                      AND cm.user_id = (SELECT app.auth_uid())
                      AND cm.withdrawn_at IS NULL
                      AND cm.membership_role = 'co_teacher'::public.classroom_member_role
                  )
                )
            )
            OR EXISTS (
              SELECT 1
              FROM public.course_deliveries cd
              INNER JOIN public.courses c ON c.id = cd.course_id
              WHERE cd.id = cc.course_delivery_id
                AND c.teacher_id = (SELECT app.auth_uid())
            )
            OR cc.institution_id IN (SELECT app.admin_institution_ids())
          )
          WHEN cc.task_id IS NOT NULL THEN EXISTS (
            SELECT 1
            FROM public.tasks t
            WHERE t.id = cc.task_id
              AND (
                t.institution_id IN (SELECT app.admin_institution_ids())
                OR t.teacher_id = (SELECT app.auth_uid())
                OR EXISTS (
                  SELECT 1
                  FROM public.classroom_members cm
                  WHERE cm.classroom_id = t.classroom_id
                    AND cm.user_id = (SELECT app.auth_uid())
                    AND cm.withdrawn_at IS NULL
                )
              )
          )
          WHEN cc.game_session_id IS NOT NULL THEN EXISTS (
            SELECT 1
            FROM public.game_sessions gs
            INNER JOIN public.game_runs gr ON gr.id = gs.game_run_id
            WHERE gs.id = cc.game_session_id
              AND (
                gr.institution_id IN (SELECT app.admin_institution_ids())
                OR gr.started_by = (SELECT app.auth_uid())
                OR EXISTS (
                  SELECT 1
                  FROM public.game_session_participants gsp
                  WHERE gsp.game_session_id = gs.id
                    AND gsp.user_id = (SELECT app.auth_uid())
                )
                OR (
                  gr.classroom_id IS NOT NULL
                  AND EXISTS (
                    SELECT 1
                    FROM public.classroom_members cm
                    WHERE cm.classroom_id = gr.classroom_id
                      AND cm.user_id = (SELECT app.auth_uid())
                      AND cm.withdrawn_at IS NULL
                  )
                )
              )
          )
          ELSE FALSE
        END
      FROM public.conversation_contexts cc
      WHERE cc.conversation_id = p_conversation_id
    ),
    TRUE
  );
$$;

COMMENT ON FUNCTION app.caller_eligible_for_conversation_context(uuid) IS
  'True if conversation has no context row, unbound context, or caller satisfies classroom/delivery/task/game binding.';
