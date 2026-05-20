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
      className={cn('scroll-driven-index__progress', className)}
    >
      {hasValue ? `${value}%` : null}
    </span>
  )
}
