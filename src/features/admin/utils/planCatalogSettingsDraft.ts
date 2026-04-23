import {
  PLAN_BILLING_MONTHLY,
  PLAN_BILLING_NONE,
  PLAN_BILLING_YEARLY,
} from '../config/planCatalogBilling'
import type {
  PlanCatalogEditorPlan,
  PlanCatalogSettingsPatch,
} from '../types/planEntitlements.types'

export type PlanSettingsDraft = {
  seatCap: string
  storageBytes: string
  metadataJson: string
  priceAmount: string
  billingInterval: string
  isActive: boolean
}

function stringifyMetadata(metadata: unknown | null): string {
  if (metadata == null) return ''
  if (typeof metadata === 'string') return metadata
  try {
    return JSON.stringify(metadata, null, 2)
  } catch {
    return String(metadata)
  }
}

export function planToSettingsDraft(plan: PlanCatalogEditorPlan): PlanSettingsDraft {
  return {
    seatCap: plan.seatCapDefault == null ? '' : String(plan.seatCapDefault),
    storageBytes: plan.storageBytesCapDefault ?? '',
    metadataJson: stringifyMetadata(plan.metadata),
    priceAmount: plan.priceAmount ?? '',
    billingInterval: plan.billingInterval,
    isActive: plan.isActive,
  }
}

export function settingsDraftEqualsPlan(
  draft: PlanSettingsDraft,
  plan: PlanCatalogEditorPlan,
): boolean {
  const baseline = planToSettingsDraft(plan)
  return (
    draft.seatCap === baseline.seatCap &&
    draft.storageBytes === baseline.storageBytes &&
    draft.metadataJson === baseline.metadataJson &&
    draft.priceAmount === baseline.priceAmount &&
    draft.billingInterval === baseline.billingInterval &&
    draft.isActive === baseline.isActive
  )
}

export function parseSettingsDraftToPatch(
  draft: PlanSettingsDraft,
): { ok: true; patch: PlanCatalogSettingsPatch } | { ok: false; messageKey: string } {
  const seatTrim = draft.seatCap.trim()
  let seat_cap_default: number | null = null
  if (seatTrim.length > 0) {
    const n = Number.parseInt(seatTrim, 10)
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, messageKey: 'planCatalog.editor.settings.errors.seatCap' }
    }
    seat_cap_default = n
  }

  const storageTrim = draft.storageBytes.trim().replace(/[^\d]/g, '')
  const storage_bytes_cap_default = storageTrim.length > 0 ? storageTrim : null

  const metaTrim = draft.metadataJson.trim()
  let metadata: unknown | null = null
  if (metaTrim.length > 0) {
    try {
      metadata = JSON.parse(metaTrim) as unknown
    } catch {
      return { ok: false, messageKey: 'planCatalog.editor.settings.errors.metadataJson' }
    }
  }

  const priceTrim = draft.priceAmount.trim()
  let price_amount: number | null = null
  if (priceTrim.length > 0) {
    const p = Number.parseFloat(priceTrim)
    if (!Number.isFinite(p) || p < 0) {
      return { ok: false, messageKey: 'planCatalog.editor.settings.errors.priceAmount' }
    }
    price_amount = Math.round(p * 100) / 100
  }

  const billing_interval = draft.billingInterval
  if (
    billing_interval !== PLAN_BILLING_NONE &&
    billing_interval !== PLAN_BILLING_MONTHLY &&
    billing_interval !== PLAN_BILLING_YEARLY
  ) {
    return { ok: false, messageKey: 'planCatalog.editor.settings.errors.billingInterval' }
  }

  return {
    ok: true,
    patch: {
      seat_cap_default,
      storage_bytes_cap_default,
      metadata,
      price_amount,
      billing_interval,
      is_active: draft.isActive,
    },
  }
}
