'use client'

import * as React from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { VariantProps } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Text } from '@/components/ui/text'
import Spinner from './spinner'

type HoldToDeleteVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>

interface HoldToDeleteButtonProps extends Omit<React.ComponentProps<typeof Button>, 'variant'> {
  onDelete?: () => void
  holdDuration?: number
  loading?: boolean
  variant?: HoldToDeleteVariant
  /** Optional icon (e.g. Check for confirm). Defaults to Trash2. */
  icon?: React.ReactNode
}

const progressFillClass: Record<NonNullable<HoldToDeleteVariant>, string> = {
  default: 'bg-primary/30',
  destructive: 'bg-destructive/40',
  outline: 'bg-destructive/20',
  secondary: 'bg-destructive/20',
  ghost: 'bg-destructive/20',
  link: 'bg-destructive/20',
  delete: 'bg-red-200',
  confirm: 'bg-blue-200',
  active: 'bg-emerald-200',
}

/** Text + icon color when holding (contrasts with progress fill) */
const contentHoldClass: Record<NonNullable<HoldToDeleteVariant>, string> = {
  default: 'text-primary-foreground',
  destructive: 'text-white',
  outline: 'text-destructive',
  secondary: 'text-destructive',
  ghost: 'text-destructive',
  link: 'text-destructive',
  delete: 'text-red-600',
  confirm: 'text-blue-600',
  active: 'text-emerald-700',
}

function HoldToDeleteButton({
  className,
  variant = 'secondary',
  size = 'default',
  onDelete,
  holdDuration = 3000,
  children,
  icon,
  loading = false,
  ...props
}: HoldToDeleteButtonProps) {
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
        onDelete?.()
        resetHold()
      } else {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [holdDuration, onDelete, resetHold])

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const progressClass = progressFillClass[variant] ?? progressFillClass.secondary
  const contentWhenHoldingClass = contentHoldClass[variant] ?? contentHoldClass.secondary

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
      {/* Progress fill background */}
      <Text
        as="span"
        variant="small"
        className={cn(
          'absolute inset-0 origin-left',
          progressClass,
          isHolding ? 'transition-none' : 'transition-transform duration-300 ease-out',
        )}
        style={{
          transform: `scaleX(${progress / 100})`,
        }}
      />

      {/* Content: text and icon adapt color when holding */}
      <Text
        as="span"
        variant="small"
        className={cn(
          'relative z-10 flex items-center gap-2 transition-colors duration-150',
          isHolding && contentWhenHoldingClass,
        )}
      >
        {icon ??
          (!loading ? (
            <Trash2 className="size-5 shrink-0" />
          ) : (
            <Spinner
              size="sm"
              color="gray"
            />
          ))}

        <Text
          as="span"
          variant="small"
        >
          {children ?? 'Hold to Delete'}
        </Text>
      </Text>
    </Button>
  )
}

export { HoldToDeleteButton }
export type { HoldToDeleteButtonProps, HoldToDeleteVariant }
