export type PlanVersionStatus = 'draft' | 'published' | 'archived'

export type PlanVersionRow = {
  id: string
  plan_id: string
  version_no: number
  status: PlanVersionStatus
  name: string
  price_amount: string | number | null
  currency: string
  billing_interval: string
  change_note: string | null
  created_at: string
  published_at: string | null
  archived_at: string | null
}

export type PlanVersion = {
  id: string
  planId: string
  versionNo: number
  status: PlanVersionStatus
  name: string
  priceAmount: string | null
  currency: string
  billingInterval: string
  changeNote: string | null
  createdAt: string
  publishedAt: string | null
  archivedAt: string | null
}

export type PlanVersionEntitlementRow = {
  id: string
  plan_version_id: string
  feature_id: string
  feature_key: string
  value_type: string
  boolean_value: boolean | null
  integer_value: number | null
  bigint_value: string | null
  text_value: string | null
  created_at: string
}

export type PlanVersionEntitlement = {
  id: string
  planVersionId: string
  featureId: string
  featureKey: string
  valueType: string
  booleanValue: boolean | null
  integerValue: number | null
  bigintValue: string | null
  textValue: string | null
}
