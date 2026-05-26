export const MATH_TOKEN_SHELL_STATES = ['default', 'ghost', 'error', 'success'] as const

export type MathTokenShellState = (typeof MATH_TOKEN_SHELL_STATES)[number]

export function isMathTokenShellState(value: unknown): value is MathTokenShellState {
  return typeof value === 'string' && (MATH_TOKEN_SHELL_STATES as readonly string[]).includes(value)
}
