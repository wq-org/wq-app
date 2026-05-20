import { useId } from 'react'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import './scroll-driven-index.css'

import { ScrollDrivenIndexPanel } from './ScrollDrivenIndexPanel'
import { ScrollDrivenIndexTrigger } from './ScrollDrivenIndexTrigger'
import { scrollDrivenIndexVariants } from './scroll-driven-index-variants'
import type { ScrollDrivenIndexProps } from './scroll-driven-index.types'
import { useScrollProgress } from './use-scroll-progress'

/** Apply to the scrollable article container (sets `scroll-timeline: --content`). */
export const SCROLL_DRIVEN_INDEX_SCROLL_CLASS = 'scroll-driven-index__scroll'

export function ScrollDrivenIndex({
  items,
  label = 'Index',
  alignment = 'center',
  tone = 'default',
  popoverId: popoverIdProp,
  className,
  children,
  scrollContainerSelector,
  hideScrollDrivenIndexProgress = false,
}: ScrollDrivenIndexProps & VariantProps<typeof scrollDrivenIndexVariants>) {
  const generatedId = useId().replace(/:/g, '')
  const popoverId = popoverIdProp ?? `scroll-driven-index-${generatedId}`
  const progress = useScrollProgress(scrollContainerSelector)

  return (
    <div
      data-slot="scroll-driven-index"
      data-alignment={alignment}
      data-tone={tone}
      className={cn(scrollDrivenIndexVariants({ alignment, tone }), className)}
    >
      <ScrollDrivenIndexTrigger
        label={label}
        popoverId={popoverId}
        tone={tone}
        progress={progress}
        hideScrollDrivenIndexProgress={hideScrollDrivenIndexProgress}
      />
      <ScrollDrivenIndexPanel
        popoverId={popoverId}
        label={label}
        items={items}
        hideScrollDrivenIndexProgress={hideScrollDrivenIndexProgress}
      />
      {children}
    </div>
  )
}
