import { supabase } from '@/lib/supabase'
import type {
  PlanVersion,
  PlanVersionRow,
  PlanVersionEntitlement,
  PlanVersionEntitlementRow,
} from '../types/planVersions.types'

const VERSION_COLUMNS =
  'id, plan_id, version_no, status, name, price_amount, currency, billing_interval, change_note, created_at, published_at, archived_at' as const

const ENTITLEMENT_COLUMNS =
  'id, plan_version_id, feature_id, feature_key, value_type, boolean_value, integer_value, bigint_value, text_value, created_at' as const

function mapPlanVersion(row: PlanVersionRow): PlanVersion {
  return {
    id: row.id,
    planId: row.plan_id,
    versionNo: row.version_no,
    status: row.status,
    name: row.name,
    priceAmount: row.price_amount == null ? null : String(row.price_amount),
    currency: row.currency,
    billingInterval: row.billing_interval,
    changeNote: row.change_note,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    archivedAt: row.archived_at,
  }
}

function mapEntitlement(row: PlanVersionEntitlementRow): PlanVersionEntitlement {
  return {
    id: row.id,
    planVersionId: row.plan_version_id,
    featureId: row.feature_id,
    featureKey: row.feature_key,
    valueType: row.value_type,
    booleanValue: row.boolean_value,
    integerValue: row.integer_value,
    bigintValue: row.bigint_value != null ? String(row.bigint_value) : null,
    textValue: row.text_value,
  }
}

export async function listPlanVersions(planId: string): Promise<PlanVersion[]> {
  const { data, error } = await supabase
    .from('plan_versions')
    .select(VERSION_COLUMNS)
    .eq('plan_id', planId)
    .order('version_no', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as PlanVersionRow[]).map(mapPlanVersion)
}

export async function listPlanVersionEntitlements(
  versionId: string,
): Promise<PlanVersionEntitlement[]> {
  const { data, error } = await supabase
    .from('plan_version_entitlements')
    .select(ENTITLEMENT_COLUMNS)
    .eq('plan_version_id', versionId)
    .order('feature_key', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as PlanVersionEntitlementRow[]).map(mapEntitlement)
}

type PlanCatalogSnapshotRow = {
  name: string
  price_amount: string | number | null
  currency: string | null
  billing_interval: string
}

type EntitlementWithFeatureRow = {
  feature_id: string
  boolean_value: boolean | null
  integer_value: number | null
  bigint_value: string | null
  text_value: string | null
  feature_definitions: { key: string; value_type: string } | { key: string; value_type: string }[]
}

export async function publishPlanVersion(
  planId: string,
  changeNote?: string,
): Promise<PlanVersion> {
  // Resolve next version_no
  const { data: existing, error: existingError } = await supabase
    .from('plan_versions')
    .select('version_no')
    .eq('plan_id', planId)
    .order('version_no', { ascending: false })
    .limit(1)

  if (existingError) throw new Error(existingError.message)

  const latestVersionNo = (existing as { version_no: number }[] | null)?.[0]?.version_no ?? 0
  const nextVersionNo = latestVersionNo + 1

  // Fetch plan snapshot fields
  const { data: plan, error: planError } = await supabase
    .from('plan_catalog')
    .select('name, price_amount, currency, billing_interval')
    .eq('id', planId)
    .single()

  if (planError) throw new Error(planError.message)
  const snap = plan as PlanCatalogSnapshotRow

  // Insert plan_version row
  const { data: version, error: versionError } = await supabase
    .from('plan_versions')
    .insert({
      plan_id: planId,
      version_no: nextVersionNo,
      status: 'published',
      name: snap.name,
      price_amount: snap.price_amount ?? null,
      currency: snap.currency ?? 'EUR',
      billing_interval: snap.billing_interval,
      change_note: changeNote?.trim() || null,
      published_at: new Date().toISOString(),
    })
    .select(VERSION_COLUMNS)
    .single()

  if (versionError) throw new Error(versionError.message)

  const versionId = (version as PlanVersionRow).id

  // Fetch current entitlements with feature definitions
  const { data: entitlements, error: entitlementsError } = await supabase
    .from('plan_entitlements')
    .select(
      'feature_id, boolean_value, integer_value, bigint_value, text_value, feature_definitions ( key, value_type )',
    )
    .eq('plan_id', planId)

  if (entitlementsError) throw new Error(entitlementsError.message)

  if (entitlements && entitlements.length > 0) {
    const rows = (entitlements as EntitlementWithFeatureRow[]).map((e) => {
      const fd = Array.isArray(e.feature_definitions)
        ? e.feature_definitions[0]
        : e.feature_definitions
      return {
        plan_version_id: versionId,
        feature_id: e.feature_id,
        feature_key: fd?.key ?? '',
        value_type: fd?.value_type ?? 'boolean',
        boolean_value: e.boolean_value,
        integer_value: e.integer_value,
        bigint_value: e.bigint_value,
        text_value: e.text_value,
      }
    })

    const { error: pveError } = await supabase.from('plan_version_entitlements').insert(rows)
    if (pveError) throw new Error(pveError.message)
  }

  return mapPlanVersion(version as PlanVersionRow)
}
