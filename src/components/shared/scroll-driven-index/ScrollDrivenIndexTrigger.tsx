import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { scrollDrivenIndexTriggerVariants } from './scroll-driven-index-variants'
import type { ScrollDrivenIndexTriggerProps } from './scroll-driven-index.types'
import { ScrollDrivenIndexTriggerDetails } from './ScrollDrivenIndexTriggerDetails'

export function ScrollDrivenIndexTrigger({
  label,
  popoverId,
  className,
  tone = 'default',
  progress,
  hideScrollDrivenIndexProgress = false,
}: ScrollDrivenIndexTriggerProps & VariantProps<typeof scrollDrivenIndexTriggerVariants>) {
  return (
    <button
      type="button"
      data-slot="scroll-driven-index-trigger"
      className={cn(scrollDrivenIndexTriggerVariants({ tone }), className)}
      popoverTarget={popoverId}
      popoverTargetAction="toggle"
    >
      <ScrollDrivenIndexTriggerDetails
        label={label}
        progress={progress}
        hideScrollDrivenIndexProgress={hideScrollDrivenIndexProgress}
      />
    </button>
  )
}
