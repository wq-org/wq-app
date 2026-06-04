import { cn } from '@/lib/utils'

const DOT_INACTIVE = 'bg-muted-foreground/45'
const DOT_ACTIVE = 'bg-[oklch(var(--oklch-orange))]'

export type IfElseVerticalOutputDotsProps = {
  /** Highlights the top dot (branch A / upper handle). */
  topActive?: boolean
  /** Highlights the bottom dot (branch B / lower handle). */
  bottomActive?: boolean
  /** `inline` for label meta; `handle` for canvas port markers. */
  variant?: 'inline' | 'handle'
  className?: string
}

/** Tiny stacked dots matching If/Else output handles (top = A, bottom = B). */
export function IfElseVerticalOutputDots({
  topActive = false,
  bottomActive = false,
  variant = 'inline',
  className,
}: IfElseVerticalOutputDotsProps) {
  const dotSize = variant === 'handle' ? 'size-1' : 'size-0.5'
  const gapClass = variant === 'handle' ? 'gap-0.5' : 'gap-px'

  return (
    <span
      className={cn('inline-flex flex-col items-center', gapClass, className)}
      aria-hidden
    >
      <span
        className={cn(
          'block shrink-0 rounded-full',
          dotSize,
          topActive ? DOT_ACTIVE : DOT_INACTIVE,
        )}
      />
      <span
        className={cn(
          'block shrink-0 rounded-full',
          dotSize,
          bottomActive ? DOT_ACTIVE : DOT_INACTIVE,
        )}
      />
    </span>
  )
}
