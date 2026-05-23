import {
  type Collision,
  type CollisionDetection,
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core'

import { CANVAS_EMPTY_DROP_ID } from './canvas-dnd.constants'
import {
  getCanvasGapDroppablePayload,
  getCanvasRowSortablePayload,
  getCanvasTokenSortablePayload,
} from './canvas.types'

type CanvasDropTargetKind = 'token' | 'row' | 'empty' | 'gap' | 'unknown'

const DROP_TARGET_PRIORITY: Record<CanvasDropTargetKind, number> = {
  token: 40,
  row: 30,
  // Gap must outrank empty: the empty backdrop wraps every gap rect, so when the
  // pointer is purely inside a gap, pointerWithin returns [gap, empty]. If empty
  // wins, isOver on the gap never fires and the dashed blue hint never shows.
  gap: 20,
  empty: 10,
  unknown: 0,
}

/**
 * dnd-kit collisions expose the user payload at
 * `collision.data.droppableContainer.data.current`, NOT on `collision.data` itself
 * (which holds `{ droppableContainer, value }`). Reading the wrong key here was the
 * source of every drop landing on the empty canvas.
 */
function getCollisionPayload(collision: Collision): unknown {
  const droppableContainer = collision.data?.droppableContainer
  if (!droppableContainer) return null
  return droppableContainer.data?.current ?? null
}

/** Classifies a collision so we can prefer real targets over the catch-all empty canvas. */
function getCanvasDropTargetKind(collision: Collision): CanvasDropTargetKind {
  if (collision.id === CANVAS_EMPTY_DROP_ID) return 'empty'
  const payload = getCollisionPayload(collision)
  if (getCanvasTokenSortablePayload(payload)) return 'token'
  if (getCanvasRowSortablePayload(payload)) return 'row'
  if (getCanvasGapDroppablePayload(payload)) return 'gap'
  return 'unknown'
}

function sortCollisionsByDropPriority(collisions: Collision[]): Collision[] {
  return [...collisions].sort((a, b) => {
    const priorityA = DROP_TARGET_PRIORITY[getCanvasDropTargetKind(a)]
    const priorityB = DROP_TARGET_PRIORITY[getCanvasDropTargetKind(b)]
    return priorityB - priorityA
  })
}

/**
 * When the pointer still overlaps a row/token and a between-row gap, keep favoring the
 * row line so quick vertical moves do not flip to "new row" by accident.
 */
function applyStickyRowPreference(
  sorted: Collision[],
  lastStableOverId: string | number | null,
): Collision[] {
  if (!lastStableOverId || sorted.length < 2) return sorted

  const topKind = getCanvasDropTargetKind(sorted[0])
  if (topKind !== 'gap') return sorted

  const stableHit = sorted.find((collision) => collision.id === lastStableOverId)
  if (!stableHit) return sorted

  const stableKind = getCanvasDropTargetKind(stableHit)
  if (stableKind !== 'row' && stableKind !== 'token') return sorted

  return [stableHit, ...sorted.filter((collision) => collision.id !== lastStableOverId)]
}

/**
 * Canvas collision detection: pointer hits first, then closest center.
 * Token/row targets outrank thin between-row gaps and the empty-canvas backdrop.
 */
export function createCanvasCollisionDetection(
  getLastStableOverId: () => string | number | null,
): CollisionDetection {
  return (args) => {
    const pointerHits = pointerWithin(args)
    const baseHits = pointerHits.length > 0 ? pointerHits : closestCenter(args)
    const sorted = sortCollisionsByDropPriority(baseHits)
    return applyStickyRowPreference(sorted, getLastStableOverId())
  }
}
