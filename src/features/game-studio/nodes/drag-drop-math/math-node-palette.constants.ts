import type { MathNodeVariant } from './math-node.types'

export type MathNodePalettePreset = {
  variant: MathNodeVariant
  value: string
  /** Palette-only: render static math chip instead of value. */
  showPaletteTemplate?: boolean
}

export const MATH_NODE_PALETTE_PRESETS: readonly MathNodePalettePreset[] = [
  { variant: 'math', value: '', showPaletteTemplate: true },
  { variant: 'text', value: '' },
]
