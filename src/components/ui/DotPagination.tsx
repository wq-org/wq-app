'use client'

/**
 * DotPagination.tsx
 * ─────────────────────────────────────────────────────────────
 * Standalone dot pagination indicator.
 *
 * - Max 9 dots visible at once (configurable via `maxVisible`)
 * - When total > maxVisible, shows a sliding window with shrink
 *   effect on edge dots (like Apple's page control)
 * - Active dot expands to a pill shape
 * - Mobile-friendly: smaller dots on small screens via CSS
 * - Fully accessible: aria-label, aria-current, role="tablist"
 *
 * Named export:
 *   <DotPagination total={n} current={i} onChange={fn} />
 *
 * Props:
 *   total       — number of pages/slides
 *   current     — active index (0-based)
 *   onChange    — called with new index on dot click
 *   maxVisible  — max dots shown (default: 9)
 *   className   — extra classes on the root
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DotPaginationProps {
  total: number
  current: number
  onChange?: (index: number) => void
  maxVisible?: number
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the window of indices to show and a scale for each dot.
 * Edge dots shrink to signal "more content" in that direction.
 */
function getWindow(
  total: number,
  current: number,
  maxVisible: number,
): { indices: number[]; scales: number[] } {
  if (total <= maxVisible) {
    return {
      indices: Array.from({ length: total }, (_, i) => i),
      scales: Array.from({ length: total }, () => 1),
    }
  }

  // Keep active dot roughly centered, clamped to valid range
  const half = Math.floor(maxVisible / 2)
  let start = current - half
  let end = current + (maxVisible - half - 1)

  if (start < 0) {
    start = 0
    end = maxVisible - 1
  }
  if (end >= total) {
    end = total - 1
    start = total - maxVisible
  }

  const indices = Array.from({ length: maxVisible }, (_, i) => start + i)

  // Scale: edge dots shrink when there's overflow in that direction
  const scales = indices.map((idx, pos) => {
    const isLeftEdge = pos === 0 && start > 0
    const isLeftNear = pos === 1 && start > 0
    const isRightEdge = pos === maxVisible - 1 && end < total - 1
    const isRightNear = pos === maxVisible - 2 && end < total - 1

    if (isLeftEdge || isRightEdge) return 0.35
    if (isLeftNear || isRightNear) return 0.65
    return 1
  })

  return { indices, scales }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DotPagination({
  total,
  current,
  onChange,
  maxVisible = 9,
  className,
}: DotPaginationProps) {
  if (total <= 1) return null

  const { indices, scales } = getWindow(total, current, maxVisible)

  return (
    <div
      role="tablist"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1.5 sm:gap-2', className)}
    >
      {indices.map((idx, pos) => {
        const isActive = idx === current
        const scale = scales[pos]

        return (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-label={`Go to slide ${idx + 1} of ${total}`}
            aria-current={isActive ? 'true' : 'false'}
            aria-selected={isActive}
            onClick={() => onChange?.(idx)}
            className={cn(
              // Base
              'rounded-full focus:outline-none',
              'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400',
              'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
              // Size — active pill vs inactive dot
              isActive
                ? 'h-2.5 w-6 sm:h-3 sm:w-8 bg-neutral-800'
                : 'h-2.5 w-2.5 sm:h-3 sm:w-3 bg-neutral-400 hover:bg-neutral-600',
            )}
            style={{
              transform: `scale(${scale})`,
              opacity: scale < 0.5 ? 0.5 : 1,
              // Soften pointer on shrunken edge dots
              pointerEvents: scale < 0.5 ? 'none' : 'auto',
              transition:
                'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), ' +
                'opacity 0.3s ease, ' +
                'width 0.3s cubic-bezier(0.34,1.56,0.64,1), ' +
                'background-color 0.2s ease',
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

export default function DotPaginationDemo() {
  const [current5, setCurrent5] = React.useState(0)
  const [current9, setCurrent9] = React.useState(0)
  const [current20, setCurrent20] = React.useState(0)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-16 p-8">
      {/* 5 items — all visible */}
      <section className="flex flex-col items-center gap-3">
        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          5 items — all shown
        </p>
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrent5(i)}
              className={cn(
                'px-3 py-1 rounded text-xs',
                current5 === i ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-500',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <DotPagination
          total={5}
          current={current5}
          onChange={setCurrent5}
        />
      </section>

      {/* 9 items — exactly at limit */}
      <section className="flex flex-col items-center gap-3">
        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          9 items — at limit
        </p>
        <div className="flex gap-1 flex-wrap justify-center">
          {Array.from({ length: 9 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrent9(i)}
              className={cn(
                'px-2.5 py-1 rounded text-xs',
                current9 === i ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-500',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <DotPagination
          total={9}
          current={current9}
          onChange={setCurrent9}
        />
      </section>

      {/* 20 items — windowed */}
      <section className="flex flex-col items-center gap-3">
        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          20 items — windowed (max 9)
        </p>
        <div className="flex gap-1 flex-wrap justify-center max-w-xs">
          {Array.from({ length: 20 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrent20(i)}
              className={cn(
                'w-7 py-1 rounded text-xs',
                current20 === i ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-500',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <DotPagination
          total={20}
          current={current20}
          onChange={setCurrent20}
        />
        <p className="text-xs text-neutral-400">slide {current20 + 1} / 20</p>
      </section>
    </div>
  )
}
