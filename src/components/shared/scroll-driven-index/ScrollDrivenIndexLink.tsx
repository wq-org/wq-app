import type { MouseEvent } from 'react'

import { cn } from '@/lib/utils'

import type { ScrollDrivenIndexLinkProps } from './scroll-driven-index.types'

function hidePopover(popoverId: string) {
  const popover = document.getElementById(popoverId)
  if (popover && 'hidePopover' in popover) {
    ;(popover as HTMLElement & { hidePopover: () => void }).hidePopover()
  }
}

function scrollToHashTarget(href: string) {
  if (!href.startsWith('#')) return false

  const targetId = href.slice(1)
  if (!targetId) return false

  const target = document.getElementById(decodeURIComponent(targetId))
  if (!target) return false

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
  window.history.pushState(null, '', href)

  return true
}

export function ScrollDrivenIndexLink({ item, popoverId, className }: ScrollDrivenIndexLinkProps) {
  const href = item.href ?? `#${item.id}`

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (scrollToHashTarget(href)) {
      event.preventDefault()
    }

    hidePopover(popoverId)
  }

  return (
    <a
      href={href}
      data-slot="scroll-driven-index-link"
      className={cn(
        'block w-full min-w-0 break-words py-2 leading-6 text-muted-foreground no-underline hover:text-foreground focus-visible:text-foreground',
        className,
      )}
      title={item.label}
      popoverTarget={popoverId}
      popoverTargetAction="hide"
      onClick={handleClick}
    >
      {item.label}
    </a>
  )
}
