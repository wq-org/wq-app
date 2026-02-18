'use client'

import React from 'react'
import { Text } from '@/components/ui/text'

import * as Tooltip from '@radix-ui/react-tooltip'
import { Check, X, Trophy } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface StatsDisplayProps {
  correctAnswers: number
  wrongAnswers: number
  score: number
  className?: string
}

interface StatItemProps {
  icon: React.ReactNode
  value: number
  label: string
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="flex items-center gap-1.5 px-2">
            <div className="text-muted-foreground">{icon}</div>
            <Text
              as="span"
              variant="small"
              className="text-lg font-medium tabular-nums"
            >
              {value}
            </Text>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            sideOffset={5}
          >
            {label}
            <Tooltip.Arrow className="fill-primary" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export function StatsDisplay({
  correctAnswers,
  wrongAnswers,
  score,
  className,
}: StatsDisplayProps) {
  const { t } = useTranslation('features.games')
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 shadow-sm',
        className,
      )}
    >
      <StatItem
        icon={<Check className="h-4 w-4" />}
        value={correctAnswers}
        label={t('stats.correctAnswers')}
      />

      <Separator
        orientation="vertical"
        className="h-6"
      />

      <StatItem
        icon={<X className="h-4 w-4" />}
        value={wrongAnswers}
        label={t('stats.wrongAnswers')}
      />

      <Separator
        orientation="vertical"
        className="h-6"
      />

      <StatItem
        icon={<Trophy className="h-4 w-4" />}
        value={score}
        label={t('stats.score')}
      />
    </div>
  )
}
