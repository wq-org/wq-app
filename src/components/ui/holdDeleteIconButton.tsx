'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const RING_SIZES = {
  xs: { ring: 28, stroke: 2, button: 'size-6', icon: 'size-3' },
  sm: { ring: 36, stroke: 2, button: 'size-7', icon: 'size-4' },
  md: { ring: 44, stroke: 3, button: 'size-8', icon: 'size-4' },
  lg: { ring: 52, stroke: 3, button: 'size-9', icon: 'size-5' },
  xl: { ring: 60, stroke: 4, button: 'size-10', icon: 'size-5' },
} as const

type RingSize = keyof typeof RING_SIZES

// Default English copy (hardcoded; override via props for translation)
const DEFAULT_HOLD_MESSAGE = (seconds: number) =>
  `Hold for ${seconds} second${seconds !== 1 ? 's' : ''} to delete.`
const DEFAULT_DELETING_IN = (seconds: number) => `Deleting in ${seconds}s`
const DEFAULT_DELETING = 'Deleting…'

interface HoldToDeleteIconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'size' | 'variant'> {
  onDelete?: () => void
  holdDuration?: number
  /** Preset ring size: xs | sm | md | lg | xl */
  size?: RingSize
  /** Delay in ms before showing the "hold to delete" tooltip (countdown tooltip shows immediately). Default 500 */
  tooltipDelayDuration?: number
  /** Tooltip title (set from outside for translation, e.g. t('holdDelete.title')) */
  tooltipTitle?: string
  /** Tooltip description (set from outside for translation, e.g. t('holdDelete.description')) */
  tooltipDescription?: string
  /** "Hold for X seconds to delete" message (set from outside for translation). Receives seconds. */
  tooltipHoldMessage?: string | ((seconds: number) => string)
  /** "Deleting in Xs" message (set from outside for translation). Receives remaining seconds. */
  tooltipDeletingIn?: (seconds: number) => string
  /** "Deleting…" message (set from outside for translation) */
  tooltipDeleting?: string
}

const holdDurationSeconds = (ms: number) => Math.ceil(ms / 1000)

function HoldToDeleteIconButton({
  className,
  onDelete,
  holdDuration = 3000,
  size = 'lg',
  tooltipDelayDuration = 500,
  tooltipTitle,
  tooltipDescription,
  tooltipHoldMessage = DEFAULT_HOLD_MESSAGE,
  tooltipDeletingIn = DEFAULT_DELETING_IN,
  tooltipDeleting = DEFAULT_DELETING,
  ...props
}: HoldToDeleteIconButtonProps) {
  const { ring: ringSize, stroke: strokeWidth } = RING_SIZES[size]
  const { icon: iconSizeClass } = RING_SIZES[size]
  const [isHolding, setIsHolding] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [completed, setCompleted] = React.useState(false)
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const holdStartRef = React.useRef<number | null>(null)
  const animationFrameRef = React.useRef<number | null>(null)

  const secondsTotal = holdDurationSeconds(holdDuration)
  const secondsRemaining = Math.max(0, Math.ceil((holdDuration / 1000) * (1 - progress)))

  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = ringSize / 2

  const startHold = React.useCallback(() => {
    if (completed) return
    setIsHolding(true)
    holdStartRef.current = Date.now()

    const animate = () => {
      if (holdStartRef.current === null) return

      const elapsed = Date.now() - holdStartRef.current
      const newProgress = Math.min(elapsed / holdDuration, 1)
      setProgress(newProgress)

      if (newProgress >= 1) {
        setCompleted(true)
        setIsHolding(false)
        holdStartRef.current = null
        onDelete?.()
        // Reset after a brief moment
        setTimeout(() => {
          setProgress(0)
          setCompleted(false)
        }, 600)
      } else {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [holdDuration, onDelete, completed])

  const resetHold = React.useCallback(() => {
    if (completed) return
    setIsHolding(false)
    holdStartRef.current = null
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    // Animate progress back to 0
    setProgress(0)
  }, [completed])

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // SVG arc offset: full circumference = empty, 0 = full circle
  const strokeDashoffset = circumference * (1 - progress)

  const holdMessage =
    typeof tooltipHoldMessage === 'function' ? tooltipHoldMessage(secondsTotal) : tooltipHoldMessage

  const tooltipContent = isHolding ? (
    <TooltipContent variant="destructive">
      {secondsRemaining > 0 ? tooltipDeletingIn(secondsRemaining) : tooltipDeleting}
    </TooltipContent>
  ) : (
    <TooltipContent variant="destructive">
      <div className="space-y-0.5">
        {tooltipTitle && <p className="font-semibold">{tooltipTitle}</p>}
        {tooltipDescription && <p className="opacity-90">{tooltipDescription}</p>}
        <p>{holdMessage}</p>
      </div>
    </TooltipContent>
  )

  return (
    <Tooltip
      delayDuration={isHolding ? 0 : tooltipDelayDuration}
      open={tooltipOpen || isHolding}
      onOpenChange={(open) => {
        if (!isHolding) setTooltipOpen(open)
      }}
    >
      <TooltipTrigger asChild>
        <div
          className="relative inline-flex items-center justify-center"
          style={{ width: ringSize, height: ringSize }}
        >
          {/* SVG progress ring */}
          <svg
            className="absolute inset-0 -rotate-90 rounded-full"
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
          >
            {/* Background track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className={cn(
                'text-muted transition-colors duration-200',
                (isHolding || completed) && 'text-red-100',
              )}
            />
            {/* Progress arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                'text-destructive transition-[stroke-dashoffset]',
                isHolding ? 'duration-0' : 'duration-300 ease-out',
                completed && 'text-red-500',
              )}
            />
          </svg>

          {/* Pie fill background (fills inside the circle) */}
          <svg
            className="absolute inset-0 -rotate-90 rounded-full"
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
          >
            <circle
              cx={center}
              cy={center}
              r={radius - strokeWidth}
              fill="none"
              stroke="currentColor"
              strokeWidth={(radius - strokeWidth) * 2}
              strokeDasharray={2 * Math.PI * (radius - strokeWidth)}
              strokeDashoffset={2 * Math.PI * (radius - strokeWidth) * (1 - progress)}
              className={cn(
                'text-red-100/60',
                isHolding ? 'duration-0' : 'transition-[stroke-dashoffset] duration-300 ease-out',
              )}
            />
          </svg>

          {/* Icon button: same size as ring so X is centered in the circle */}
          <Button
            variant="ghost"
            size="icon"
            style={{ width: ringSize, height: ringSize }}
            className={cn(
              'relative z-10 rounded-full shrink-0',
              'text-muted-foreground',
              'hover:bg-transparent hover:text-destructive',
              isHolding && 'text-destructive scale-90',
              completed && 'text-destructive scale-75',
              'transition-all duration-200',
              'flex items-center justify-center',
              className,
            )}
            onMouseDown={startHold}
            onMouseUp={resetHold}
            onMouseLeave={resetHold}
            onTouchStart={startHold}
            onTouchEnd={resetHold}
            onTouchCancel={resetHold}
            {...props}
          >
            <X
              className={cn(
                iconSizeClass,
                'shrink-0 transition-transform duration-200',
                isHolding && 'rotate-90',
                completed && 'rotate-180',
              )}
            />
            <span className="sr-only">Hold to delete</span>
          </Button>
        </div>
      </TooltipTrigger>
      {tooltipContent}
    </Tooltip>
  )
}

export { HoldToDeleteIconButton }
export type { RingSize }
