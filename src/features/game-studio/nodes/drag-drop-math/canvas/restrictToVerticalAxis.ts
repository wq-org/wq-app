import type { Modifier } from '@dnd-kit/core'

/**
 * Locks the dragged element to the y-axis. Applied to DndContext only while a row
 * is being reordered, so vertical sortable translation stays smooth without
 * horizontal jitter. (Mirror of `@dnd-kit/modifiers`'s built-in, kept inline so we
 * do not need a new dependency.)
 */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
})
