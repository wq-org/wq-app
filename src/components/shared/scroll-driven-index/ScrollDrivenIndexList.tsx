import { cn } from '@/lib/utils'

import { ScrollDrivenIndexLink } from './ScrollDrivenIndexLink'
import type { ScrollDrivenIndexListProps } from './scroll-driven-index.types'

export function ScrollDrivenIndexList({ items, popoverId, className }: ScrollDrivenIndexListProps) {
  return (
    <ol
      data-slot="scroll-driven-index-list"
      className={cn(className)}
    >
      {items.map((item) => (
        <li key={item.id}>
          <ScrollDrivenIndexLink
            item={item}
            popoverId={popoverId}
          />
        </li>
      ))}
    </ol>
  )
}
