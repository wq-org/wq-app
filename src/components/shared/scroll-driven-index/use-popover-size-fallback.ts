import { useEffect, type RefObject } from 'react'

/**
 * Backfill popover width/height for browsers without `interpolate-size: allow-keywords`.
 * Ported from css-scroll-driven-index/src/script.js
 */
export function usePopoverSizeFallback(popoverRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const popover = popoverRef.current
    if (!popover || CSS.supports('interpolate-size', 'allow-keywords')) {
      return
    }

    let set = false
    popover.style.setProperty('transition', 'none')

    const handleToggle = () => {
      if (set) return
      const { height, width } = popover.getBoundingClientRect()
      document.documentElement.style.setProperty(
        '--scroll-driven-index-content-height',
        `${height}px`,
      )
      document.documentElement.style.setProperty(
        '--scroll-driven-index-content-width',
        `${width}px`,
      )
      set = true
      popover.hidePopover()
      requestAnimationFrame(() => {
        popover.showPopover()
        popover.style.removeProperty('transition')
      })
    }

    popover.addEventListener('toggle', handleToggle)
    return () => popover.removeEventListener('toggle', handleToggle)
  }, [popoverRef])
}
