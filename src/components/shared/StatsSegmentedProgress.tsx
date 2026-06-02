import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatsSegmentedProgressSegment = {
  label: string
  value: number
  color: string
}

export type StatsSegmentedProgressProps = {
  title?: string
  /** Used amount in the same unit as `total` and segment `value`s (e.g. GB). */
  used?: number
  /** Total capacity in the same unit as `used` and segments. */
  total?: number
  usedLabel?: string
  totalLabel?: string
  segments?: StatsSegmentedProgressSegment[]
  className?: string
}

const defaultSegments: StatsSegmentedProgressSegment[] = [
  { label: 'Documents', value: 2.4, color: 'bg-blue-500' },
  { label: 'Photos', value: 1.8, color: 'bg-emerald-500' },
  { label: 'Videos', value: 3.2, color: 'bg-amber-500' },
  { label: 'Music', value: 0.9, color: 'bg-purple-500' },
]

export default function StatsSegmentedProgress({
  title = 'Using Storage',
  used,
  total,
  usedLabel = 'GB',
  totalLabel = 'GB',
  segments = defaultSegments,
  className,
}: StatsSegmentedProgressProps) {
  const segmentSum = segments.reduce((acc, s) => acc + s.value, 0)
  const usedAmount = used ?? segmentSum
  const capacityTotal = total != null && total > 0 ? total : segmentSum > 0 ? segmentSum : 0
  const freeAmount = capacityTotal > 0 ? Math.max(0, capacityTotal - segmentSum) : 0

  return (
    <Card className={cn('w-full max-w-4xl shadow-sm', className)}>
      <CardContent className="py-0">
        <p className="text-muted-foreground mb-4 text-base">
          {title}{' '}
          <span className="text-foreground font-semibold tabular-nums">
            {usedAmount.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{' '}
            {usedLabel}
          </span>{' '}
          {capacityTotal > 0 ? (
            <>
              of{' '}
              {capacityTotal.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}{' '}
              {totalLabel}
            </>
          ) : null}
        </p>

        <div className="bg-muted mb-4 flex h-2.5 w-full overflow-hidden rounded-full">
          {segments.map((segment) => {
            const percentage =
              capacityTotal > 0 ? Math.min(100, (segment.value / capacityTotal) * 100) : 0
            return (
              <div
                key={segment.label}
                className={cn('h-full', segment.color)}
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-label={segment.label}
                aria-valuenow={segment.value}
                aria-valuemin={0}
                aria-valuemax={capacityTotal}
              />
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="flex items-center gap-2"
            >
              <span
                className={cn('size-3 shrink-0 rounded', segment.color)}
                aria-hidden="true"
              />
              <span className="text-muted-foreground text-sm">{segment.label}</span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {segment.value.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
                {usedLabel}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <span
              className="bg-muted size-3 shrink-0 rounded-sm"
              aria-hidden="true"
            />
            <span className="text-muted-foreground text-sm">Free</span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {freeAmount.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
              {usedLabel}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
