import { supabase } from '@/lib/supabase'

import type { BillingStatus } from '@/features/institution-admin/types/licensing.types'

const TERMINAL_STATUSES: BillingStatus[] = ['expired', 'cancelled']

type LatestSubscriptionRow = {
  id: string
  billing_status: BillingStatus
  effective_to: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

function isActiveSubscription(row: LatestSubscriptionRow | null): boolean {
  if (!row) return false
  if (TERMINAL_STATUSES.includes(row.billing_status)) {
    return false
  }

  const now = Date.now()
  const effectiveTo = row.effective_to ? Date.parse(row.effective_to) : null
  const currentPeriodEnd = row.current_period_end ? Date.parse(row.current_period_end) : null

  if (effectiveTo != null && !Number.isNaN(effectiveTo) && effectiveTo <= now) {
    return false
  }

  if (currentPeriodEnd != null && !Number.isNaN(currentPeriodEnd) && currentPeriodEnd <= now) {
    return false
  }

  return true
}

export async function assignInstitutionSubscription(institutionId: string, planId: string) {
  const { data: latest, error: latestError } = await supabase
    .from('institution_subscriptions')
    .select('id, billing_status, effective_to, current_period_end, cancel_at_period_end')
    .eq('institution_id', institutionId)
    .order('effective_from', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    throw new Error(latestError.message)
  }

  if (isActiveSubscription((latest as LatestSubscriptionRow | null) ?? null)) {
    throw new Error('This institution already has an active subscription.')
  }

  const { error } = await supabase.from('institution_subscriptions').insert({
    institution_id: institutionId,
    plan_id: planId,
    billing_status: 'active',
    effective_from: new Date().toISOString(),
  })

  if (error) {
    throw new Error(error.message)
  }
}
