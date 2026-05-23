import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { UploadSummaryItem } from '../types/upload-summary.types'
import { StickyNoteCheck, StickyNoteX } from './UploadSummaryIcons'

export type UploadSummaryListItemProps = {
  item: UploadSummaryItem
  className?: string
}

export function UploadSummaryListItem({ item, className }: UploadSummaryListItemProps) {
  const isSuccess = item.status === 'success'

  return (
    <li
      className={cn('flex min-w-0 max-w-full items-start gap-3 overflow-hidden py-2.5', className)}
      data-upload-summary-status={item.status}
    >
      {isSuccess ? <StickyNoteCheck /> : <StickyNoteX />}
      <div className="min-w-0 flex-1 basis-0 space-y-0.5 overflow-hidden">
        <Text
          as="p"
          variant="body"
          className="truncate text-sm font-medium leading-snug text-foreground"
          title={item.fileName}
        >
          {item.fileName}
        </Text>
        {item.subtitle ? (
          <Text
            as="p"
            variant="small"
            muted
            className="truncate text-xs leading-snug"
            title={item.subtitle}
          >
            {item.subtitle}
          </Text>
        ) : null}
      </div>
    </li>
  )
}
