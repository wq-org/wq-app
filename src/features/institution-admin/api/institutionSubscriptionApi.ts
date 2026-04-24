import { supabase } from '@/lib/supabase'
import type { InstitutionSubscriptionWithPlan } from '../types/licensing.types'

type SubscriptionSelectRow = Omit<InstitutionSubscriptionWithPlan, 'plan_catalog'> & {
  plan_catalog: { code: string; name: string } | { code: string; name: string }[] | null
}

function normalizePlanCatalog(
  raw: SubscriptionSelectRow['plan_catalog'],
): { code: string; name: string } | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

/**
 * Resolves a human-readable plan code (e.g. "Trial") from a plan UUID.
 * Use this as a fallback when the plan_catalog join on a subscription returns null.
 */
export async function resolvePlanCode(planId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('plan_catalog')
    .select('code')
    .eq('id', planId)
    .maybeSingle()
  if (error) {
    console.warn('resolvePlanCode:', error.message)
    return null
  }
  return (data as { code: string } | null)?.code ?? null
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
