-- Institution admins and members resolve effective entitlements via plan_entitlements
-- joined to their subscription's plan_id. Previously only super_admin could read this
-- table, so the License UI silently fell back to feature-definition defaults (empty plan).

DROP POLICY IF EXISTS plan_entitlements_select_subscribed_institution ON public.plan_entitlements;

CREATE POLICY plan_entitlements_select_subscribed_institution ON public.plan_entitlements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.institution_subscriptions s
      WHERE s.plan_id = plan_entitlements.plan_id
        AND (
          s.institution_id IN (SELECT app.admin_institution_ids())
          OR s.institution_id IN (SELECT app.member_institution_ids())
        )
    )
  );

COMMENT ON POLICY plan_entitlements_select_subscribed_institution ON public.plan_entitlements IS
  'Read plan template rows for any plan the user''s institution currently subscribes to (see institution_subscriptions.plan_id).';
