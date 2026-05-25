import type { MathNodeVariant } from '../types/math-node.types'

export const DROP_NODE_DEFAULT_VALUE_KEYS = {
  math: 'dragDropMathEditor.mathNodeDefaultValue',
  text: 'dragDropMathEditor.textNodeDefaultValue',
} as const

export function resolveDropNodeDefaultValue(
  variant: MathNodeVariant,
  value: string,
  translate: (key: string) => string,
): string {
  if (value.trim().length > 0) return value
  return translate(DROP_NODE_DEFAULT_VALUE_KEYS[variant])
}
