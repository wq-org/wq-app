"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const RING_SIZES = {
  xs: { ring: 28, stroke: 2, button: "size-6", icon: "size-3" },
  sm: { ring: 36, stroke: 2, button: "size-7", icon: "size-4" },
  md: { ring: 44, stroke: 3, button: "size-8", icon: "size-4" },
  lg: { ring: 52, stroke: 3, button: "size-9", icon: "size-5" },
  xl: { ring: 60, stroke: 4, button: "size-10", icon: "size-5" },
} as const

type RingSize = keyof typeof RING_SIZES

interface HoldToDeleteIconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "size" | "variant"> {
  onDelete?: () => void
  holdDuration?: number
  /** Preset ring size: xs | sm | md | lg | xl */
  size?: RingSize
}

function HoldToDeleteIconButton({
  className,
  onDelete,
  holdDuration = 3000,
  size = "lg",
  ...props
}: HoldToDeleteIconButtonProps) {
  const { ring: ringSize, stroke: strokeWidth } = RING_SIZES[size]
  const { button: buttonSizeClass, icon: iconSizeClass } = RING_SIZES[size]
  const [isHolding, setIsHolding] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [completed, setCompleted] = React.useState(false)
  const holdStartRef = React.useRef<number | null>(null)
  const animationFrameRef = React.useRef<number | null>(null)

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

  return (
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
            "text-muted transition-colors duration-200",
            (isHolding || completed) && "text-red-100"
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
            "text-destructive transition-[stroke-dashoffset]",
            isHolding ? "duration-0" : "duration-300 ease-out",
            completed && "text-red-500"
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
            "text-red-100/60",
            isHolding ? "duration-0" : "transition-[stroke-dashoffset] duration-300 ease-out"
          )}
        />
      </svg>

      {/* Icon button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative z-10 rounded-full",
          buttonSizeClass,
          "text-muted-foreground",
          "hover:bg-transparent hover:text-destructive",
          isHolding && "text-destructive scale-90",
          completed && "text-destructive scale-75",
          "transition-all duration-200",
          className
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
            "transition-transform duration-200",
            isHolding && "rotate-90",
            completed && "rotate-180"
          )}
        />
        <span className="sr-only">Hold to delete</span>
      </Button>
    </div>
  )
}

export { HoldToDeleteIconButton }
export type { RingSize }
