import type React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatsDashboardProgressBarsDetailItem = {
  label: string
  value: string
  color: string
}

export type StatsDashboardProgressBarsMetric = {
  id?: string
  title: string
  value: string
  limit: string
  percentage: number
  progressColor: string
  /** `split` uses the first two `details` entries to render a two-segment bar (numeric values). */
  progressVariant?: 'simple' | 'split'
  status?: string
  statusColor?: string
  details?: StatsDashboardProgressBarsDetailItem[]
  warningMessage?: string
  actionLabel: string
  actionIcon?: React.ReactNode
  onActionClick?: () => void
}

export type StatsDashboardProgressBarsMetricCardProps = StatsDashboardProgressBarsMetric

function parseDetailNumber(raw: string): number {
  const n = Number.parseInt(raw.replace(/,/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

export function StatsDashboardProgressBarsMetricCard({
  title,
  value,
  limit,
  percentage,
  status,
  statusColor = 'text-emerald-600 dark:text-emerald-400',
  progressColor,
  progressVariant = 'simple',
  details,
  actionLabel,
  actionIcon,
  warningMessage,
  onActionClick,
  className,
}: StatsDashboardProgressBarsMetricCardProps & { className?: string }) {
  const renderProgressBar = () => {
    if (progressVariant === 'split' && details && details.length >= 2) {
      const first = parseDetailNumber(details[0].value)
      const second = parseDetailNumber(details[1].value)
      const total = first + second
      if (total <= 0) {
        return (
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full w-full origin-left transition-transform duration-200 ease-out ${progressColor}`}
              style={{ transform: `scaleX(${Math.min(percentage, 100) / 100})` }}
            />
          </div>
        )
      }
      const firstPct = (first / total) * 100
      const secondPct = (second / total) * 100

      return (
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'absolute left-0 h-full w-full origin-left transition-transform duration-200 ease-out',
              details[0].color,
            )}
            style={{ transform: `scaleX(${firstPct / 100})` }}
          />
          <div
            className={cn(
              'absolute left-0 h-full w-full origin-left transition-transform duration-200 ease-out',
              details[1].color,
            )}
            style={{
              transform: `translateX(${firstPct}%) scaleX(${secondPct / 100})`,
            }}
          />
        </div>
      )
    }

    return (
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full w-full origin-left transition-transform duration-200 ease-out ${progressColor}`}
          style={{ transform: `scaleX(${Math.min(percentage, 100) / 100})` }}
        />
      </div>
    )
  }

  return (
    <Card className={cn('relative max-w-[280px] overflow-hidden shadow-2xs', className)}>
      <CardContent className="p-4 py-0">
        <h5 className="text-xs font-normal leading-none tracking-wide text-muted-foreground uppercase dark:text-foreground/80">
          {title}
        </h5>

        <div className="mt-2 flex items-baseline gap-1">
          <div className="text-[1.2rem] font-medium leading-none text-foreground tabular-nums">
            {value}
          </div>
          <div className="text-xs leading-none text-muted-foreground">/ {limit}</div>
        </div>

        <div className="mt-3">
          {renderProgressBar()}

          {details && details.length > 0 ? (
            <div className="my-6 mb-8">
              <div className="flex flex-col gap-3">
                {details.map((detail, index) => (
                  <div
                    key={`${detail.label}-${index}`}
                    className="flex w-full items-center text-xs leading-none text-muted-foreground dark:text-foreground/70"
                  >
                    <div className={`mr-1.5 h-2 w-2 rounded-full ${detail.color}`} />
                    <div className="mr-1">{detail.label}</div>
                    <div className="h-[9px] flex-1 border-b-2 border-dotted border-border" />
                    <div className="ml-1 tabular-nums">{detail.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {status ? (
            <div className="pt-2">
              <div className={statusColor}>{status}</div>
            </div>
          ) : null}

          {warningMessage ? (
            <div className="pt-2">
              <div className="text-sm text-amber-700 dark:text-amber-400">{warningMessage}</div>
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-full justify-start gap-0 rounded-none bg-muted/50 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={onActionClick}
          >
            {actionIcon}
            <span className="ml-1 text-xs">{actionLabel}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export type StatsDashboardProgressBarsProps = {
  metrics: readonly StatsDashboardProgressBarsMetric[]
  className?: string
  /** Applied to each metric card (e.g. max-w-none for full-width grid cells). */
  cardClassName?: string
}

export function StatsDashboardProgressBars({
  metrics,
  className,
  cardClassName,
}: StatsDashboardProgressBarsProps) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4', className)}
      role="list"
    >
      {metrics.map((metric, index) => (
        <StatsDashboardProgressBarsMetricCard
          key={metric.id ?? `${metric.title}-${index}`}
          {...metric}
          className={cardClassName}
        />
      ))}
    </div>
  )
}
