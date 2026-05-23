import type { Modifier } from '@dnd-kit/core'

function getPointerCoordinates(event: Event): { x: number; y: number } | null {
  if ('clientX' in event && typeof (event as MouseEvent).clientX === 'number') {
    const mouseLike = event as MouseEvent
    return { x: mouseLike.clientX, y: mouseLike.clientY }
  }
  if ('touches' in event) {
    const touch = (event as TouchEvent).touches[0]
    if (touch) return { x: touch.clientX, y: touch.clientY }
  }
  return null
}

/** Centers the drag overlay on the pointer (same idea as game-image-pin preview). */
export const snapCenterToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (!activatorEvent || !draggingNodeRect) return transform
  const point = getPointerCoordinates(activatorEvent)
  if (!point) return transform
  const offsetX = point.x - draggingNodeRect.left
  const offsetY = point.y - draggingNodeRect.top
  return {
    ...transform,
    x: transform.x + offsetX - draggingNodeRect.width / 2,
    y: transform.y + offsetY - draggingNodeRect.height / 2,
  }
}
