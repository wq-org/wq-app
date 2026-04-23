-- =============================================================================
-- NOTIFICATIONS — helpers, fan-out RPC, audit trigger bodies for new tables
-- Requires: 20260329000026_notifications_03_indexes_constraints.sql
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

CREATE OR REPLACE FUNCTION public.create_notification_event_with_deliveries(
  p_institution_id uuid,
  p_event_type text,
  p_category text,
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

  IF p_category NOT IN ('learning', 'task', 'reward', 'social', 'system') THEN
    RAISE EXCEPTION 'invalid category';
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
    category,
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
    p_category,
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
      INSERT INTO public.notification_deliveries (notification_event_id, user_id, channel)
      VALUES (
        v_event_id,
        v_uid,
        'in_app'::public.notification_delivery_channel
      )
      ON CONFLICT (notification_event_id, user_id, channel) DO NOTHING;
    END IF;
  END LOOP;

  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION public.create_notification_event_with_deliveries(
  uuid, text, text, text, text, uuid[], uuid, text, jsonb, uuid, uuid, uuid, uuid, uuid
) IS
  'Creates notification_events plus in_app notification_deliveries per recipient; returns existing event id when dedupe_key matches.';

REVOKE ALL ON FUNCTION public.create_notification_event_with_deliveries(
  uuid, text, text, text, text, uuid[], uuid, text, jsonb, uuid, uuid, uuid, uuid, uuid
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification_event_with_deliveries(
  uuid, text, text, text, text, uuid[], uuid, text, jsonb, uuid, uuid, uuid, uuid, uuid
) TO authenticated;

-- -----------------------------------------------------------------------------
-- Audit — replace preference logger; add event + delivery loggers (old notifications table removed)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.log_notification_events_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'notification_event.created'
      WHEN 'DELETE' THEN 'notification_event.deleted'
      ELSE 'notification_event.updated'
    END,
    p_subject_type := 'notification_events',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'event_type', CASE WHEN TG_OP = 'DELETE' THEN OLD.event_type ELSE NEW.event_type END,
      'category', CASE WHEN TG_OP = 'DELETE' THEN OLD.category ELSE NEW.category END,
      'title', CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END,
      'dedupe_key', CASE WHEN TG_OP = 'DELETE' THEN OLD.dedupe_key ELSE NEW.dedupe_key END,
      'classroom_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.classroom_id ELSE NEW.classroom_id END,
      'course_delivery_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.course_delivery_id ELSE NEW.course_delivery_id END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_notification_events_audit() IS
  'Audit trigger for notification_events lifecycle.';

CREATE OR REPLACE FUNCTION audit.log_notification_deliveries_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'notification_delivery.created'
      WHEN 'DELETE' THEN 'notification_delivery.deleted'
      ELSE 'notification_delivery.updated'
    END,
    p_subject_type := 'notification_deliveries',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := (
      SELECT ne.institution_id
      FROM public.notification_events ne
      WHERE ne.id = COALESCE(NEW.notification_event_id, OLD.notification_event_id)
    ),
    p_payload := jsonb_build_object(
      'notification_event_id', COALESCE(NEW.notification_event_id, OLD.notification_event_id),
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'channel', CASE WHEN TG_OP = 'DELETE' THEN OLD.channel::text ELSE NEW.channel::text END,
      'read_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.read_at ELSE NEW.read_at END,
      'dismissed_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.dismissed_at ELSE NEW.dismissed_at END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_notification_deliveries_audit() IS
  'Audit trigger for notification_deliveries read/dismiss lifecycle.';

CREATE OR REPLACE FUNCTION audit.log_notification_preferences_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'notification_preference.created'
      WHEN 'DELETE' THEN 'notification_preference.deleted'
      ELSE 'notification_preference.updated'
    END,
    p_subject_type := 'notification_preferences',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'category', CASE WHEN TG_OP = 'DELETE' THEN OLD.category ELSE NEW.category END,
      'classroom_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.classroom_id ELSE NEW.classroom_id END,
      'course_delivery_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.course_delivery_id ELSE NEW.course_delivery_id END,
      'enabled', CASE WHEN TG_OP = 'DELETE' THEN OLD.enabled ELSE NEW.enabled END,
      'email_digest', CASE WHEN TG_OP = 'DELETE' THEN OLD.email_digest ELSE NEW.email_digest END,
      'quiet_start', CASE WHEN TG_OP = 'DELETE' THEN OLD.quiet_start ELSE NEW.quiet_start END,
      'quiet_end', CASE WHEN TG_OP = 'DELETE' THEN OLD.quiet_end ELSE NEW.quiet_end END,
      'mute_until', CASE WHEN TG_OP = 'DELETE' THEN OLD.mute_until ELSE NEW.mute_until END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_notification_preferences_audit() IS
  'Audit trigger for notification_preferences including scoped overrides and mute_until.';
