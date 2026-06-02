import { cn } from '@/lib/utils'

import { ScrollDrivenIndexLink } from './ScrollDrivenIndexLink'
import type { ScrollDrivenIndexListProps } from './scroll-driven-index.types'

export function ScrollDrivenIndexList({ items, popoverId, className }: ScrollDrivenIndexListProps) {
  return (
    <ol
      data-slot="scroll-driven-index-list"
      className={cn(
        'm-0 flex w-full list-none flex-col px-2 opacity-100 motion-safe:transition-opacity',
        className,
      )}
    >
      {items.map((item, index) => {
        const displayNumber = String(index + 1).padStart(2, '0')

        return (
          <li
            key={item.id}
            data-slot="scroll-driven-index-list-item"
            className="group grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-2"
          >
            <span
              data-slot="scroll-driven-index-list-number"
              className="shrink-0 py-2 text-sm leading-6 tabular-nums text-popover-foreground/60 transition-colors group-hover:text-popover-foreground group-focus-within:text-popover-foreground"
            >
              {displayNumber}
            </span>
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
