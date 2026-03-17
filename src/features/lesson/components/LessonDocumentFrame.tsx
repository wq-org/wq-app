import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type LessonDocumentFrameProps = {
  children: ReactNode
  className?: string
  documentClassName?: string
}

export function LessonDocumentFrame({
  children,
  className,
  documentClassName,
}: LessonDocumentFrameProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card
        className={cn(
          'overflow-visible rounded-[2.75rem] border-border bg-card/80 py-6 shadow-none md:py-8',
          documentClassName,
        )}
      >
        {children}
      </Card>
    </div>
  )
}
