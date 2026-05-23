import { Check, StickyNote, X } from 'lucide-react'

import { cn } from '@/lib/utils'

type UploadSummaryIconProps = {
  className?: string
}

/** Sticky-note with check — success row icon (blue-500). */
export function StickyNoteCheck({ className }: UploadSummaryIconProps) {
  return (
    <span
      className={cn('relative inline-flex size-5 shrink-0', className)}
      aria-hidden
    >
      <StickyNote className="size-5 text-blue-500" />
      <Check
        className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-background text-blue-500"
        strokeWidth={3}
      />
    </span>
  )
}

/** Sticky-note with X — failed row icon (red-500). */
export function StickyNoteX({ className }: UploadSummaryIconProps) {
  return (
    <span
      className={cn('relative inline-flex size-5 shrink-0', className)}
      aria-hidden
    >
      <StickyNote className="size-5 text-red-500" />
      <X
        className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-background text-red-500"
        strokeWidth={3}
      />
    </span>
  )
}
