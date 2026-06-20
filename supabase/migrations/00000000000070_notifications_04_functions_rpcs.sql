-- =============================================================================
-- NOTIFICATIONS — emit RPC + events audit trigger function
-- Audit per docs/architecture/principle_dsgvo_audit_datendefinition.md:
--   * metadata.visibility_level always set
--   * free-text title/body never logged
-- user_notifications read/dismiss state is NOT audited (per-user UI noise).
-- Requires: 20260000000070_notifications_03_indexes_constraints.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION app.notification_user_can_emit_for_institution(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT
    (SELECT app.is_super_admin()) IS TRUE
    OR p_institution_id IN (SELECT app.admin_institution_ids())
    OR p_institution_id IN (SELECT app.member_institution_ids());
$$;

COMMENT ON FUNCTION app.notification_user_can_emit_for_institution(uuid) IS
  'True if caller may create notification events for this institution (member, institution admin, or super admin).';

CREATE OR REPLACE FUNCTION public.emit_notification(
  p_institution_id uuid,
  p_event_type text,
  p_title text,
  p_body text,
  p_recipient_user_ids uuid[],
  p_actor_user_id uuid DEFAULT NULL,
  p_dedupe_key text DEFAULT NULL,
  p_link_payload jsonb DEFAULT NULL,
  p_classroom_id uuid DEFAULT NULL,
  p_course_delivery_id uuid DEFAULT NULL,
  p_task_delivery_id uuid DEFAULT NULL,
  p_game_session_id uuid DEFAULT NULL,
  p_conversation_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_event_id uuid;
  v_uid uuid;
BEGIN
  IF NOT (SELECT app.notification_user_can_emit_for_institution(p_institution_id)) THEN
    RAISE EXCEPTION 'not authorized to emit notifications for this institution';
  END IF;

  IF p_dedupe_key IS NOT NULL THEN
    SELECT ne.id INTO v_event_id
    FROM public.notification_events ne
    WHERE ne.institution_id = p_institution_id
      AND ne.dedupe_key = p_dedupe_key;
    IF v_event_id IS NOT NULL THEN
      RETURN v_event_id;
    END IF;
  END IF;

  INSERT INTO public.notification_events (
    institution_id,
    event_type,
    actor_user_id,
    title,
    body,
    dedupe_key,
    link_payload,
    classroom_id,
    course_delivery_id,
    task_delivery_id,
    game_session_id,
    conversation_id
  )
  VALUES (
    p_institution_id,
    p_event_type,
    p_actor_user_id,
    p_title,
    p_body,
    p_dedupe_key,
    p_link_payload,
    p_classroom_id,
    p_course_delivery_id,
    p_task_delivery_id,
    p_game_session_id,
    p_conversation_id
  )
  RETURNING id INTO v_event_id;

  FOREACH v_uid IN ARRAY p_recipient_user_ids
  LOOP
    IF v_uid IS NOT NULL THEN
      INSERT INTO public.user_notifications (notification_event_id, user_id)
      VALUES (v_event_id, v_uid)
      ON CONFLICT (notification_event_id, user_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION public.emit_notification(uuid, text, text, text, uuid[], uuid, text, jsonb, uuid, uuid, uuid, uuid, uuid) IS
  'Creates a notification_event plus one in-app user_notifications row per recipient; returns the existing event id when dedupe_key matches.';

REVOKE ALL ON FUNCTION public.emit_notification(uuid, text, text, text, uuid[], uuid, text, jsonb, uuid, uuid, uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.emit_notification(uuid, text, text, text, uuid[], uuid, text, jsonb, uuid, uuid, uuid, uuid, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- Audit — notification_events lifecycle only
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.log_notification_events_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Note: title and body are NOT logged (free-text, dsgvo).
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'notification_event.created'
      WHEN 'DELETE' THEN 'notification_event.deleted'
      ELSE 'notification_event.updated'
    END,
    p_subject_type := 'notification_event',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'event_type', CASE WHEN TG_OP = 'DELETE' THEN OLD.event_type ELSE NEW.event_type END,
      'dedupe_key', CASE WHEN TG_OP = 'DELETE' THEN OLD.dedupe_key ELSE NEW.dedupe_key END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'event_id', COALESCE(NEW.id, OLD.id),
        'classroom_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.classroom_id ELSE NEW.classroom_id END,
        'course_delivery_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.course_delivery_id ELSE NEW.course_delivery_id END
      )
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_notification_events_audit() IS
  'Audit trigger for notification_events lifecycle. Title/body intentionally excluded (free-text).';
