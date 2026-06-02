import { isTokenCanvasRow, type DragDropMathCanvasRow } from '../types/drag-drop-math.schema'

/** True when the student canvas has no rows (nothing to submit). */
export function isDragDropMathCanvasEmpty(rows: readonly DragDropMathCanvasRow[]): boolean {
  return rows.length === 0
}

/**
 * Freezes all canvas chips after preview submit: no drag, no edit, optional error shells.
 */
export function lockCanvasRowsForSubmission(
  rows: readonly DragDropMathCanvasRow[],
  errorTokenIds: readonly string[],
): DragDropMathCanvasRow[] {
  const errorSet = new Set(errorTokenIds)

  return rows.map((row) => {
    if (!isTokenCanvasRow(row)) return { ...row }
    return {
      ...row,
      tokens: row.tokens.map((token) => ({
        ...token,
        disabled: true,
        mathShell: errorSet.has(token.id) ? 'error' : token.mathShell,
      })),
    }
  })
}
