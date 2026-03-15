'use client'

/**
 * GridIconBackground.tsx
 * ─────────────────────────────────────────────────────────────
 * Grid pattern background with floating/bouncing icon chips.
 * Drop it behind any page section.
 *
 * Named exports:
 *   <GridIconBackground icons={[...]} />   — full component
 *   <GridPattern />                         — grid SVG only
 *
 * IconEntry shape:
 *   { icon: LucideIcon, color: string, bgColor: string, borderColor: string }
 *
 * When no icons prop is passed → single default blue BookOpen icon.
 *
 * Deps: lucide-react, Tailwind CSS, cn helper
 */

import * as React from 'react'
import { BookOpen, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GridPattern } from '../ui/grid-pattern'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IconEntry {
  icon: LucideIcon
  color: string // Tailwind text class  e.g. "text-blue-500"
  bgColor: string // Tailwind bg class    e.g. "bg-blue-500/10"
  borderColor: string // Tailwind border class e.g. "border-blue-500/20"
}

export interface GridIconBackgroundProps {
  icons?: readonly IconEntry[]
  /** Extra classes on the root wrapper */
  className?: string
  /** Content rendered on top of the background */
  children?: React.ReactNode
  /** Grid cell size in px. Default: 40 */
  gridSize?: number
}

// ─── Default icon ─────────────────────────────────────────────────────────────

const DEFAULT_ICONS: IconEntry[] = [
  {
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
]

const GRID_BACKGROUND_MASK =
  'radial-gradient(ellipse 72% 62% at 50% 50%, transparent 18%, color-mix(in srgb, var(--background) 35%, transparent) 62%, var(--background) 100%)'

// ─── Bounce keyframes (injected once) ────────────────────────────────────────

const BOUNCE_CSS = `
  @keyframes gridIconBounce {
    0%, 100% { transform: translateY(0px);  }
    50%       { transform: translateY(-14px); }
  }
`

let cssInjected = false
function ensureCSS() {
  if (cssInjected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = BOUNCE_CSS
  document.head.appendChild(style)
  cssInjected = true
}

// ─── Floating positions (deterministic from index) ───────────────────────────
// Spread icons across a rough 3×3 to 4×3 grid of zones so they don't overlap.

const ZONES = [
  { top: '12%', left: '10%' },
  { top: '10%', left: '38%' },
  { top: '12%', left: '66%' },
  { top: '10%', left: '84%' },
  { top: '42%', left: '6%' },
  { top: '45%', left: '30%' },
  { top: '42%', left: '58%' },
  { top: '44%', left: '80%' },
  { top: '72%', left: '14%' },
  { top: '74%', left: '44%' },
  { top: '70%', left: '70%' },
  { top: '73%', left: '90%' },
]

// ─── Single icon chip ─────────────────────────────────────────────────────────

interface IconChipProps {
  entry: IconEntry
  zoneIndex: number
}

function IconChip({ entry, zoneIndex }: IconChipProps) {
  const { icon: Icon, color, bgColor, borderColor } = entry
  const zone = ZONES[zoneIndex % ZONES.length]

  // Each chip gets a unique duration and delay so they bob independently
  const duration = 2.8 + (zoneIndex % 5) * 0.55 // 2.8s – 5.0s
  const delay = (zoneIndex % 7) * 0.38 // 0 – 2.28s

  return (
    <div
      className={cn(
        'absolute flex items-center justify-center',
        'h-12 w-12 rounded-2xl border',
        'shadow-sm backdrop-blur-[2px] dark:shadow-black/20',
        bgColor,
        borderColor,
      )}
      style={{
        top: zone.top,
        left: zone.left,
        animation: `gridIconBounce ${duration}s ease-in-out ${delay}s infinite`,
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      <Icon
        className={cn('h-5 w-5', color)}
        strokeWidth={1.75}
      />
    </div>
  )
}

// ─── GridIconBackground ───────────────────────────────────────────────────────

export function GridIconBackground({
  icons = DEFAULT_ICONS,
  className,
  children,
  gridSize = 40,
}: GridIconBackgroundProps) {
  React.useEffect(() => {
    ensureCSS()
  }, [])

  const entries = icons.length > 0 ? icons : DEFAULT_ICONS

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Grid SVG background */}
      <GridPattern
        width={gridSize}
        height={gridSize}
      />

      {/* Radial fade mask so grid fades toward edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: GRID_BACKGROUND_MASK,
        }}
      />

      {/* Bouncing icon chips */}
      {entries.map((entry, i) => (
        <IconChip
          key={i}
          entry={entry}
          zoneIndex={i}
        />
      ))}

      {/* Slot for page content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}
