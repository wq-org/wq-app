import { supabase } from '@/lib/supabase'
import { listFeatureDefinitions } from './featureDefinitionsApi'
import type { FeatureDefinition } from '../types/featureDefinitions.types'
import {
  PLAN_BILLING_MONTHLY,
  PLAN_BILLING_NONE,
  PLAN_BILLING_YEARLY,
} from '../config/planCatalogBilling'
import type {
  PlanCatalog,
  PlanCatalogEditorPlan,
  PlanCatalogEditorRow,
  PlanCatalogRow,
  PlanCatalogSettingsPatch,
  PlanEntitlement,
  PlanEntitlementRow,
  PlanEntitlementUpsertPayload,
} from '../types/planEntitlements.types'

const PLAN_LIST_COLUMNS =
  'id, code, name, description, billing_interval, is_active, deleted_at' as const
const PLAN_EDITOR_COLUMNS =
  'id, code, name, description, seat_cap_default, storage_bytes_cap_default, metadata, updated_at, deleted_at, price_amount, currency, billing_interval, is_active' as const
const ENTITLEMENT_COLUMNS =
  'id, plan_id, feature_id, boolean_value, integer_value, bigint_value, text_value' as const

function mapPlan(row: PlanCatalogRow): PlanCatalog {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? '',
    billingInterval: row.billing_interval,
    isActive: row.is_active,
  }
}

function normalizeBillingInterval(raw: string): string {
  const b = raw.toLowerCase()
  if (b === 'monthly') return PLAN_BILLING_MONTHLY
  if (b === 'annual' || b === 'yearly') return PLAN_BILLING_YEARLY
  return PLAN_BILLING_NONE
}

function mapPlanEditorRow(row: PlanCatalogEditorRow): PlanCatalogEditorPlan {
  const storage = row.storage_bytes_cap_default
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    seatCapDefault: row.seat_cap_default,
    storageBytesCapDefault: storage === null || storage === undefined ? null : String(storage),
    metadata: row.metadata,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    priceAmount: row.price_amount == null ? null : String(row.price_amount),
    currency: row.currency,
    billingInterval: normalizeBillingInterval(row.billing_interval),
    isActive: row.is_active,
  }
}

function mapEntitlement(row: PlanEntitlementRow): PlanEntitlement {
  return {
    id: row.id,
    planId: row.plan_id,
    featureId: row.feature_id,
    booleanValue: row.boolean_value,
    integerValue: row.integer_value,
    bigintValue: row.bigint_value != null ? String(row.bigint_value) : null,
    textValue: row.text_value,
  }
}

export async function listPlanCatalog(): Promise<PlanCatalog[]> {
  const { data, error } = await supabase
    .from('plan_catalog')
    .select(PLAN_LIST_COLUMNS)
    .is('deleted_at', null)
    .order('code', { ascending: true })

  if (error) {
    console.error('listPlanCatalog:', error)
    throw new Error(error.message)
  }

  return (data as PlanCatalogRow[]).map(mapPlan)
}

export async function getPlanById(planId: string): Promise<PlanCatalog | null> {
  const { data, error } = await supabase
    .from('plan_catalog')
    .select(PLAN_LIST_COLUMNS)
    .eq('id', planId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error('getPlanById:', error)
    throw new Error(error.message)
  }

  if (!data) return null
  return mapPlan(data as PlanCatalogRow)
}

export async function getPlanCatalogForEditor(
  planId: string,
): Promise<PlanCatalogEditorPlan | null> {
  const { data, error } = await supabase
    .from('plan_catalog')
    .select(PLAN_EDITOR_COLUMNS)
    .eq('id', planId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error('getPlanCatalogForEditor:', error)
    throw new Error(error.message)
  }

  if (!data) return null
  return mapPlanEditorRow(data as PlanCatalogEditorRow)
}

export async function updatePlanCatalogSettings(
  planId: string,
  patch: PlanCatalogSettingsPatch,
): Promise<PlanCatalogEditorPlan> {
  const { data, error } = await supabase
    .from('plan_catalog')
    .update({
      seat_cap_default: patch.seat_cap_default,
      storage_bytes_cap_default: patch.storage_bytes_cap_default,
      metadata: patch.metadata,
      price_amount: patch.price_amount,
      billing_interval: patch.billing_interval,
      is_active: patch.is_active,
    })
    .eq('id', planId)
    .select(PLAN_EDITOR_COLUMNS)
    .single()

  if (error) {
    console.error('updatePlanCatalogSettings:', error)
    throw new Error(error.message)
  }

  return mapPlanEditorRow(data as PlanCatalogEditorRow)
}

export async function listPlanEntitlements(planId: string): Promise<PlanEntitlement[]> {
  const { data, error } = await supabase
    .from('plan_entitlements')
    .select(ENTITLEMENT_COLUMNS)
    .eq('plan_id', planId)

  if (error) {
    console.error('listPlanEntitlements:', error)
    throw new Error(error.message)
  }

  return (data as PlanEntitlementRow[]).map(mapEntitlement)
}

export async function getPlanEntitlementsEditorData(planId: string): Promise<{
  plan: PlanCatalogEditorPlan | null
  features: FeatureDefinition[]
  entitlements: PlanEntitlement[]
}> {
  const [plan, features, entitlements] = await Promise.all([
    getPlanCatalogForEditor(planId),
    listFeatureDefinitions(),
    listPlanEntitlements(planId),
  ])

  return { plan, features, entitlements }
}

export async function savePlanEntitlements(
  planId: string,
  rows: PlanEntitlementUpsertPayload[],
): Promise<void> {
  const featureIds = rows.map((row) => row.feature_id)

  const { error: deleteError } = await supabase
    .from('plan_entitlements')
    .delete()
    .eq('plan_id', planId)
    .in('feature_id', featureIds)

  if (deleteError) {
    console.error('savePlanEntitlements.delete:', deleteError)
    throw new Error(deleteError.message)
  }

  if (rows.length === 0) return

  const { error: upsertError } = await supabase
    .from('plan_entitlements')
    .upsert(rows, { onConflict: 'plan_id,feature_id' })

  if (upsertError) {
    console.error('savePlanEntitlements.upsert:', upsertError)
    throw new Error(upsertError.message)
  }
}
