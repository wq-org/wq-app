import type { MathNodeVariant } from './MathNode'

export const MATH_NODE_PALETTE_PRESETS: ReadonlyArray<{
  variant: MathNodeVariant
  value: string
}> = [
  { variant: 'default', value: '10km + 20€' },
  { variant: 'ghost', value: '× 50' },
]
