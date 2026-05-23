import { useCallback } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'

import { getMathNodeDragData } from '../drag-drop-math-dnd.types'
import type { DragDropMathCanvasRow, DragDropMathCanvasToken } from '../drag-drop-math.schema'
import type { MathNodeVariant } from '../math-node.types'
import { resolveCanvasDropInsertTarget } from './canvasDropTarget.utils'
import {
  createCanvasTokenId,
  findRowIndexById,
  findTokenLocation,
  insertTokenAt,
  pruneEmptyRows,
  removeTokenById,
  reorderRowsByIndex,
  reorderTokenWithinRow,
} from './canvasDnd.utils'
import { getCanvasRowSortablePayload, getCanvasTokenSortablePayload } from './canvas.types'

export type UseDragDropMathCanvasRowsArgs = {
  rows: readonly DragDropMathCanvasRow[]
  onRowsChange: (rows: DragDropMathCanvasRow[]) => void
  resolveDropValue: (variant: MathNodeVariant, value: string) => string
}

function cloneRowsWithTokens(rows: readonly DragDropMathCanvasRow[]): DragDropMathCanvasRow[] {
  return rows.map((row) => ({ ...row, tokens: [...row.tokens] }))
}

function buildPaletteToken(
  variant: MathNodeVariant,
  value: string,
  resolveDropValue: UseDragDropMathCanvasRowsArgs['resolveDropValue'],
): DragDropMathCanvasToken {
  return {
    id: createCanvasTokenId(),
    value: resolveDropValue(variant, value),
    variant,
  }
}

/**
 * Owns canvas row state mutations for palette drops, row gaps, and in-row pill moves.
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

      const activeRow = getCanvasRowSortablePayload(active.data.current)
      if (activeRow) {
        const overRow = getCanvasRowSortablePayload(over.data.current)
        if (!overRow || activeRow.rowId === overRow.rowId) return
        const oldIndex = findRowIndexById(rows, activeRow.rowId)
        const newIndex = findRowIndexById(rows, overRow.rowId)
        if (oldIndex < 0 || newIndex < 0) return
        onRowsChange(reorderRowsByIndex(rows, oldIndex, newIndex))
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
      let token: DragDropMathCanvasToken

      if (paletteData?.source === 'palette') {
        token = buildPaletteToken(paletteData.variant, paletteData.value, resolveDropValue)
      } else if (activeToken) {
        const location = findTokenLocation(working, activeToken.tokenId)
        if (!location) return
        token = working[location.rowIndex].tokens[location.tokenIndex]
        working = removeTokenById(working, activeToken.tokenId)
      } else {
        return
      }

      const insertTarget = resolveCanvasDropInsertTarget({
        overId: over.id,
        overData: over.data.current,
        rows: working,
        tokenVariant: token.variant,
      })
      if (!insertTarget) return

      onRowsChange(pruneEmptyRows(insertTokenAt(working, token, insertTarget)))
    },
    [onRowsChange, resolveDropValue, rows],
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

  const removeToken = useCallback(
    (tokenId: string) => {
      onRowsChange(pruneEmptyRows(removeTokenById(rows, tokenId)))
    },
    [onRowsChange, rows],
  )

  return { handleDragEnd, updateTokenValue, removeToken }
}
