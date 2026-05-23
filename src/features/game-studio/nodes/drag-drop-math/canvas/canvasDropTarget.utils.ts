import type { CanvasTokenInsertTarget } from './canvasDnd.utils'
import { CANVAS_EMPTY_DROP_ID } from './canvas-dnd.constants'
import {
  getCanvasGapDroppablePayload,
  getCanvasRowSortablePayload,
  getCanvasTokenSortablePayload,
} from './canvas.types'
import type { DragDropMathCanvasRow } from '../drag-drop-math.schema'
import type { MathNodeVariant } from '../math-node.types'
import { findRowIndexById, findTokenLocation } from './canvasDnd.utils'

export type ResolveCanvasDropInsertTargetArgs = {
  overId: string | number
  overData: unknown
  rows: readonly DragDropMathCanvasRow[]
  /** Used to enforce the homogeneous-row constraint: math pills only sit in math rows, etc. */
  tokenVariant: MathNodeVariant
}

/**
 * Rewrites a same-row insert to a new row immediately after the target when the
 * dropped token's variant does not match the target row. Keeps rows homogeneous.
 */
function enforceHomogeneousRow(
  target: CanvasTokenInsertTarget,
  rows: readonly DragDropMathCanvasRow[],
  tokenVariant: MathNodeVariant,
): CanvasTokenInsertTarget {
  if (target.kind !== 'row-end' && target.kind !== 'row-at') return target
  const rowIndex = findRowIndexById(rows, target.rowId)
  if (rowIndex < 0) return target
  const targetRow = rows[rowIndex]
  if (targetRow.variant === tokenVariant) return target
  return { kind: 'new-row', position: 'after', referenceRowId: target.rowId }
}

/**
 * Maps the winning droppable at drag end to a pure row/token insert instruction.
 * Returns null when the drop should be ignored (unknown target).
 */
export function resolveCanvasDropInsertTarget({
  overId,
  overData,
  rows,
  tokenVariant,
}: ResolveCanvasDropInsertTargetArgs): CanvasTokenInsertTarget | null {
  if (overId === CANVAS_EMPTY_DROP_ID) {
    return { kind: 'first-row' }
  }

  const gapPayload = getCanvasGapDroppablePayload(overData)
  if (gapPayload) {
    return {
      kind: 'new-row',
      position: gapPayload.position,
      referenceRowId: gapPayload.rowId,
    }
  }

  const overToken = getCanvasTokenSortablePayload(overData)
  if (overToken) {
    const location = findTokenLocation(rows, overToken.tokenId)
    const baseTarget: CanvasTokenInsertTarget = location
      ? { kind: 'row-at', rowId: overToken.rowId, index: location.tokenIndex }
      : { kind: 'row-end', rowId: overToken.rowId }
    return enforceHomogeneousRow(baseTarget, rows, tokenVariant)
  }

  const overRow = getCanvasRowSortablePayload(overData)
  if (overRow) {
    return enforceHomogeneousRow({ kind: 'row-end', rowId: overRow.rowId }, rows, tokenVariant)
  }

  return null
}
