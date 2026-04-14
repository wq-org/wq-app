import type React from 'react'
import { SquareTerminalIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export type StatusSummaryRow = {
  label: string
  value: string | React.ReactNode
}

export type StatusSummaryIconAccent = 'fuchsia' | 'emerald' | 'blue' | 'amber'

export type StatusSummaryCardProps = {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: string | number }>
  iconAccent?: StatusSummaryIconAccent
  rows: StatusSummaryRow[]
  className?: string
}

const ACCENT_STYLES: Record<StatusSummaryIconAccent, { from: string; blur: string; text: string }> =
  {
    fuchsia: {
      from: 'from-fuchsia-50/80',
      blur: 'bg-fuchsia-400/10',
      text: 'text-fuchsia-600',
    },
    emerald: {
      from: 'from-emerald-50/80',
      blur: 'bg-emerald-400/10',
      text: 'text-emerald-600',
    },
    blue: {
      from: 'from-blue-50/80',
      blur: 'bg-blue-400/10',
      text: 'text-blue-600',
    },
    amber: {
      from: 'from-amber-50/80',
      blur: 'bg-amber-400/10',
      text: 'text-amber-600',
    },
  }

export function StatusSummaryCard({
  title,
  description,
  icon: Icon = SquareTerminalIcon,
  iconAccent = 'fuchsia',
  rows,
  className,
}: StatusSummaryCardProps) {
  const accent = ACCENT_STYLES[iconAccent]

  return (
    <Card className={cn('w-full overflow-hidden p-0', className)}>
      <CardContent className="flex flex-col items-center p-0">
        <div
          className={cn(
            'flex w-full flex-col items-center justify-center bg-linear-to-b to-transparent py-10',
            accent.from,
          )}
        >
          <div className="relative mb-4">
            <div className={cn('absolute inset-0 scale-150 rounded-full blur-2xl', accent.blur)} />
            <Icon
              aria-hidden="true"
              className={cn('relative size-14', accent.text)}
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
