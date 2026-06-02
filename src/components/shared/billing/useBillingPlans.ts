import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export type BillingPlanOption = {
  id: string
  code: string
  name: string
  description: string
}

type BillingPlanRow = {
  id: string
  code: string
  name: string
  description: string | null
  is_active: boolean
  deleted_at: string | null
}

function toBillingPlanOption(row: BillingPlanRow): BillingPlanOption {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? '',
  }
}

export function useBillingPlans() {
  const [plans, setPlans] = useState<BillingPlanOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('plan_catalog')
        .select('id, code, name, description, is_active, deleted_at')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('code', { ascending: true })

      if (cancelled) return

      if (fetchError) {
        setPlans([])
        setError(fetchError.message)
      } else {
        setPlans((data as BillingPlanRow[]).map(toBillingPlanOption))
      }

      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return { plans, isLoading, error }
}
