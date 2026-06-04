import { GAME_PREVIEW_SCROLL_END_SELECTOR } from './gamePreviewSession.constants'

const SEGMENT_SCROLL_PADDING_PX = 12

/** Scrolls a segment into view inside the preview viewport (not the window). */
export function scrollPreviewSegmentIntoView(
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

/** Scrolls the preview viewport to show the latest content (new bubbles, tall segments). */
export function scrollPreviewViewportToLatest(
  viewport: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
): void {
  const content = viewport.firstElementChild
  const scrollEnd = content?.querySelector(GAME_PREVIEW_SCROLL_END_SELECTOR)
  if (scrollEnd instanceof HTMLElement) {
    scrollPreviewSegmentIntoView(viewport, scrollEnd, behavior)
    return
  }

  viewport.scrollTo({
    top: Math.max(0, viewport.scrollHeight - viewport.clientHeight),
    behavior,
  })
}

/** @deprecated */
export const scrollIfElseSegmentIntoView = scrollPreviewSegmentIntoView
