import { isMathNodeVariant, type MathNodeVariant } from './math-node.types'

export type MathNodePaletteDragData = {
  source: 'palette'
  variant: MathNodeVariant
  value: string
}

export type MathNodeDragData = MathNodePaletteDragData

export const MATH_NODE_DRAG_DATA_KEY = 'mathNodeDrag' as const

export function getMathNodeDragData(activeData: unknown): MathNodeDragData | null {
  if (!activeData || typeof activeData !== 'object') return null
  const payload = (activeData as Record<string, unknown>)[MATH_NODE_DRAG_DATA_KEY]
  if (!payload || typeof payload !== 'object') return null
  const source = (payload as { source?: unknown }).source
  if (source !== 'palette') return null
  const variant = (payload as { variant?: unknown }).variant
  const value = (payload as { value?: unknown }).value
  if (!isMathNodeVariant(variant) || typeof value !== 'string') return null
  return { source: 'palette', variant, value }
}
