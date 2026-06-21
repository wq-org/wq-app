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
  name: string
  code: string
  description: string
  priceAmount: string
  billingInterval: string
  isActive: boolean
}

export function planToSettingsDraft(plan: PlanCatalogEditorPlan): PlanSettingsDraft {
  return {
    name: plan.name,
    code: plan.code,
    description: plan.description ?? '',
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
    draft.name === baseline.name &&
    draft.code === baseline.code &&
    draft.description === baseline.description &&
    draft.priceAmount === baseline.priceAmount &&
    draft.billingInterval === baseline.billingInterval &&
    draft.isActive === baseline.isActive
  )
}

const PLAN_CODE_PATTERN = /^[a-z][a-z0-9_]*$/

export function parseSettingsDraftToPatch(
  draft: PlanSettingsDraft,
): { ok: true; patch: PlanCatalogSettingsPatch } | { ok: false; messageKey: string } {
  if (!draft.name.trim()) {
    return { ok: false, messageKey: 'planCatalog.editor.settings.errors.nameRequired' }
  }

  const codeTrim = draft.code.trim()
  if (!codeTrim || !PLAN_CODE_PATTERN.test(codeTrim)) {
    return { ok: false, messageKey: 'planCatalog.editor.settings.errors.codePattern' }
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
      name: draft.name.trim(),
      code: codeTrim,
      description: draft.description.trim() || null,
      price_amount,
      billing_interval,
      is_active: draft.isActive,
    },
  }
}
