'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { VariantProps } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'

type HoldConfirmVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>

interface HoldConfirmButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'variant'> {
  /** Called when the user holds long enough to confirm. */
  onConfirm?: () => void
  holdDuration?: number
  variant?: HoldConfirmVariant
  /** Optional icon. Defaults to Check. */
  icon?: React.ReactNode
}

/** Blue-only progress and hold text (confirm semantics). */
const CONFIRM_PROGRESS_CLASS = 'bg-blue-200'
const CONFIRM_CONTENT_HOLD_CLASS = 'text-blue-600'

function HoldConfirmButton({
  className,
  variant = 'confirm',
  size = 'default',
  onConfirm,
  holdDuration = 3000,
  children,
  icon,
  ...props
}: HoldConfirmButtonProps) {
  const [isHolding, setIsHolding] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const holdStartRef = React.useRef<number | null>(null)
  const animationFrameRef = React.useRef<number | null>(null)

  const resetHold = React.useCallback(() => {
    setIsHolding(false)
    setProgress(0)
    holdStartRef.current = null
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const startHold = React.useCallback(() => {
    setIsHolding(true)
    holdStartRef.current = Date.now()

    const animate = () => {
      if (holdStartRef.current === null) return

      const elapsed = Date.now() - holdStartRef.current
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        onConfirm?.()
        resetHold()
      } else {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [holdDuration, onConfirm, resetHold])

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn('relative overflow-hidden select-none', className)}
      onMouseDown={startHold}
      onMouseUp={resetHold}
      onMouseLeave={resetHold}
      onTouchStart={startHold}
      onTouchEnd={resetHold}
      onTouchCancel={resetHold}
      {...props}
    >
      <span
        className={cn(
          'absolute inset-0 origin-left',
          CONFIRM_PROGRESS_CLASS,
          isHolding ? 'transition-none' : 'transition-transform duration-300 ease-out',
        )}
        style={{
          transform: `scaleX(${progress / 100})`,
        }}
      />

      <span
        className={cn(
          'relative z-10 flex items-center gap-2 transition-colors duration-150',
          isHolding && CONFIRM_CONTENT_HOLD_CLASS,
        )}
      >
        {icon ?? <Check className="size-5 shrink-0" />}
        <span>{children ?? 'Hold to Confirm'}</span>
      </span>
    </Button>
  )
}

export { HoldConfirmButton }
export type { HoldConfirmButtonProps, HoldConfirmVariant }
