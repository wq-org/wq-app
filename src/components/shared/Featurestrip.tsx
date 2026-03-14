'use client'

/**
 * FeatureStrip.tsx
 * ─────────────────────────────────────────────────────────────
 * App Store–style horizontal metadata strip.
 *
 * Named exports:
 *   <FeatureStrip items={[]} />   — composed strip
 *   <FeatureStripItem />          — single cell (use standalone)
 *
 * Item types (discriminated union via `kind`):
 *
 *   kind: 'stat'     — topLabel / value / bottomLabel
 *   kind: 'rating'   — topLabel (count) / numeric rating / stars
 *   kind: 'icon'     — topLabel / icon node / bottomLabel
 *
 * Usage:
 *   <FeatureStrip items={[
 *     { kind: 'rating', topLabel: '8.3K Ratings', rating: 4.5, max: 5 },
 *     { kind: 'stat',   topLabel: 'Ages',   value: '4+',    bottomLabel: 'Years' },
 *     { kind: 'icon',   topLabel: 'Category', icon: <Send />, bottomLabel: 'Productivity' },
 *   ]} />
 */

import * as React from 'react'
import { Separator } from '@/components/ui/separator'
import { StarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Item types ───────────────────────────────────────────────────────────────
type FeatureItemBase = {
  onClick?: () => void
  ariaLabel?: string
  className?: string
}

export type StatItem = FeatureItemBase & {
  kind: 'stat'
  topLabel: string
  /** Large centre value — string or number */
  value: React.ReactNode
  bottomLabel?: string
}

export type RatingItem = FeatureItemBase & {
  kind: 'rating'
  /** e.g. "8.3K Ratings" */
  topLabel: string
  rating: number
  max?: number
}

export type IconItem = FeatureItemBase & {
  kind: 'icon'
  topLabel: string
  /** Lucide icon or any ReactNode */
  icon: React.ReactNode
  bottomLabel?: string
}

export type FeatureItem = StatItem | RatingItem | IconItem

// ─── Stars (read-only, partial fill) ─────────────────────────────────────────

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = rating >= i + 1
        const partial = rating > i && rating < i + 1
        const fillPct = partial ? (rating - i) * 100 : 0

        return (
          <span
            key={i}
            className="relative inline-flex h-3.5 w-3.5"
          >
            <StarIcon className="h-3.5 w-3.5 text-muted-foreground/30" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? '100%' : `${fillPct}%` }}
            >
              <StarIcon className="h-3.5 w-3.5 fill-current text-foreground/70" />
            </span>
          </span>
        )
      })}
    </div>
  )
}

// ─── Single cell ──────────────────────────────────────────────────────────────

export type FeatureStripItemProps = {
  item: FeatureItem
  className?: string
}

export function FeatureStripItem({ item, className }: FeatureStripItemProps) {
  const isInteractive = typeof item.onClick === 'function'
  const sharedClasses = cn(
    'flex min-w-0 flex-1 flex-col items-center justify-between gap-1 px-3 py-2 text-center',
    className,
    item.className,
    isInteractive ? 'cursor-pointer rounded-md transition-colors hover:bg-muted/40' : undefined,
  )

  const content = (
    <>
      {/* Top label */}
      <span className="max-w-full truncate text-xs font-medium text-muted-foreground">
        {item.topLabel}
      </span>

      {/* Middle — rating number / stat value / icon */}
      {item.kind === 'rating' && (
        <span className="text-2xl font-bold leading-none text-foreground">
          {item.rating.toFixed(1)}
        </span>
      )}

      {item.kind === 'stat' && (
        <span className="text-2xl font-bold leading-none text-foreground">{item.value}</span>
      )}

      {item.kind === 'icon' && (
        <span className="flex h-7 w-7 items-center justify-center text-foreground [&>svg]:h-6 [&>svg]:w-6 [&>svg]:stroke-[1.5]">
          {item.icon}
        </span>
      )}

      {/* Bottom — stars / bottomLabel */}
      {item.kind === 'rating' && (
        <Stars
          rating={item.rating}
          max={item.max}
        />
      )}

      {(item.kind === 'stat' || item.kind === 'icon') && item.bottomLabel && (
        <span className="max-w-full truncate text-[11px] text-muted-foreground">
          {item.bottomLabel}
        </span>
      )}

      {/* Spacer when no bottom content so cells align */}
      {(item.kind === 'stat' || item.kind === 'icon') && !item.bottomLabel && (
        <span
          className="h-3.5"
          aria-hidden
        />
      )}
    </>
  )

  if (isInteractive) {
    return (
      <button
        type="button"
        className={sharedClasses}
        onClick={item.onClick}
        aria-label={item.ariaLabel}
      >
        {content}
      </button>
    )
  }

  return <div className={sharedClasses}>{content}</div>
}

// ─── Strip ────────────────────────────────────────────────────────────────────

export type FeatureStripProps = {
  items: FeatureItem[]
  className?: string
}

export function FeatureStrip({ items, className }: FeatureStripProps) {
  return (
    <div className={cn('w-full', className)}>
      <Separator className="bg-border" />
      <div className="flex items-stretch">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <FeatureStripItem item={item} />
            {i < items.length - 1 && (
              <Separator
                orientation="vertical"
                className="my-2 bg-border"
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <Separator className="bg-border" />
    </div>
  )
}
