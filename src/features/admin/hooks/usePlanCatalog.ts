import { useEffect, useState } from 'react'
import { listPlanCatalog } from '../api/planEntitlementsApi'
import type { PlanCatalog } from '../types/planEntitlements.types'

export function usePlanCatalog() {
  const [items, setItems] = useState<PlanCatalog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    listPlanCatalog()
      .then((list) => {
        if (!cancelled) {
          setItems(list)
          setError(null)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return {
    items,
    isLoading,
    error,
  }
}
