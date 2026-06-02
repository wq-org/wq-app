export const MATH_NODE_VARIANTS = ['math', 'text', 'sigma'] as const

export type MathNodeVariant = (typeof MATH_NODE_VARIANTS)[number]

export function isMathNodeVariant(value: unknown): value is MathNodeVariant {
  return typeof value === 'string' && (MATH_NODE_VARIANTS as readonly string[]).includes(value)
}
