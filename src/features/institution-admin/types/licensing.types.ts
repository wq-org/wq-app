import type { EntitlementValueType } from '@/features/admin/types/featureDefinitions.types'

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

export type InstitutionQuotasUsage = {
  seatsUsed: number
  seatsCap: number | null
  studentsUsed: number
  studentsCap: number | null
  teachersUsed: number
  teachersCap: number | null
  storageUsedBytes: number
  storageBytesCap: string | null
  updatedAt: string
}

export type EffectiveFeatureSource = 'override' | 'plan' | 'default'

export type EffectiveFeature = {
  featureId: string
  key: string
  name: string
  description: string
  category: string
  valueType: EntitlementValueType
  booleanValue: boolean | null
  integerValue: number | null
  bigintValue: string | null
  textValue: string | null
  defaultEnabled: boolean
  source: EffectiveFeatureSource
}

export type EffectiveFeatureGroup = {
  category: string
  features: EffectiveFeature[]
}
