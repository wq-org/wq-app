import { useCallback } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'

import { getMathNodeDragData } from '../types/drag-drop-math-dnd.types'
import type { DragDropMathCanvasRow, DragDropMathCanvasToken } from '../types/drag-drop-math.schema'
import type { MathNodeVariant } from '../types/math-node.types'
import {
  applyMathEquationCommitToRows,
  collectEquationGroupTokenIds,
  createMathEquationFromResult,
  extractEquationGroupTokens,
  isEditableEquationToken,
  type MathEquationCommitPayload,
} from '../utils/mathEquationRow'
import {
  resolveCanvasDropInsertTarget,
  resolveResultDuplicateInsertTarget,
} from '../utils/canvasDropTarget.utils'
import {
  createCanvasTokenId,
  findTokenLocation,
  insertTokenAt,
  insertTokenGroupAt,
  pruneEmptyRows,
  removeTokenById,
  reorderTokenWithinRow,
} from '../utils/canvasDnd.utils'
import {
  getCanvasResultDuplicatePayload,
  getCanvasTokenSortablePayload,
} from '../types/canvas.types'

export type UseDragDropMathCanvasRowsArgs = {
  rows: readonly DragDropMathCanvasRow[]
  onRowsChange: (rows: DragDropMathCanvasRow[]) => void
  resolveDropValue: (variant: MathNodeVariant, value: string) => string
}

/** Shallow-clones rows so subsequent mutations never alias caller state. */
function cloneRowsWithTokens(rows: readonly DragDropMathCanvasRow[]): DragDropMathCanvasRow[] {
  return rows.map((row) => ({ ...row, tokens: [...row.tokens] }))
}

/** Builds a brand-new canvas token from a palette drag payload. */
function buildPaletteToken(
  variant: MathNodeVariant,
  value: string,
  resolveDropValue: UseDragDropMathCanvasRowsArgs['resolveDropValue'],
): DragDropMathCanvasToken {
  return {
    id: createCanvasTokenId(),
    value: resolveDropValue(variant, value),
    variant,
    mathRole: variant === 'math' ? 'equation' : undefined,
  }
}

function removeTokenGroup(
  rows: readonly DragDropMathCanvasRow[],
  equationTokenId: string,
): DragDropMathCanvasRow[] {
  for (const row of rows) {
    const groupIds = collectEquationGroupTokenIds(row, equationTokenId)
    if (groupIds.length === 0) continue
    const idSet = new Set(groupIds)
    const next = rows.map((candidate) => ({
      ...candidate,
      tokens: candidate.tokens.filter((token) => !idSet.has(token.id)),
    }))
    return pruneEmptyRows(next)
  }
  return pruneEmptyRows(removeTokenById(rows, equationTokenId))
}

/**
 * Owns canvas row state mutations for palette drops, gap drops, in-row pill moves,
 * row reorder, value edits, and token removal. dnd-kit handles all *token* drags;
 * row order is handled by Framer Motion's Reorder.Group (see {@link CanvasRowList}).
 */
export function useDragDropMathCanvasRows({
  rows,
  onRowsChange,
  resolveDropValue,
}: UseDragDropMathCanvasRowsArgs) {
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const resultDuplicate = getCanvasResultDuplicatePayload(active.data.current)
      if (resultDuplicate) {
        const target = resolveResultDuplicateInsertTarget({
          overId: over.id,
          overData: over.data.current,
          rows,
        })
        if (!target) return
        const spawned = createMathEquationFromResult(resultDuplicate.value)
        onRowsChange(pruneEmptyRows(insertTokenAt(rows, spawned, target)))
        return
      }

      const activeToken = getCanvasTokenSortablePayload(active.data.current)
      const overToken = getCanvasTokenSortablePayload(over.data.current)
      if (activeToken && overToken && activeToken.rowId === overToken.rowId) {
        const reordered = reorderTokenWithinRow(
          rows,
          activeToken.rowId,
          activeToken.tokenId,
          overToken.tokenId,
        )
        if (reordered) onRowsChange(reordered)
        return
      }

      const paletteData = getMathNodeDragData(active.data.current)
      let working = cloneRowsWithTokens(rows)
      let tokensToInsert: DragDropMathCanvasToken[]
      let sourceRowId: string | null = null

      if (paletteData?.source === 'palette') {
        tokensToInsert = [
          buildPaletteToken(paletteData.variant, paletteData.value, resolveDropValue),
        ]
      } else if (activeToken) {
        const location = findTokenLocation(working, activeToken.tokenId)
        if (!location) return
        sourceRowId = activeToken.rowId
        const sourceRow = working[location.rowIndex]
        const activeCanvasToken = sourceRow.tokens[location.tokenIndex]
        if (!isEditableEquationToken(activeCanvasToken)) return

        tokensToInsert = extractEquationGroupTokens(working, activeToken.tokenId)
        const removeIds = new Set(collectEquationGroupTokenIds(sourceRow, activeToken.tokenId))
        working = working.map((row) => ({
          ...row,
          tokens: row.tokens.filter((token) => !removeIds.has(token.id)),
        }))
      } else {
        return
      }

      const insertTarget = resolveCanvasDropInsertTarget({
        overId: over.id,
        overData: over.data.current,
        rows: working,
        tokenVariant: tokensToInsert[0].variant,
        incomingTokenCount: tokensToInsert.length,
        sourceRowId,
      })
      if (!insertTarget) return

      onRowsChange(pruneEmptyRows(insertTokenGroupAt(working, tokensToInsert, insertTarget)))
    },
    [onRowsChange, resolveDropValue, rows],
  )

  /** Replaces the row order with the array produced by Framer Reorder. */
  const reorderRows = useCallback(
    (nextRows: DragDropMathCanvasRow[]) => {
      onRowsChange(nextRows)
    },
    [onRowsChange],
  )

  const updateTokenValue = useCallback(
    (tokenId: string, value: string) => {
      const next = rows.map((row) => ({
        ...row,
        tokens: row.tokens.map((token) => (token.id === tokenId ? { ...token, value } : token)),
      }))
      onRowsChange(next)
    },
    [onRowsChange, rows],
  )

  const commitMathEquation = useCallback(
    (equationTokenId: string, payload: MathEquationCommitPayload) => {
      if (payload.kind === 'empty') {
        onRowsChange(removeTokenGroup(rows, equationTokenId))
        return
      }
      onRowsChange(applyMathEquationCommitToRows(rows, equationTokenId, payload))
    },
    [onRowsChange, rows],
  )

  const removeToken = useCallback(
    (tokenId: string) => {
      onRowsChange(removeTokenGroup(rows, tokenId))
    },
    [onRowsChange, rows],
  )

  return { handleDragEnd, reorderRows, updateTokenValue, commitMathEquation, removeToken }
}
