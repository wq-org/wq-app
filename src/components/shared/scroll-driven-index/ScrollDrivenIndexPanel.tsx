import { useRef } from 'react'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

import { ScrollDrivenIndexList } from './ScrollDrivenIndexList'
import type { ScrollDrivenIndexPanelProps } from './scroll-driven-index.types'
import { ScrollDrivenIndexTriggerDetails } from './ScrollDrivenIndexTriggerDetails'
import { usePopoverSizeFallback } from './use-popover-size-fallback'

export function ScrollDrivenIndexPanel({
  popoverId,
  label,
  items,
  className,
  hideScrollDrivenIndexProgress = false,
}: ScrollDrivenIndexPanelProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  usePopoverSizeFallback(popoverRef)

  return (
    <div
      ref={popoverRef}
      id={popoverId}
      popover="auto"
      data-slot="scroll-driven-index-panel"
      className={cn(className)}
    >
      <div className="scroll-driven-index__contents">
        <button
          type="button"
          popoverTarget={popoverId}
          popoverTargetAction="hide"
        >
          <ScrollDrivenIndexTriggerDetails
            label={label}
            hideScrollDrivenIndexProgress={hideScrollDrivenIndexProgress}
          />
        </button>
        <BlurredScrollArea
          className="min-h-0 flex-1 w-full"
          viewportClassName="w-full"
          shadowSize={32}
        >
          <ScrollDrivenIndexList
            items={items}
            popoverId={popoverId}
          />
        </BlurredScrollArea>
      </div>
    </div>
  )
}
