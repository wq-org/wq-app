import type { EntitlementValueType } from '@/features/admin/types/featureDefinitions.types'

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
