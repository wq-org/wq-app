import type { Transition } from 'motion/react'

/** Subtle ease-out used when a popover surface first appears (mirrors command palette). */
export const POPOVER_MOTION_TRANSITION: Transition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
}

/** Subtle lift + fade + scale for popover surfaces; exit is a touch quicker. */
export const popoverSurfaceMotion = {
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } },
} as const
