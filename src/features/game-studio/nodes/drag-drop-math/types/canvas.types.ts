import { isMathNodeVariant, type MathNodeVariant } from './math-node.types'

export type CanvasRowSortablePayload = { rowId: string }
export type CanvasTokenSortablePayload = {
  rowId: string
  tokenId: string
  variant: MathNodeVariant
}
export type CanvasGapDroppablePayload = { position: 'before' | 'after'; rowId: string }
export type CanvasResultDuplicatePayload = {
  /** Result chip the gesture originated from (informational only — never mutated). */
  sourceTokenId: string
  /** Result display value carried over into the spawned editable chip. */
  value: string
}

export const CANVAS_ROW_SORTABLE_DATA_KEY = 'canvasRowSortable' as const
export const CANVAS_TOKEN_SORTABLE_DATA_KEY = 'canvasTokenSortable' as const
export const CANVAS_GAP_DROPPABLE_DATA_KEY = 'canvasGapDroppable' as const
export const CANVAS_RESULT_DUPLICATE_DATA_KEY = 'canvasResultDuplicate' as const

function readNamedPayload(data: unknown, key: string): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const payload = (data as Record<string, unknown>)[key]
  if (!payload || typeof payload !== 'object') return null
  return payload as Record<string, unknown>
}

export function getCanvasRowSortablePayload(data: unknown): CanvasRowSortablePayload | null {
  const payload = readNamedPayload(data, CANVAS_ROW_SORTABLE_DATA_KEY)
  if (!payload || typeof payload.rowId !== 'string') return null
  return { rowId: payload.rowId }
}

export function getCanvasTokenSortablePayload(data: unknown): CanvasTokenSortablePayload | null {
  const payload = readNamedPayload(data, CANVAS_TOKEN_SORTABLE_DATA_KEY)
  if (!payload || typeof payload.rowId !== 'string' || typeof payload.tokenId !== 'string') {
    return null
  }
  if (!isMathNodeVariant(payload.variant)) return null
  return { rowId: payload.rowId, tokenId: payload.tokenId, variant: payload.variant }
}

export function getCanvasGapDroppablePayload(data: unknown): CanvasGapDroppablePayload | null {
  const payload = readNamedPayload(data, CANVAS_GAP_DROPPABLE_DATA_KEY)
  if (!payload || typeof payload.rowId !== 'string') return null
  if (payload.position !== 'before' && payload.position !== 'after') return null
  return { position: payload.position, rowId: payload.rowId }
}

export function getCanvasResultDuplicatePayload(
  data: unknown,
): CanvasResultDuplicatePayload | null {
  const payload = readNamedPayload(data, CANVAS_RESULT_DUPLICATE_DATA_KEY)
  if (!payload) return null
  const sourceTokenId = payload.sourceTokenId
  const value = payload.value
  if (typeof sourceTokenId !== 'string' || typeof value !== 'string') return null
  return { sourceTokenId, value }
}
