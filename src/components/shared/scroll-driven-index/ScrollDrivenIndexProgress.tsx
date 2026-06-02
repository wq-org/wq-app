import { cn } from '@/lib/utils'

type ScrollDrivenIndexProgressProps = {
  value?: number
  className?: string
}

export function ScrollDrivenIndexProgress({ value, className }: ScrollDrivenIndexProgressProps) {
  const hasValue = typeof value === 'number'

  return (
    <span
      data-slot="scroll-driven-index-progress"
      className={cn(
        'rounded-full bg-secondary px-2.5 py-1 text-xs leading-none font-medium tabular-nums text-secondary-foreground',
        className,
      )}
    >
      {hasValue ? `${value}%` : null}
    </span>
  )
}
