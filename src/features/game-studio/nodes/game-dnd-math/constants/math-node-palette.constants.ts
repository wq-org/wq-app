import type { MathNodeVariant } from '../types/math-node.types'

export type MathNodePalettePreset = {
  variant: MathNodeVariant
  value: string
  /** Palette-only: render static math chip instead of value. */
  showPaletteTemplate?: boolean
}

/** Block presets only — units are typed into equation chips (registry resolves on Enter). */
export const MATH_NODE_PALETTE_PRESETS: readonly MathNodePalettePreset[] = [
  { variant: 'math', value: '', showPaletteTemplate: true },
  { variant: 'sigma', value: '', showPaletteTemplate: true },
  { variant: 'text', value: '' },
]
