import type { MathTokenShellState } from './math-token-shell.types'

export const DROP_NODE_VISUAL_STATES = [
  'default',
  'editing',
  'inactive',
  'disabled',
  'ghost',
  'error',
] as const

export type DropNodeVisualState = (typeof DROP_NODE_VISUAL_STATES)[number]

export type ResolveDropNodeVisualStateArgs = {
  disabled?: boolean
  isEditing: boolean
  /** Palette strip chips and other non-editable previews. */
  inactive?: boolean
  /** Math canvas tokens: evaluated result or invalid equation shell. */
  mathShell?: MathTokenShellState
}

export function resolveDropNodeVisualState({
  disabled = false,
  isEditing,
  inactive = false,
  mathShell = 'default',
}: ResolveDropNodeVisualStateArgs): DropNodeVisualState {
  if (disabled) return 'disabled'
  if (isEditing) return 'editing'
  if (!inactive && mathShell === 'error') return 'error'
  if (!inactive && mathShell === 'ghost' && !disabled) return 'ghost'
  if (inactive) return 'inactive'
  return 'default'
}
