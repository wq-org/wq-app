import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { UploadSummaryItem } from '../types/upload-summary.types'
import { UploadSummaryList } from './UploadSummaryList'

export type UploadSummaryProps = {
  items: readonly UploadSummaryItem[]
  onDone?: () => void
  doneLabel?: string
  className?: string
}

export function UploadSummary({ items, onDone, doneLabel, className }: UploadSummaryProps) {
  return (
    <div
      className={cn(
        'flex w-full max-w-full min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-card/60',
        className,
      )}
    >
      <UploadSummaryList items={items} />
      {onDone ? (
        <div className="flex justify-end border-t border-border/60 pt-3">
          <Button
            type="button"
            variant="darkblue"
            size="sm"
            onClick={onDone}
          >
            {doneLabel ?? 'Done'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
