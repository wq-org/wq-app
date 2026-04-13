import { supabase } from '@/lib/supabase'

export type BillingStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'grace'
  | 'suspended'
  | 'expired'
  | 'cancelled'

export type InstitutionSubscriptionWithPlan = {
  id: string
  institution_id: string
  plan_id: string
  effective_from: string
  effective_to: string | null
  billing_status: BillingStatus
  renewal_at: string | null
  updated_at: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  trial_ends_at: string | null
  plan_catalog: { code: string; name: string } | null
}

type SubscriptionSelectRow = Omit<InstitutionSubscriptionWithPlan, 'plan_catalog'> & {
  plan_catalog: { code: string; name: string } | { code: string; name: string }[] | null
}

function normalizePlanCatalog(
  raw: SubscriptionSelectRow['plan_catalog'],
): { code: string; name: string } | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

/** Latest subscription row for the institution (by effective_from), with plan code/name when RLS allows. */
export async function fetchLatestInstitutionSubscription(
  institutionId: string,
): Promise<InstitutionSubscriptionWithPlan | null> {
  const { data, error } = await supabase
    .from('institution_subscriptions')
    .select(
      `
      id,
      institution_id,
      plan_id,
      effective_from,
      effective_to,
      billing_status,
      renewal_at,
      updated_at,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      canceled_at,
      trial_ends_at,
      plan_catalog ( code, name )
    `,
    )
    .eq('institution_id', institutionId)
    .order('effective_from', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const row = data as SubscriptionSelectRow
  return {
    ...row,
    plan_catalog: normalizePlanCatalog(row.plan_catalog),
  }
}
