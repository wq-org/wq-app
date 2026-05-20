import { cn } from '@/lib/utils'

import type { ScrollDrivenIndexLinkProps } from './scroll-driven-index.types'

function hidePopover(popoverId: string) {
  const popover = document.getElementById(popoverId)
  if (popover && 'hidePopover' in popover) {
    ;(popover as HTMLElement & { hidePopover: () => void }).hidePopover()
  }
}

export function ScrollDrivenIndexLink({ item, popoverId, className }: ScrollDrivenIndexLinkProps) {
  const href = item.href ?? `#${item.id}`

  const handleClick = () => {
    hidePopover(popoverId)
  }

  return (
    <a
      href={href}
      data-slot="scroll-driven-index-link"
      className={cn(className)}
      popoverTarget={popoverId}
      popoverTargetAction="hide"
      onClick={handleClick}
    >
      {item.label}
    </a>
  )
}
