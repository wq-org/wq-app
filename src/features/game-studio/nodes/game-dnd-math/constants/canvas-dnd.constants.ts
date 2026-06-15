export const CANVAS_EMPTY_DROP_ID = 'drag-drop-math-canvas-empty' as const

/** Collapsed panel viewport — ~2 chip rows visible; remainder scrolls. */
export const DND_MATH_CANVAS_COLLAPSED_HEIGHT_CLASS = 'h-[88px]' as const
export const DND_MATH_CANVAS_COLLAPSED_MIN_HEIGHT_CLASS = 'min-h-[72px]' as const
export const DND_MATH_CANVAS_EXPANDED_HEIGHT_CLASS = 'h-[60vh]' as const
export const DND_MATH_CANVAS_EMPTY_MIN_HEIGHT_CLASS = 'min-h-[72px]' as const

const CANVAS_ROW_SORTABLE_ID_PREFIX = 'drag-drop-math-canvas-row:'
const CANVAS_TOKEN_SORTABLE_ID_PREFIX = 'drag-drop-math-canvas-token:'
const CANVAS_GAP_DROP_ID_PREFIX = 'drag-drop-math-canvas-gap:'
const CANVAS_SIGMA_DROP_ID_PREFIX = 'drag-drop-math-canvas-sigma:'

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

export function getCanvasSigmaDropId(rowId: string): string {
  return `${CANVAS_SIGMA_DROP_ID_PREFIX}${rowId}`
}
