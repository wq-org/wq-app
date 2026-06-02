import * as React from 'react'

import { cn } from '@/lib/utils'

import { zoomiesVariants, type ZoomiesColorVariant } from './zoomies-variants'

export type ZoomiesProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> & {
  /** Matches `zoomies-variants` / button spectrum; default follows theme foreground (light ≈ black, dark ≈ white). */
  color?: ZoomiesColorVariant
  /** Track width in px. Default `100`. */
  size?: number
  /** Animation duration in seconds. Default `1.4`. */
  speed?: number
  /** Track height in px. Default `6`. */
  stroke?: number
  /**
   * Width of the sliding bar as % of the track. Omit or `undefined` for full bar (same as “N/A” in tooling).
   */
  strokeLength?: number
  /** Background layer opacity (underlay). Default `0.1`. */
  bgOpacity?: number
}

export function Zoomies({
  color = 'default',
  size = 100,
  speed = 1.4,
  stroke = 6,
  strokeLength,
  bgOpacity = 0.1,
  className,
  style,
  ...props
}: ZoomiesProps) {
  const cssVars = {
    '--uib-size': `${size}px`,
    '--uib-speed': `${speed}s`,
    '--uib-stroke': `${stroke}px`,
    '--uib-bg-opacity': bgOpacity,
    ...(strokeLength != null && strokeLength > 0 && strokeLength <= 100
      ? { '--uib-bar-width': `${strokeLength}%` }
      : {}),
  } as React.CSSProperties

  return (
    <div
      data-slot="zoomies"
      className={cn(zoomiesVariants({ color }), className)}
      style={{ ...cssVars, ...style }}
      {...props}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 transition-colors duration-300 ease-in-out',
          'bg-(--uib-color) opacity-(--uib-bg-opacity)',
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-0 top-0 h-full transition-colors duration-300 ease-in-out',
          'w-(--uib-bar-width,100%) rounded-[calc(var(--uib-stroke)/2)] bg-(--uib-color)',
        )}
        style={{
          animation: 'zoomies-slide var(--uib-speed) ease-in-out infinite',
        }}
      />
    </div>
  )
}
