'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Heart from '@/components/ui/heart'
import { SlideCounter } from '@/components/ui/SlideCounter'
import { cn } from '@/lib/utils'

interface StatsDisplayProps {
  value: number
  className?: string
}

export function StatsDisplay({ value, className }: StatsDisplayProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full border border-border bg-background px-3 py-2 shadow-sm',
        className,
      )}
    >
      <Avatar className="size-8 border border-border bg-muted/50">
        <AvatarFallback className="bg-transparent">
          <Heart size={14} />
        </AvatarFallback>
      </Avatar>
      <SlideCounter
        value={value}
        className="text-lg font-medium tracking-tight text-foreground"
      />
    </div>
  )
}
