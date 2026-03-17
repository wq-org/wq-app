import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type LessonActionRailProps = {
  children: ReactNode
  className?: string
}

export function LessonActionRail({ children, className }: LessonActionRailProps) {
  return (
    <div
      className={cn(
        'fixed right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col items-stretch gap-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
