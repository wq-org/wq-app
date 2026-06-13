'use client'

import { type ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'

import {
  COMMAND_PALETTE_OPEN_EASE,
  COMMAND_PALETTE_STEP_SPRING,
  commandPaletteContentMotion,
} from './commandPaletteMotion.config'

type CommandPaletteContentEnterProps = {
  children: ReactNode
  className?: string
}

/** One-shot enter for a dialog body when the overlay first shows that view. */
export function CommandPaletteContentEnter({
  children,
  className,
}: CommandPaletteContentEnterProps) {
  return (
    <motion.div
      className={className}
      initial={commandPaletteContentMotion.initial}
      animate={commandPaletteContentMotion.animate}
      transition={COMMAND_PALETTE_OPEN_EASE}
    >
      {children}
    </motion.div>
  )
}

type CommandPaletteMotionShellProps = {
  /** Stable key per view/step — drives exit/enter and layout pop. */
  contentKey: string
  children: ReactNode
  className?: string
  innerClassName?: string
}

/**
 * Fluid-resizing shell for command-palette overlays: measures content and springs
 * width/height while cross-fading between steps via AnimatePresence.
 */
export function CommandPaletteMotionShell({
  contentKey,
  children,
  className,
  innerClassName,
}: CommandPaletteMotionShellProps) {
  const [ref, bounds] = useMeasure({ offsetSize: true })

  return (
    <MotionConfig transition={COMMAND_PALETTE_STEP_SPRING}>
      <motion.div
        className={cn('w-full', className)}
        animate={{
          width: '100%',
          height: bounds.height > 0 ? bounds.height : 'auto',
        }}
        style={{ overflow: 'hidden' }}
      >
        <div
          ref={ref}
          className={innerClassName}
        >
          <AnimatePresence
            mode="popLayout"
            initial={false}
          >
            <motion.div
              key={contentKey}
              initial={commandPaletteContentMotion.initial}
              animate={commandPaletteContentMotion.animate}
              exit={commandPaletteContentMotion.exit}
              transition={COMMAND_PALETTE_OPEN_EASE}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  )
}
