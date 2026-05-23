import type { DragEndEvent } from '@dnd-kit/core'

export type DragDropMathCanvasPoint = {
  x: number
  y: number
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function getCanvasPlacementFromDragEnd(event: DragEndEvent): DragDropMathCanvasPoint | null {
  const overRect = event.over?.rect
  const dragged = event.active.rect.current.translated
  if (!overRect || !dragged || overRect.width <= 0 || overRect.height <= 0) {
    return null
  }

  const centerX = dragged.left + dragged.width / 2
  const centerY = dragged.top + dragged.height / 2

  return {
    x: clamp01((centerX - overRect.left) / overRect.width),
    y: clamp01((centerY - overRect.top) / overRect.height),
  }
}

export function createCanvasTokenId(): string {
  return crypto.randomUUID()
}
