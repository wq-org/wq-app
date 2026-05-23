export const DRAG_DROP_MATH_CANVAS_DROP_ID = 'drag-drop-math-canvas' as const

export const MATH_NODE_PALETTE_DRAG_IDS = {
  math: 'math-node-palette-math',
  text: 'math-node-palette-text',
} as const

export function getMathNodeCanvasDragId(tokenId: string): string {
  return `math-node-canvas-${tokenId}`
}
