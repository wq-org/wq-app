-- =============================================================================
-- SUPER ADMIN — Triggers
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
-- =============================================================================

DROP TRIGGER IF EXISTS plan_catalog_updated_at ON public.plan_catalog;
DROP TRIGGER IF EXISTS trg_plan_catalog_set_updated_at ON public.plan_catalog;
CREATE TRIGGER trg_plan_catalog_set_updated_at
  BEFORE UPDATE ON public.plan_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS feature_defs_updated_at ON public.feature_definitions;
DROP TRIGGER IF EXISTS trg_feature_definitions_set_updated_at ON public.feature_definitions;
CREATE TRIGGER trg_feature_definitions_set_updated_at
  BEFORE UPDATE ON public.feature_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS plan_entitlements_updated_at ON public.plan_entitlements;
DROP TRIGGER IF EXISTS trg_plan_entitlements_set_updated_at ON public.plan_entitlements;
CREATE TRIGGER trg_plan_entitlements_set_updated_at
  BEFORE UPDATE ON public.plan_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS inst_subs_updated_at ON public.institution_subscriptions;
DROP TRIGGER IF EXISTS trg_institution_subscriptions_set_updated_at ON public.institution_subscriptions;
CREATE TRIGGER trg_institution_subscriptions_set_updated_at
  BEFORE UPDATE ON public.institution_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS inst_entitlement_overrides_updated_at ON public.institution_entitlement_overrides;
DROP TRIGGER IF EXISTS trg_institution_entitlement_overrides_set_updated_at ON public.institution_entitlement_overrides;
CREATE TRIGGER trg_institution_entitlement_overrides_set_updated_at
  BEFORE UPDATE ON public.institution_entitlement_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS billing_providers_updated_at ON public.billing_providers;
DROP TRIGGER IF EXISTS trg_billing_providers_set_updated_at ON public.billing_providers;
CREATE TRIGGER trg_billing_providers_set_updated_at
  BEFORE UPDATE ON public.billing_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- AUDIT TRIGGERS — plan, entitlements, subscription, billing (14 §14, 01)
-- =============================================================================
CREATE OR REPLACE FUNCTION audit.log_plan_catalog_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'plan_catalog.created'
      WHEN 'DELETE' THEN 'plan_catalog.deleted'
      ELSE 'plan_catalog.updated'
    END,
    p_subject_type := 'plan_catalog',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_payload := jsonb_build_object(
      'code', COALESCE(NEW.code, OLD.code),
      'name', COALESCE(NEW.name, OLD.name),
      'is_active', CASE WHEN TG_OP = 'DELETE' THEN OLD.is_active ELSE NEW.is_active END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_plan_catalog ON public.plan_catalog;
DROP TRIGGER IF EXISTS trg_plan_catalog_audit_row ON public.plan_catalog;
CREATE TRIGGER trg_plan_catalog_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.plan_catalog
  FOR EACH ROW EXECUTE FUNCTION audit.log_plan_catalog_audit();

CREATE OR REPLACE FUNCTION audit.log_plan_entitlements_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'plan_entitlement.created'
      WHEN 'DELETE' THEN 'plan_entitlement.deleted'
      ELSE 'plan_entitlement.updated'
    END,
    p_subject_type := 'plan_entitlements',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_payload := jsonb_build_object(
      'plan_id', COALESCE(NEW.plan_id, OLD.plan_id),
      'feature_id', COALESCE(NEW.feature_id, OLD.feature_id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_plan_entitlements ON public.plan_entitlements;
DROP TRIGGER IF EXISTS trg_plan_entitlements_audit_row ON public.plan_entitlements;
CREATE TRIGGER trg_plan_entitlements_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.plan_entitlements
  FOR EACH ROW EXECUTE FUNCTION audit.log_plan_entitlements_audit();

CREATE OR REPLACE FUNCTION audit.log_institution_subscriptions_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'subscription.created'
      WHEN 'DELETE' THEN 'subscription.deleted'
      ELSE 'subscription.updated'
    END,
    p_subject_type := 'institution_subscriptions',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'billing_status', CASE WHEN TG_OP = 'DELETE' THEN OLD.billing_status::text ELSE NEW.billing_status::text END,
      'previous_billing_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.billing_status::text ELSE NULL END,
      'plan_id', COALESCE(NEW.plan_id, OLD.plan_id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_institution_subscriptions ON public.institution_subscriptions;
DROP TRIGGER IF EXISTS trg_institution_subscriptions_audit_row ON public.institution_subscriptions;
CREATE TRIGGER trg_institution_subscriptions_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_subscriptions_audit();

CREATE OR REPLACE FUNCTION audit.log_billing_providers_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'billing_provider.created'
      WHEN 'DELETE' THEN 'billing_provider.deleted'
      ELSE 'billing_provider.updated'
    END,
    p_subject_type := 'billing_providers',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'provider', COALESCE(NEW.provider, OLD.provider)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP FUNCTION IF EXISTS audit.log_feature_override_change();

DROP TRIGGER IF EXISTS trg_audit_billing_providers ON public.billing_providers;
DROP TRIGGER IF EXISTS trg_billing_providers_audit_row ON public.billing_providers;
CREATE TRIGGER trg_billing_providers_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.billing_providers
  FOR EACH ROW EXECUTE FUNCTION audit.log_billing_providers_audit();

CREATE OR REPLACE FUNCTION audit.log_entitlement_override_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'entitlement_override.created'
      WHEN 'DELETE' THEN 'entitlement_override.deleted'
      ELSE 'entitlement_override.updated'
    END,
    p_subject_type := 'institution_entitlement_overrides',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'feature_id', COALESCE(NEW.feature_id, OLD.feature_id),
      'boolean_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.boolean_value ELSE NEW.boolean_value END,
      'integer_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.integer_value ELSE NEW.integer_value END,
      'bigint_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.bigint_value ELSE NEW.bigint_value END,
      'text_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.text_value ELSE NEW.text_value END,
      'reason', CASE WHEN TG_OP = 'DELETE' THEN OLD.reason ELSE NEW.reason END,
      'starts_at', COALESCE(NEW.starts_at, OLD.starts_at),
      'ends_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ends_at ELSE NEW.ends_at END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_entitlement_override ON public.institution_entitlement_overrides;
DROP TRIGGER IF EXISTS trg_institution_entitlement_overrides_audit_row ON public.institution_entitlement_overrides;
CREATE TRIGGER trg_institution_entitlement_overrides_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_entitlement_overrides
  FOR EACH ROW EXECUTE FUNCTION audit.log_entitlement_override_audit();

-- =============================================================================
-- AUDIT TRIGGER FUNCTIONS — attendance + game runtime
-- Note: trigger functions are defined here, but triggers are created in the
-- domain migrations that create the tables (attendance, game_runtime).
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_classroom_attendance_sessions_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'attendance_session.created'
      WHEN 'DELETE' THEN 'attendance_session.deleted'
      ELSE 'attendance_session.updated'
    END,
    p_subject_type := 'classroom_attendance_sessions',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'classroom_id', COALESCE(NEW.classroom_id, OLD.classroom_id),
      'course_id', COALESCE(NEW.course_id, OLD.course_id),
      'session_date', COALESCE(NEW.session_date, OLD.session_date),
      'starts_at', COALESCE(NEW.starts_at, OLD.starts_at),
      'ends_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ends_at ELSE NEW.ends_at END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_classroom_attendance_sessions_audit() IS
  'Audit trigger for attendance session lifecycle changes.';

CREATE OR REPLACE FUNCTION audit.log_classroom_attendance_records_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'attendance_record.created'
      WHEN 'DELETE' THEN 'attendance_record.deleted'
      ELSE 'attendance_record.updated'
    END,
    p_subject_type := 'classroom_attendance_records',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'attendance_session_id', COALESCE(NEW.attendance_session_id, OLD.attendance_session_id),
      'student_id', COALESCE(NEW.student_id, OLD.student_id),
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status::text ELSE NEW.status::text END,
      'source', CASE WHEN TG_OP = 'DELETE' THEN OLD.source::text ELSE NEW.source::text END,
      'check_in_time', CASE WHEN TG_OP = 'DELETE' THEN OLD.check_in_time ELSE NEW.check_in_time END,
      'check_out_time', CASE WHEN TG_OP = 'DELETE' THEN OLD.check_out_time ELSE NEW.check_out_time END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_classroom_attendance_records_audit() IS
  'Audit trigger for attendance record changes (teacher marking and self check-in).';

CREATE OR REPLACE FUNCTION audit.log_game_runs_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'game_run.created'
      WHEN 'DELETE' THEN 'game_run.deleted'
      ELSE 'game_run.updated'
    END,
    p_subject_type := 'game_runs',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'game_id', COALESCE(NEW.game_id, OLD.game_id),
      'classroom_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.classroom_id ELSE NEW.classroom_id END,
      'mode', CASE WHEN TG_OP = 'DELETE' THEN OLD.mode::text ELSE NEW.mode::text END,
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status::text ELSE NEW.status::text END,
      'started_by', COALESCE(NEW.started_by, OLD.started_by),
      'started_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.started_at ELSE NEW.started_at END,
      'ended_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ended_at ELSE NEW.ended_at END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_game_runs_audit() IS
  'Audit trigger for game run lifecycle changes (solo, versus, classroom).';

-- =============================================================================
-- AUDIT TRIGGER FUNCTIONS — notifications + rewards
-- Note: trigger functions are defined here, but triggers are created in the
-- domain migrations that create the tables.
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_notifications_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'notification.created'
      WHEN 'DELETE' THEN 'notification.deleted'
      ELSE 'notification.updated'
    END,
    p_subject_type := 'notifications',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'category', CASE WHEN TG_OP = 'DELETE' THEN OLD.category ELSE NEW.category END,
      'title', CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END,
      'is_read', CASE WHEN TG_OP = 'DELETE' THEN OLD.is_read ELSE NEW.is_read END,
      'read_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.read_at ELSE NEW.read_at END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_notifications_audit() IS
  'Audit trigger for notifications lifecycle and read-state changes.';

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
      'enabled', CASE WHEN TG_OP = 'DELETE' THEN OLD.enabled ELSE NEW.enabled END,
      'email_digest', CASE WHEN TG_OP = 'DELETE' THEN OLD.email_digest ELSE NEW.email_digest END,
      'quiet_start', CASE WHEN TG_OP = 'DELETE' THEN OLD.quiet_start ELSE NEW.quiet_start END,
      'quiet_end', CASE WHEN TG_OP = 'DELETE' THEN OLD.quiet_end ELSE NEW.quiet_end END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_notification_preferences_audit() IS
  'Audit trigger for notification preference changes per user/category.';

CREATE OR REPLACE FUNCTION audit.log_point_ledger_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'point_ledger.created'
      WHEN 'DELETE' THEN 'point_ledger.deleted'
      ELSE 'point_ledger.updated'
    END,
    p_subject_type := 'point_ledger',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'classroom_id', COALESCE(NEW.classroom_id, OLD.classroom_id),
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'source', CASE WHEN TG_OP = 'DELETE' THEN OLD.source ELSE NEW.source END,
      'points', CASE WHEN TG_OP = 'DELETE' THEN OLD.points ELSE NEW.points END,
      'previous_points', CASE WHEN TG_OP = 'UPDATE' THEN OLD.points ELSE NULL END,
      'task_delivery_id', COALESCE(NEW.task_delivery_id, OLD.task_delivery_id),
      'course_delivery_id', COALESCE(NEW.course_delivery_id, OLD.course_delivery_id),
      'game_delivery_id', COALESCE(NEW.game_delivery_id, OLD.game_delivery_id),
      'ref_id', COALESCE(NEW.ref_id, OLD.ref_id),
      'ref_type', CASE WHEN TG_OP = 'DELETE' THEN OLD.ref_type ELSE NEW.ref_type END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_point_ledger_audit() IS
  'Audit trigger for point ledger entries, including manual/admin adjustments.';

CREATE OR REPLACE FUNCTION audit.log_classroom_reward_settings_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'classroom_reward_settings.created'
      WHEN 'DELETE' THEN 'classroom_reward_settings.deleted'
      ELSE 'classroom_reward_settings.updated'
    END,
    p_subject_type := 'classroom_reward_settings',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'classroom_id', COALESCE(NEW.classroom_id, OLD.classroom_id),
      'leaderboard_opt_in', CASE WHEN TG_OP = 'DELETE' THEN OLD.leaderboard_opt_in ELSE NEW.leaderboard_opt_in END,
      'previous_leaderboard_opt_in', CASE WHEN TG_OP = 'UPDATE' THEN OLD.leaderboard_opt_in ELSE NULL END,
      'joker_config', CASE WHEN TG_OP = 'DELETE' THEN OLD.joker_config ELSE NEW.joker_config END,
      'level_thresholds', CASE WHEN TG_OP = 'DELETE' THEN OLD.level_thresholds ELSE NEW.level_thresholds END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_classroom_reward_settings_audit() IS
  'Audit trigger for classroom reward settings changes.';
