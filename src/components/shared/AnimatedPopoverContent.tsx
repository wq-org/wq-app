'use client'

import { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'

import { POPOVER_MOTION_TRANSITION, popoverSurfaceMotion } from './popoverMotion.config'

type AnimatedPopoverContentProps = Omit<
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  'asChild' | 'forceMount'
> & {
  /** Controlled `open` state of the parent Popover — drives the motion enter/exit. */
  open: boolean
  children: ReactNode
}

/** Static popover surface styles shared with `PopoverContent`, minus the CSS open/close
 * animations — motion owns the transition here. */
const POPOVER_SURFACE_BASE =
  'z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden'

/**
 * Drop-in animated alternative to `PopoverContent` that springs a subtle lift/fade/scale
 * on open and close via motion. Mirrors the command-palette pattern: `AnimatePresence`
 * around a `forceMount`ed Radix portal whose content is merged onto a `motion.div`.
 *
 * The parent `Popover` must be controlled and pass the same `open` value here so exit can
 * play before unmount.
 */
export function AnimatedPopoverContent({
  open,
  className,
  align = 'center',
  sideOffset = 4,
  children,
  ...props
}: AnimatedPopoverContentProps) {
  return (
    <AnimatePresence>
      {open ? (
        <PopoverPrimitive.Portal forceMount>
          <PopoverPrimitive.Content
            data-slot="popover-content"
            align={align}
            sideOffset={sideOffset}
            asChild
            {...props}
          >
            <motion.div
              className={cn(POPOVER_SURFACE_BASE, className)}
              initial={popoverSurfaceMotion.initial}
              animate={popoverSurfaceMotion.animate}
              exit={popoverSurfaceMotion.exit}
              transition={POPOVER_MOTION_TRANSITION}
            >
              {children}
            </motion.div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
}
