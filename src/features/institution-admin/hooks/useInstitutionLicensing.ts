import { useEffect, useState } from 'react'

import { useUser } from '@/contexts/user'
import {
  fetchLatestInstitutionSubscription,
  type InstitutionSubscriptionWithPlan,
  resolvePlanCode,
} from '../api/institutionSubscriptionApi'

import { fetchEffectiveEntitlements } from '../api/institutionEntitlementsApi'
import { fetchInstitutionQuotasUsage } from '../api/institutionQuotasApi'
import type { EffectiveFeature, InstitutionQuotasUsage } from '../types/licensing.types'

type State = {
  subscription: InstitutionSubscriptionWithPlan | null
  /** Human-readable plan code, e.g. "Trial". Resolved from plan_catalog join or direct lookup. */
  planCode: string | null
  quotas: InstitutionQuotasUsage | null
  features: EffectiveFeature[]
  isLoading: boolean
  error: string | null
}

const INITIAL_STATE: State = {
  subscription: null,
  planCode: null,
  quotas: null,
  features: [],
  isLoading: true,
  error: null,
}

export function useInstitutionLicensing(): State & { institutionId: string | null } {
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()
  const [state, setState] = useState<State>(INITIAL_STATE)

  useEffect(() => {
    let cancelled = false
    if (!institutionId) {
      setState({ ...INITIAL_STATE, isLoading: false, error: 'No institution' })
      return
    }
    setState(INITIAL_STATE)
    ;(async () => {
      try {
        const subscription = await fetchLatestInstitutionSubscription(institutionId)
        const planId = subscription?.plan_id ?? null

        // Prefer the joined plan_catalog code; fall back to a direct lookup
        const planCode =
          subscription?.plan_catalog?.code ?? (planId ? await resolvePlanCode(planId) : null)

        const [quotas, features] = await Promise.all([
          fetchInstitutionQuotasUsage(institutionId),
          planId ? fetchEffectiveEntitlements(institutionId, planId) : Promise.resolve([]),
        ])
        if (cancelled) return
        setState({ subscription, planCode, quotas, features, isLoading: false, error: null })
      } catch (e) {
        if (cancelled) return
        setState({
          ...INITIAL_STATE,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Failed to load licensing',
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [institutionId])

  return { ...state, institutionId }
}
