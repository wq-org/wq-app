import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type CardInstantPreviewExpandedMediaFrameProps = {
  children: ReactNode
  className?: string
}

/** Fills space above the expanded footer; media scales inside via object-contain. */
export function CardInstantPreviewExpandedMediaFrame({
  children,
  className,
}: CardInstantPreviewExpandedMediaFrameProps) {
  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col overflow-hidden bg-muted px-4 py-4', className)}
    >
      <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden">
        {children}
      </div>
    </div>
  )
}
