import { cn } from '@/lib/utils'
import { CardInstantPreviewListItem } from './CardInstantPreviewListItem'
import type { CardInstantPreviewCardProps } from './card-instant-preview.types'

export type CardInstantPreviewListProps = {
  items: CardInstantPreviewCardProps[]
  activeId: string | null
  onSelect: (id: string, trigger: HTMLButtonElement) => void
  className?: string
}

export function CardInstantPreviewList({
  items,
  activeId,
  onSelect,
  className,
}: CardInstantPreviewListProps) {
  const isDimmed = Boolean(activeId)

  return (
    <ul
      className={cn(
        'card-list flex flex-wrap items-start justify-start gap-5 transition-opacity duration-300',
        isDimmed && 'opacity-35',
        className,
      )}
    >
      {items.map((item) => (
        <CardInstantPreviewListItem
          key={item.id}
          {...item}
          isExpanded={activeId === item.id}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
