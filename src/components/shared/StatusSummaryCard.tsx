import type React from 'react'
import { SquareTerminalIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  statusSummaryCardVariants,
  type StatusSummaryCardVariant,
} from './status-summary-card-variants'

export type { StatusSummaryCardVariant } from './status-summary-card-variants'

export type StatusSummaryRow = {
  label: string
  value: string | React.ReactNode
}

export type StatusSummaryIconAccent = StatusSummaryCardVariant | 'fuchsia' | 'emerald' | 'amber'

export type StatusSummaryCardProps = {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: string | number }>
  variant?: StatusSummaryCardVariant
  iconAccent?: StatusSummaryIconAccent
  headerClassName?: string
  rows: StatusSummaryRow[]
  className?: string
}

const LEGACY_ICON_ACCENT_VARIANTS: Record<
  Exclude<StatusSummaryIconAccent, StatusSummaryCardVariant>,
  StatusSummaryCardVariant
> = {
  fuchsia: 'pink',
  emerald: 'green',
  amber: 'orange',
}

function resolveStatusSummaryVariant(
  variant: StatusSummaryCardVariant | undefined,
  iconAccent: StatusSummaryIconAccent,
): StatusSummaryCardVariant {
  if (variant) return variant

  if (iconAccent in LEGACY_ICON_ACCENT_VARIANTS) {
    return LEGACY_ICON_ACCENT_VARIANTS[iconAccent as keyof typeof LEGACY_ICON_ACCENT_VARIANTS]
  }

  return iconAccent
}

export function StatusSummaryCard({
  title,
  description,
  icon: Icon = SquareTerminalIcon,
  variant,
  iconAccent = 'violet',
  headerClassName,
  rows,
  className,
}: StatusSummaryCardProps) {
  const resolvedVariant = resolveStatusSummaryVariant(variant, iconAccent)

  return (
    <Card
      className={cn(
        statusSummaryCardVariants({ variant: resolvedVariant }),
        'w-full overflow-hidden p-0',
        className,
      )}
    >
      <CardContent className="flex flex-col items-center p-0">
        <div
          className={cn(
            'flex w-full flex-col items-center justify-center bg-linear-to-b from-[var(--status-summary-header)] to-transparent py-10',
            headerClassName,
          )}
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 scale-150 rounded-full bg-[var(--status-summary-glow)] blur-2xl" />
            <Icon
              aria-hidden="true"
              className="relative size-14 text-[var(--status-summary-accent)]"
              strokeWidth="1.5"
            />
          </div>
          <h3 className="text-foreground text-lg font-semibold">{title}</h3>
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>

        <div className="w-full space-y-1 px-4 pb-6 pt-2">
          {rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className={cn(
                'rounded-lg flex items-center justify-between px-3 py-2.5',
                index % 2 === 0 && 'bg-muted/40',
              )}
            >
              <span className="text-foreground text-sm font-medium">{row.label}</span>
              <span className="text-muted-foreground text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
