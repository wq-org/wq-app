import type { Transition } from 'motion/react'

/** Snappy ease-out when the overlay or dialog body first appears. */
export const COMMAND_PALETTE_OPEN_EASE: Transition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
}

/** Softer spring for in-dialog step changes and height resize. */
export const COMMAND_PALETTE_STEP_SPRING: Transition = {
  type: 'spring',
  bounce: 0.08,
  duration: 0.32,
}

/** Whole overlay panel — quick lift from the command bar on first open. */
export const commandPaletteDialogSurfaceMotion = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.99, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
} as const

/** Inner view / step — short lift on appear or swap. */
export const commandPaletteContentMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } },
} as const
