import { cn } from '@/lib/utils'

import type { PlanCatalog } from '../types/planEntitlements.types'
import { PlanCatalogCard } from './PlanCatalogCard'

type PlanCatalogCardListProps = {
  plans: readonly PlanCatalog[]
  onEdit: (planId: string) => void
  onPreview: (plan: PlanCatalog) => void
  className?: string
}

function PlanCatalogCardList({ plans, onEdit, onPreview, className }: PlanCatalogCardListProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-3 md:grid-cols-2', className)}>
      {plans.map((plan) => (
        <PlanCatalogCard
          key={plan.id}
          plan={plan}
          onEdit={onEdit}
          onPreview={onPreview}
        />
      ))}
    </div>
  )
}

export { PlanCatalogCardList }
