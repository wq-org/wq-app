export const FLOATING_VIEWPORT_MARGIN = 12

export type ViewportBounds = {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export type VerticalPlacement = 'above' | 'below'

const OVERFLOW_CLIP_VALUES = new Set(['auto', 'scroll', 'hidden', 'clip', 'overlay'])

function getVisualViewportRect(): ViewportBounds {
  const vv = window.visualViewport
  if (vv) {
    return {
      top: vv.offsetTop,
      left: vv.offsetLeft,
      right: vv.offsetLeft + vv.width,
      bottom: vv.offsetTop + vv.height,
      width: vv.width,
      height: vv.height,
    }
  }

  return {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function intersectViewportBounds(a: ViewportBounds, b: ViewportBounds): ViewportBounds {
  const top = Math.max(a.top, b.top)
  const left = Math.max(a.left, b.left)
  const right = Math.min(a.right, b.right)
  const bottom = Math.min(a.bottom, b.bottom)

  return {
    top,
    left,
    right: Math.max(left, right),
    bottom: Math.max(top, bottom),
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

function elementClipsOverflow(element: Element): boolean {
  const style = window.getComputedStyle(element)
  return OVERFLOW_CLIP_VALUES.has(style.overflowX) || OVERFLOW_CLIP_VALUES.has(style.overflowY)
}

function elementToViewportBounds(element: Element): ViewportBounds {
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

function applyViewportMargin(bounds: ViewportBounds, margin: number): ViewportBounds {
  return {
    top: bounds.top + margin,
    left: bounds.left + margin,
    right: bounds.right - margin,
    bottom: bounds.bottom - margin,
    width: Math.max(0, bounds.width - margin * 2),
    height: Math.max(0, bounds.height - margin * 2),
  }
}

/**
 * Visible viewport for floating UI: visual viewport ∩ clipping ancestors (modals, scroll areas).
 */
export function getFloatingPlacementViewport(origin?: HTMLElement | null): ViewportBounds {
  let bounds = applyViewportMargin(getVisualViewportRect(), FLOATING_VIEWPORT_MARGIN)

  if (!origin) {
    return bounds
  }

  let current: HTMLElement | null = origin.parentElement
  while (current) {
    if (elementClipsOverflow(current)) {
      bounds = intersectViewportBounds(bounds, elementToViewportBounds(current))
    }
    current = current.parentElement
  }

  return bounds
}

export function resolveVerticalPlacement({
  anchorRect,
  floatingHeight,
  offsetPx,
  prefer,
  viewport,
}: {
  anchorRect: ViewportBounds
  floatingHeight: number
  offsetPx: number
  prefer: VerticalPlacement
  viewport?: ViewportBounds
}): { placement: VerticalPlacement; top: number } {
  const bounds = viewport ?? getFloatingPlacementViewport()

  const spaceBelow = bounds.bottom - anchorRect.bottom - offsetPx
  const spaceAbove = anchorRect.top - bounds.top - offsetPx

  let placement: VerticalPlacement
  if (prefer === 'below') {
    placement = spaceBelow >= floatingHeight || spaceBelow >= spaceAbove ? 'below' : 'above'
  } else {
    placement = spaceAbove >= floatingHeight || spaceAbove >= spaceBelow ? 'above' : 'below'
  }

  let top =
    placement === 'below'
      ? anchorRect.bottom + offsetPx
      : anchorRect.top - floatingHeight - offsetPx

  if (top < bounds.top) {
    top = bounds.top
  }
  if (top + floatingHeight > bounds.bottom) {
    top = Math.max(bounds.top, bounds.bottom - floatingHeight)
  }

  return { placement, top }
}

export function clampHorizontalViewportPosition({
  left,
  floatingWidth,
  viewport,
}: {
  left: number
  floatingWidth: number
  viewport?: ViewportBounds
}): number {
  const bounds = viewport ?? getFloatingPlacementViewport()
  const minLeft = bounds.left
  const maxLeft = bounds.right - floatingWidth
  return Math.min(Math.max(left, minLeft), maxLeft)
}

export function applyFixedFloatingStyles(
  floatingElem: HTMLElement,
  top: number,
  left: number,
): void {
  floatingElem.style.position = 'fixed'
  floatingElem.style.top = `${top}px`
  floatingElem.style.left = `${left}px`
  floatingElem.style.transform = 'none'
  floatingElem.style.opacity = '1'
  floatingElem.style.pointerEvents = 'auto'
}

export function applyAnchorRelativeFloatingStyles(
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  top: number,
  left: number,
): void {
  const anchorRect = anchorElem.getBoundingClientRect()
  floatingElem.style.position = 'absolute'
  floatingElem.style.top = `${top - anchorRect.top}px`
  floatingElem.style.left = `${left - anchorRect.left}px`
  floatingElem.style.transform = 'none'
  floatingElem.style.opacity = '1'
  floatingElem.style.pointerEvents = 'auto'
}

/** Positions in viewport coordinates inside a portal root (dialog content or body). */
export function applyPortalFloatingStyles(
  floatingElem: HTMLElement,
  portalRoot: HTMLElement,
  top: number,
  left: number,
): void {
  if (portalRoot === document.body) {
    applyFixedFloatingStyles(floatingElem, top, left)
    return
  }

  const rootRect = portalRoot.getBoundingClientRect()
  floatingElem.style.position = 'absolute'
  floatingElem.style.top = `${top - rootRect.top}px`
  floatingElem.style.left = `${left - rootRect.left}px`
  floatingElem.style.transform = 'none'
  floatingElem.style.opacity = '1'
  floatingElem.style.pointerEvents = 'auto'
}

export function getScrollableAncestors(origin: HTMLElement): HTMLElement[] {
  const ancestors: HTMLElement[] = []
  let current: HTMLElement | null = origin.parentElement

  while (current) {
    if (elementClipsOverflow(current)) {
      ancestors.push(current)
    }
    current = current.parentElement
  }

  return ancestors
}

export function observeFloatingPlacementUpdates(
  anchorElem: HTMLElement,
  onUpdate: () => void,
): () => void {
  const handleUpdate = () => onUpdate()

  window.addEventListener('resize', handleUpdate)
  window.visualViewport?.addEventListener('resize', handleUpdate)
  window.visualViewport?.addEventListener('scroll', handleUpdate)

  const scrollParents = getScrollableAncestors(anchorElem)
  for (const parent of scrollParents) {
    parent.addEventListener('scroll', handleUpdate, { passive: true })
  }

  return () => {
    window.removeEventListener('resize', handleUpdate)
    window.visualViewport?.removeEventListener('resize', handleUpdate)
    window.visualViewport?.removeEventListener('scroll', handleUpdate)
    for (const parent of scrollParents) {
      parent.removeEventListener('scroll', handleUpdate)
    }
  }
}
