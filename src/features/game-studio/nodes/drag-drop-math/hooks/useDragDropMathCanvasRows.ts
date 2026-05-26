import { useCallback } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'

import { getMathNodeDragData } from '../types/drag-drop-math-dnd.types'
import {
  isSigmaCanvasRow,
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
} from '../types/drag-drop-math.schema'
import type { MathNodeVariant } from '../types/math-node.types'
import type { TokenCanvasVariant } from '../types/drag-drop-math.schema'
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
  resolveSigmaDropTarget,
} from '../utils/canvasDropTarget.utils'
import {
  createCanvasTokenId,
  findRowIndexById,
  findTokenLocation,
  insertSigmaRowAt,
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
import { dropOnSigmaRow } from '../utils/sigmaRow'

export type UseDragDropMathCanvasRowsArgs = {
  rows: readonly DragDropMathCanvasRow[]
  onRowsChange: (rows: DragDropMathCanvasRow[]) => void
  resolveDropValue: (variant: MathNodeVariant, value: string) => string
}

function cloneRows(rows: readonly DragDropMathCanvasRow[]): DragDropMathCanvasRow[] {
  return rows.map((row) => {
    if (isSigmaCanvasRow(row)) return { ...row, items: [...row.items] }
    return { ...row, tokens: [...row.tokens] }
  })
}

/** Builds a brand-new canvas token from a palette drag payload. */
function buildPaletteToken(
  variant: TokenCanvasVariant,
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
    if (!isTokenCanvasRow(row)) continue
    const groupIds = collectEquationGroupTokenIds(row, equationTokenId)
    if (groupIds.length === 0) continue
    const idSet = new Set(groupIds)
    const next = rows.map((candidate) => {
      if (!isTokenCanvasRow(candidate)) return candidate
      return {
        ...candidate,
        tokens: candidate.tokens.filter((token) => !idSet.has(token.id)),
      }
    })
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
      const sigmaDrop = resultDuplicate
        ? resolveSigmaDropTarget(over.data.current, event.collisions ?? undefined)
        : null

      if (resultDuplicate && sigmaDrop) {
        const rowIndex = findRowIndexById(rows, sigmaDrop.rowId)
        if (rowIndex < 0) return
        const sigmaRow = rows[rowIndex]
        if (!isSigmaCanvasRow(sigmaRow)) return

        const outcome = dropOnSigmaRow(
          sigmaRow,
          resultDuplicate.value,
          resultDuplicate.sourceTokenId,
        )
        if (!outcome.ok) return

        const next = [...rows]
        next[rowIndex] = outcome.row
        onRowsChange(next)
        return
      }

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
      let working = cloneRows(rows)
      let tokensToInsert: DragDropMathCanvasToken[] | null = null
      let sourceRowId: string | null = null

      if (paletteData?.source === 'palette' && paletteData.variant === 'sigma') {
        const insertTarget = resolveCanvasDropInsertTarget({
          overId: over.id,
          overData: over.data.current,
          rows: working,
          tokenVariant: 'sigma',
        })
        if (!insertTarget) return
        onRowsChange(insertSigmaRowAt(working, undefined, insertTarget))
        return
      }

      if (paletteData?.source === 'palette') {
        if (paletteData.variant !== 'math' && paletteData.variant !== 'text') return
        tokensToInsert = [
          buildPaletteToken(paletteData.variant, paletteData.value, resolveDropValue),
        ]
      } else if (activeToken) {
        const location = findTokenLocation(working, activeToken.tokenId)
        if (!location) return
        const sourceRow = working[location.rowIndex]
        if (!isTokenCanvasRow(sourceRow)) return
        sourceRowId = activeToken.rowId
        const activeCanvasToken = sourceRow.tokens[location.tokenIndex]
        if (!isEditableEquationToken(activeCanvasToken)) return

        tokensToInsert = extractEquationGroupTokens(working, activeToken.tokenId)
        const removeIds = new Set(collectEquationGroupTokenIds(sourceRow, activeToken.tokenId))
        working = working.map((row) => {
          if (!isTokenCanvasRow(row)) return row
          return {
            ...row,
            tokens: row.tokens.filter((token) => !removeIds.has(token.id)),
          }
        })
      } else {
        return
      }

      if (!tokensToInsert) return

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
      const next = rows.map((row) => {
        if (!isTokenCanvasRow(row)) return row
        return {
          ...row,
          tokens: row.tokens.map((token) => (token.id === tokenId ? { ...token, value } : token)),
        }
      })
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

  const removeSigmaRow = useCallback(
    (rowId: string) => {
      onRowsChange(rows.filter((row) => !(isSigmaCanvasRow(row) && row.id === rowId)))
    },
    [onRowsChange, rows],
  )

  return {
    handleDragEnd,
    reorderRows,
    updateTokenValue,
    commitMathEquation,
    removeToken,
    removeSigmaRow,
  }
}
