import { getFeatureDefinitionIcon } from '../config/featureDefinitionIcons'
import type { FeatureDefinition } from '../types/featureDefinitions.types'
import { FeatureDefinitionCard } from './FeatureDefinitionCard'

export type FeatureDefinitionCardListProps = {
  items: readonly FeatureDefinition[]
  onEdit: (featureId: string) => void
}

export function FeatureDefinitionCardList({ items, onEdit }: FeatureDefinitionCardListProps) {
  return (
    <div className="grid grid-cols-1 justify-items-center gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((feature) => (
        <FeatureDefinitionCard
          key={feature.id}
          feature={feature}
          icon={getFeatureDefinitionIcon(feature.key)}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
