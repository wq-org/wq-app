import { useId, useState } from 'react'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { ScrollDrivenIndexPanel } from './ScrollDrivenIndexPanel'
import { ScrollDrivenIndexTrigger } from './ScrollDrivenIndexTrigger'
import { scrollDrivenIndexVariants } from './scroll-driven-index-variants'
import type { ScrollDrivenIndexProps } from './scroll-driven-index.types'
import { useScrollProgress } from './use-scroll-progress'

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
  const [isOpen, setIsOpen] = useState(false)

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
        alignment={alignment}
        tone={tone}
        progress={progress}
        hideScrollDrivenIndexProgress={hideScrollDrivenIndexProgress}
        isOpen={isOpen}
      />
      <ScrollDrivenIndexPanel
        popoverId={popoverId}
        label={label}
        items={items}
        alignment={alignment}
        hideScrollDrivenIndexProgress={hideScrollDrivenIndexProgress}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
      {children}
    </div>
  )
}
