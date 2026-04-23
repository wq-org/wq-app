import type { PlanCatalog } from '../types/planEntitlements.types'
import { PlanCatalogCard } from './PlanCatalogCard'

type PlanCatalogCardListProps = {
  plans: readonly PlanCatalog[]
  onEdit: (planId: string) => void
  onPreview: (plan: PlanCatalog) => void
}

function PlanCatalogCardList({ plans, onEdit, onPreview }: PlanCatalogCardListProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
