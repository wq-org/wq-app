export const MATH_TOKEN_ROLES = ['equation', 'equals', 'result'] as const

export type MathTokenRole = (typeof MATH_TOKEN_ROLES)[number]

export function isMathTokenRole(value: unknown): value is MathTokenRole {
  return typeof value === 'string' && (MATH_TOKEN_ROLES as readonly string[]).includes(value)
}
