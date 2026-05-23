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
  // Token > row > gap > empty. When the pointer's rect overlaps multiple
  // targets (e.g. row padding touches the gap below), we always prefer the
  // most specific one. Row > gap means moving the cursor through row padding
  // never accidentally creates a "new row" drop; gap > empty keeps the
  // dashed-row hint from being swallowed by the empty-canvas backdrop.
  token: 40,
  row: 30,
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
 * Canvas collision detection: strictly pointer-driven.
 *
 * 1. Use `pointerWithin` so only rects that actually contain the cursor count.
 * 2. Fall back to `closestCenter` when the pointer isn't inside any rect
 *    (e.g. the cursor is at the canvas edge during a fast flick).
 * 3. Sort by drop-target priority so a row whose rect contains the pointer
 *    always beats a gap whose rect also contains the pointer, but a gap
 *    whose rect contains the pointer always beats a row that does NOT.
 *
 * No "sticky last-over" carry-over — the moment the pointer leaves a row,
 * its `isOver` flips to false in the same frame so visual feedback stays in
 * sync with the actual cursor position.
 */
export const canvasCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args)
  const baseHits = pointerHits.length > 0 ? pointerHits : closestCenter(args)
  return sortCollisionsByDropPriority(baseHits)
}
