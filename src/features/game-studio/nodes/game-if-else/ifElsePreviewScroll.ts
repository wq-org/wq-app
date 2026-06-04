const SEGMENT_SCROLL_PADDING_PX = 12

/** Scrolls a segment into view inside the If/Else preview viewport (not the window). */
export function scrollIfElseSegmentIntoView(
  viewport: HTMLElement,
  target: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
): void {
  const viewportRect = viewport.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const nextTop = targetRect.top - viewportRect.top + viewport.scrollTop - SEGMENT_SCROLL_PADDING_PX

  viewport.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  })
}
