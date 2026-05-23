export const DROP_NODE_VISUAL_STATES = ['default', 'editing', 'inactive', 'disabled'] as const

export type DropNodeVisualState = (typeof DROP_NODE_VISUAL_STATES)[number]

export type ResolveDropNodeVisualStateArgs = {
  disabled?: boolean
  isEditing: boolean
  /** Palette strip chips and other non-editable previews. */
  inactive?: boolean
}

export function resolveDropNodeVisualState({
  disabled = false,
  isEditing,
  inactive = false,
}: ResolveDropNodeVisualStateArgs): DropNodeVisualState {
  if (disabled) return 'disabled'
  if (isEditing) return 'editing'
  if (inactive) return 'inactive'
  return 'default'
}
