import { arrayMove } from '@dnd-kit/sortable'

import {
  isSigmaCanvasRow,
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
  type TokenCanvasRow,
} from '../types/drag-drop-math.schema'
import type { SigmaCanvasRow } from '../types/sigma-row.types'
import { createEmptySigmaRow } from './sigmaRow'

export type CanvasTokenInsertTarget =
  | { kind: 'first-row' }
  | { kind: 'row-end'; rowId: string }
  | { kind: 'row-at'; rowId: string; index: number }
  | { kind: 'new-row'; position: 'before' | 'after'; referenceRowId: string }

/** Creates a stable UUID for a new canvas row. */
export function createCanvasRowId(): string {
  return crypto.randomUUID()
}

/** Creates a stable UUID for a new canvas token (pill). */
export function createCanvasTokenId(): string {
  return crypto.randomUUID()
}

/** Returns the index of a row by id, or -1 when missing. */
export function findRowIndexById(rows: readonly DragDropMathCanvasRow[], rowId: string): number {
  return rows.findIndex((row) => row.id === rowId)
}

/**
 * Locates a token across all rows.
 * Used when moving pills between rows or resolving insert-before index.
 */
export function findTokenLocation(
  rows: readonly DragDropMathCanvasRow[],
  tokenId: string,
): { rowIndex: number; tokenIndex: number } | null {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!isTokenCanvasRow(row)) continue
    const tokenIndex = row.tokens.findIndex((token) => token.id === tokenId)
    if (tokenIndex >= 0) return { rowIndex, tokenIndex }
  }
  return null
}

/** Removes a token from whichever token row contains it (row may become empty). */
export function removeTokenById(
  rows: readonly DragDropMathCanvasRow[],
  tokenId: string,
): DragDropMathCanvasRow[] {
  return rows.map((row) => {
    if (!isTokenCanvasRow(row)) return row
    return { ...row, tokens: row.tokens.filter((token) => token.id !== tokenId) }
  })
}

function insertRowAtIndex(
  rows: readonly DragDropMathCanvasRow[],
  insertIndex: number,
  newRow: DragDropMathCanvasRow,
): DragDropMathCanvasRow[] {
  return [...rows.slice(0, insertIndex), newRow, ...rows.slice(insertIndex)]
}

function createTokenCanvasRow(token: DragDropMathCanvasToken): TokenCanvasRow {
  return {
    id: createCanvasRowId(),
    variant: token.variant,
    tokens: [token],
  }
}

function resolveNewRowInsertIndex(
  rows: readonly DragDropMathCanvasRow[],
  target: Extract<CanvasTokenInsertTarget, { kind: 'new-row' }>,
): number | null {
  const refIndex = findRowIndexById(rows, target.referenceRowId)
  if (refIndex < 0) return null
  return target.position === 'before' ? refIndex : refIndex + 1
}

/**
 * Inserts a token according to a resolved drop target.
 * New pills on `row-end` stay in the same row; flex-wrap handles overflow to the next line visually.
 */
export function insertTokenAt(
  rows: readonly DragDropMathCanvasRow[],
  token: DragDropMathCanvasToken,
  target: CanvasTokenInsertTarget,
): DragDropMathCanvasRow[] {
  if (target.kind === 'first-row') {
    return [...rows, createTokenCanvasRow(token)]
  }

  if (target.kind === 'new-row') {
    const insertIndex = resolveNewRowInsertIndex(rows, target)
    if (insertIndex === null) return [...rows]
    return insertRowAtIndex(rows, insertIndex, createTokenCanvasRow(token))
  }

  return rows.map((row) => {
    if (!isTokenCanvasRow(row) || row.id !== target.rowId) return row
    if (target.kind === 'row-end') {
      return { ...row, tokens: [...row.tokens, token] }
    }
    const clampedIndex = Math.max(0, Math.min(target.index, row.tokens.length))
    return {
      ...row,
      tokens: [...row.tokens.slice(0, clampedIndex), token, ...row.tokens.slice(clampedIndex)],
    }
  })
}

/** Inserts a sigma summation row at a resolved drop target. */
export function insertSigmaRowAt(
  rows: readonly DragDropMathCanvasRow[],
  sigmaRow: SigmaCanvasRow = createEmptySigmaRow(),
  target: CanvasTokenInsertTarget,
): DragDropMathCanvasRow[] {
  if (target.kind === 'first-row') {
    return [...rows, sigmaRow]
  }

  if (target.kind === 'new-row') {
    const insertIndex = resolveNewRowInsertIndex(rows, target)
    if (insertIndex === null) return [...rows]
    return insertRowAtIndex(rows, insertIndex, sigmaRow)
  }

  const refIndex = findRowIndexById(rows, target.rowId)
  if (refIndex < 0) return [...rows]
  const insertIndex =
    target.kind === 'row-at'
      ? refIndex + 1
      : target.kind === 'row-end'
        ? refIndex + 1
        : refIndex + 1
  return insertRowAtIndex(rows, insertIndex, sigmaRow)
}

/** Reorders top-level canvas rows after a row grip drag. */
export function reorderRowsByIndex(
  rows: readonly DragDropMathCanvasRow[],
  oldIndex: number,
  newIndex: number,
): DragDropMathCanvasRow[] {
  if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return [...rows]
  return arrayMove([...rows], oldIndex, newIndex)
}

/** Drops empty token rows after moves/removals; sigma rows are always kept. */
export function pruneEmptyRows(rows: readonly DragDropMathCanvasRow[]): DragDropMathCanvasRow[] {
  return rows.filter(
    (row) => isSigmaCanvasRow(row) || (isTokenCanvasRow(row) && row.tokens.length > 0),
  )
}

/** Inserts multiple tokens in order at a drop target (equation groups). */
export function insertTokenGroupAt(
  rows: readonly DragDropMathCanvasRow[],
  tokens: readonly DragDropMathCanvasToken[],
  target: CanvasTokenInsertTarget,
): DragDropMathCanvasRow[] {
  if (tokens.length === 0) return [...rows]
  let next = insertTokenAt(rows, tokens[0], target)
  const anchorId = tokens[0].id

  for (let index = 1; index < tokens.length; index += 1) {
    const location = findTokenLocation(next, anchorId)
    if (!location) break
    const row = next[location.rowIndex]
    if (!isTokenCanvasRow(row)) break
    next = insertTokenAt(next, tokens[index], { kind: 'row-end', rowId: row.id })
  }

  return next
}

/**
 * Reorders a token within a single row (horizontal sortable).
 * Returns null when the move is a no-op or indices are invalid.
 */
export function reorderTokenWithinRow(
  rows: readonly DragDropMathCanvasRow[],
  rowId: string,
  activeTokenId: string,
  overTokenId: string,
): DragDropMathCanvasRow[] | null {
  if (activeTokenId === overTokenId) return null

  return rows.map((row) => {
    if (!isTokenCanvasRow(row) || row.id !== rowId) return row
    const oldIndex = row.tokens.findIndex((token) => token.id === activeTokenId)
    const newIndex = row.tokens.findIndex((token) => token.id === overTokenId)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return row
    return { ...row, tokens: arrayMove(row.tokens, oldIndex, newIndex) }
  })
}
