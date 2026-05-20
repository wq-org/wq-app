import { cn } from '@/lib/utils'

import { ScrollDrivenIndexLink } from './ScrollDrivenIndexLink'
import type { ScrollDrivenIndexListProps } from './scroll-driven-index.types'

export function ScrollDrivenIndexList({ items, popoverId, className }: ScrollDrivenIndexListProps) {
  return (
    <ol
      data-slot="scroll-driven-index-list"
      className={cn(className)}
    >
      {items.map((item, index) => {
        const displayNumber = String(index + 1).padStart(2, '0')

        return (
          <li
            key={item.id}
            data-slot="scroll-driven-index-list-item"
          >
            <span data-slot="scroll-driven-index-list-number">{displayNumber}</span>
            <ScrollDrivenIndexLink
              item={item}
              popoverId={popoverId}
            />
          </li>
        )
      })}
    </ol>
  )
}
