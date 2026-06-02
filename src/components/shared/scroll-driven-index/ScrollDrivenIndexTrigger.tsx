import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { scrollDrivenIndexTriggerVariants } from './scroll-driven-index-variants'
import type { ScrollDrivenIndexTriggerProps } from './scroll-driven-index.types'
import { ScrollDrivenIndexTriggerDetails } from './ScrollDrivenIndexTriggerDetails'

export function ScrollDrivenIndexTrigger({
  label,
  popoverId,
  className,
  alignment = 'center',
  tone = 'default',
  progress,
  hideScrollDrivenIndexProgress = false,
  isOpen = false,
}: ScrollDrivenIndexTriggerProps & VariantProps<typeof scrollDrivenIndexTriggerVariants>) {
  return (
    <button
      type="button"
      data-slot="scroll-driven-index-trigger"
      className={cn(scrollDrivenIndexTriggerVariants({ alignment, tone }), className)}
      popoverTarget={popoverId}
      popoverTargetAction="toggle"
    >
      <ScrollDrivenIndexTriggerDetails
        label={label}
        progress={progress}
        hideScrollDrivenIndexProgress={hideScrollDrivenIndexProgress}
        isOpen={isOpen}
      />
    </button>
  )
}
