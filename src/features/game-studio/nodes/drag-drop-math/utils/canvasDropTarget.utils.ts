import type { CanvasTokenInsertTarget } from './canvasDnd.utils'
import { CANVAS_EMPTY_DROP_ID } from '../constants/canvas-dnd.constants'
import {
  getCanvasGapDroppablePayload,
  getCanvasRowSortablePayload,
  getCanvasTokenSortablePayload,
} from '../types/canvas.types'
import type { DragDropMathCanvasRow } from '../types/drag-drop-math.schema'
import type { MathNodeVariant } from '../types/math-node.types'
import { rowHasEquationToken } from '../utils/mathEquationRow'
import { findRowIndexById, findTokenLocation } from './canvasDnd.utils'

/**
 * Hard cap per row: one equation + `=` + result (see {@link applyMathEquationCommitToRow}).
 */
export const CANVAS_ROW_MAX_TOKENS = 3

export type ResolveCanvasDropInsertTargetArgs = {
  overId: string | number
  overData: unknown
  rows: readonly DragDropMathCanvasRow[]
  /** Used to enforce the homogeneous-row constraint: math pills only sit in math rows, etc. */
  tokenVariant: MathNodeVariant
  /** Tokens moved together (equation + suffix badges). */
  incomingTokenCount?: number
  /** When reordering within the source row, capacity checks are skipped. */
  sourceRowId?: string | null
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
 * Rewrites a same-row insert to a new row when the target already holds
 * {@link CANVAS_ROW_MAX_TOKENS} tokens. Prevents authors from cramming more than
 * two pills onto a single line.
 */
function enforceRowCapacity(
  target: CanvasTokenInsertTarget,
  rows: readonly DragDropMathCanvasRow[],
  incomingTokenCount: number,
  sourceRowId: string | null,
): CanvasTokenInsertTarget {
  if (target.kind !== 'row-end' && target.kind !== 'row-at') return target
  if (sourceRowId === target.rowId) return target
  const rowIndex = findRowIndexById(rows, target.rowId)
  if (rowIndex < 0) return target
  const targetRow = rows[rowIndex]
  if (targetRow.tokens.length + incomingTokenCount <= CANVAS_ROW_MAX_TOKENS) return target
  return { kind: 'new-row', position: 'after', referenceRowId: target.rowId }
}

/** At most one editable equation per math row (evaluated rows use all three slots). */
function enforceOneEquationPerRow(
  target: CanvasTokenInsertTarget,
  rows: readonly DragDropMathCanvasRow[],
  tokenVariant: MathNodeVariant,
  sourceRowId: string | null,
): CanvasTokenInsertTarget {
  if (tokenVariant !== 'math') return target
  if (target.kind !== 'row-end' && target.kind !== 'row-at') return target
  if (sourceRowId === target.rowId) return target
  const rowIndex = findRowIndexById(rows, target.rowId)
  if (rowIndex < 0) return target
  if (!rowHasEquationToken(rows[rowIndex])) return target
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
  incomingTokenCount = 1,
  sourceRowId = null,
}: ResolveCanvasDropInsertTargetArgs): CanvasTokenInsertTarget | null {
  const applyConstraints = (target: CanvasTokenInsertTarget) =>
    enforceRowCapacity(
      enforceOneEquationPerRow(
        enforceHomogeneousRow(target, rows, tokenVariant),
        rows,
        tokenVariant,
        sourceRowId,
      ),
      rows,
      incomingTokenCount,
      sourceRowId,
    )
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
    return applyConstraints(baseTarget)
  }

  const overRow = getCanvasRowSortablePayload(overData)
  if (overRow) {
    return applyConstraints({ kind: 'row-end', rowId: overRow.rowId })
  }

  return null
}

export type ResolveResultDuplicateInsertTargetArgs = {
  overId: string | number
  overData: unknown
  rows: readonly DragDropMathCanvasRow[]
}

/**
 * Result-duplicate gesture: a ghost result chip can only spawn a new row.
 * Inline drops (over rows, tokens) and unknown targets resolve to `null`,
 * so the drop is rejected silently.
 */
export function resolveResultDuplicateInsertTarget({
  overId,
  overData,
  rows,
}: ResolveResultDuplicateInsertTargetArgs): CanvasTokenInsertTarget | null {
  if (overId === CANVAS_EMPTY_DROP_ID) {
    return { kind: 'first-row' }
  }

  const gapPayload = getCanvasGapDroppablePayload(overData)
  if (!gapPayload) return null
  if (findRowIndexById(rows, gapPayload.rowId) < 0) return null

  return {
    kind: 'new-row',
    position: gapPayload.position,
    referenceRowId: gapPayload.rowId,
  }
}
