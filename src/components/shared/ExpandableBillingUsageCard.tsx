'use client'

import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export type UsageRow = { label: string; value: string }

export type ExpandableBillingUsageCardProps = {
  title: string
  primary: { label: string; value: string; max?: string; percentage?: number }
  secondary?: { label: string; value: string }
  rows: UsageRow[]
  actionLabel?: string
  onAction?: () => void
  defaultOpen?: boolean
  className?: string
}

export function ExpandableBillingUsageCard({
  title,
  primary,
  secondary,
  rows,
  actionLabel,
  onAction,
  defaultOpen = false,
  className,
}: ExpandableBillingUsageCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const primaryValueLabel = primary.max ? `${primary.value} / ${primary.max}` : primary.value

  return (
    <Card className={cn('relative w-full max-w-md gap-6 overflow-visible pb-1', className)}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {actionLabel ? (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={onAction}
              type="button"
            >
              {actionLabel}
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn(
          'relative space-y-5 overflow-hidden transition-all duration-500 ease-in-out',
          isOpen ? 'max-h-[600px]' : 'max-h-48',
        )}
      >
        <div className="bg-muted/60 rounded-lg space-y-3 p-4">
          <div className="text-muted-foreground flex justify-between text-xs font-medium">
            <span>{primary.label}</span>
            {secondary ? <span>{secondary.label}</span> : null}
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>{primaryValueLabel}</span>
            {secondary ? <span>{secondary.value}</span> : null}
          </div>
          {primary.percentage !== undefined ? (
            <Progress
              value={Math.min(100, Math.max(0, primary.percentage))}
              className="h-2"
            />
          ) : null}
        </div>

        {rows.length > 0 ? (
          <div className="flex flex-col gap-4">
            {rows.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className="flex justify-between text-sm"
              >
                <span className="text-foreground font-medium">{row.label}</span>
                <span className="text-muted-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            'from-background pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-lg bg-linear-to-t to-transparent transition-opacity duration-300',
            isOpen ? 'opacity-0' : 'opacity-100',
          )}
        />
      </CardContent>

      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
        <Button
          variant="outline"
          size="icon-sm"
          className="bg-background hover:bg-background rounded-full shadow-sm"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
          aria-expanded={isOpen}
        >
          <ChevronDownIcon
            aria-hidden="true"
            className={cn('transition-transform duration-300', isOpen && 'rotate-180')}
          />
          <span className="sr-only">Toggle card</span>
        </Button>
      </div>
    </Card>
  )
}
