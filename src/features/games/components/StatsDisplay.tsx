'use client'

import React from "react"

import * as Tooltip from '@radix-ui/react-tooltip'
import { Check, X, Trophy } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
          <div className="flex items-center gap-2 px-3">
            <div className="text-muted-foreground">{icon}</div>
            <span className="text-2xl font-medium tabular-nums">{value}</span>
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
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-sm',
        className,
      )}
    >
      <StatItem
        icon={<Check className="h-5 w-5" />}
        value={correctAnswers}
        label="Correct Answers"
      />

      <Separator orientation="vertical" className="h-8" />

      <StatItem
        icon={<X className="h-5 w-5" />}
        value={wrongAnswers}
        label="Wrong Answers"
      />

      <Separator orientation="vertical" className="h-8" />

      <StatItem
        icon={<Trophy className="h-5 w-5" />}
        value={score}
        label="Score"
      />
    </div>
  )
}
