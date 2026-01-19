import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressiveBlurProps {
  className?: string
  direction?: 'left' | 'right' | 'top' | 'bottom'
  blurIntensity?: number
}

export function ProgressiveBlur({
  className,
  direction = 'right',
  blurIntensity = 1,
}: ProgressiveBlurProps) {
  const gradientDirection = {
    left: 'to left',
    right: 'to right',
    top: 'to top',
    bottom: 'to bottom',
  }[direction]

  const blurStops = Array.from({ length: 10 }, (_, i) => {
    const position = i * 10
    return `rgba(0, 0, 0, 0) ${position}%`
  })

  return (
    <div
      className={cn('pointer-events-none absolute', className)}
      style={{
        background: `linear-gradient(${gradientDirection}, ${blurStops.join(', ')})`,
        backdropFilter: `blur(${blurIntensity * 8}px)`,
        WebkitBackdropFilter: `blur(${blurIntensity * 8}px)`,
      }}
    />
  )
}
