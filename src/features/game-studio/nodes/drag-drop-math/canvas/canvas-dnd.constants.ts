export const CANVAS_EMPTY_DROP_ID = 'drag-drop-math-canvas-empty' as const

const CANVAS_ROW_SORTABLE_ID_PREFIX = 'drag-drop-math-canvas-row:'
const CANVAS_TOKEN_SORTABLE_ID_PREFIX = 'drag-drop-math-canvas-token:'
const CANVAS_GAP_DROP_ID_PREFIX = 'drag-drop-math-canvas-gap:'

export function getCanvasRowSortableId(rowId: string): string {
  return `${CANVAS_ROW_SORTABLE_ID_PREFIX}${rowId}`
}

export function getCanvasTokenSortableId(tokenId: string): string {
  return `${CANVAS_TOKEN_SORTABLE_ID_PREFIX}${tokenId}`
}

export function getCanvasGapDropId(position: 'before' | 'after', rowId: string): string {
  return `${CANVAS_GAP_DROP_ID_PREFIX}${position}:${rowId}`
}

export function getCanvasTokenIdFromSortableId(sortableId: string): string | null {
  if (!sortableId.startsWith(CANVAS_TOKEN_SORTABLE_ID_PREFIX)) return null
  return sortableId.slice(CANVAS_TOKEN_SORTABLE_ID_PREFIX.length)
}
