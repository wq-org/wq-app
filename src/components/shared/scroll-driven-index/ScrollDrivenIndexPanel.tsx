import { useEffect, useRef } from 'react'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

import { ScrollDrivenIndexList } from './ScrollDrivenIndexList'
import { scrollDrivenIndexPanelVariants } from './scroll-driven-index-variants'
import type { ScrollDrivenIndexPanelProps } from './scroll-driven-index.types'
import { ScrollDrivenIndexTriggerDetails } from './ScrollDrivenIndexTriggerDetails'
import { usePopoverSizeFallback } from './use-popover-size-fallback'

export function ScrollDrivenIndexPanel({
  popoverId,
  label,
  items,
  alignment = 'center',
  className,
  hideScrollDrivenIndexProgress = false,
  isOpen = false,
  onOpenChange,
}: ScrollDrivenIndexPanelProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  usePopoverSizeFallback(popoverRef)

  useEffect(() => {
    const popover = popoverRef.current
    if (!popover || !onOpenChange) return

    const handleToggle = () => {
      onOpenChange(popover.matches(':popover-open'))
    }

    popover.addEventListener('toggle', handleToggle)
    return () => popover.removeEventListener('toggle', handleToggle)
  }, [onOpenChange])

  return (
    <div
      ref={popoverRef}
      id={popoverId}
      popover="auto"
      data-slot="scroll-driven-index-panel"
      className={cn(scrollDrivenIndexPanelVariants({ alignment }), className)}
    >
      <div className="flex h-full w-full flex-col-reverse overflow-hidden rounded-[28px] border border-border/70 bg-popover/95 p-2 text-popover-foreground shadow-xl backdrop-blur-xl transition-[padding,opacity,filter,border-radius] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] supports-[backdrop-filter]:bg-popover/90 group-[:popover-open]:rounded-[2rem] group-[:popover-open]:p-4 starting:group-[:popover-open]:rounded-[28px] starting:group-[:popover-open]:p-2">
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent p-0 text-inherit"
          popoverTarget={popoverId}
          popoverTargetAction="hide"
        >
          <ScrollDrivenIndexTriggerDetails
            label={label}
            hideScrollDrivenIndexProgress={hideScrollDrivenIndexProgress}
            isOpen={isOpen}
          />
        </button>
        <BlurredScrollArea
          className="min-h-0 w-full flex-1 overflow-hidden"
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
