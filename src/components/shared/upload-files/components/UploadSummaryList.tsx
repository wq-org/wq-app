import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { UploadSummaryItem } from '../types/upload-summary.types'
import { UploadSummaryListItem } from './UploadSummaryListItem'

export type UploadSummaryListProps = {
  items: readonly UploadSummaryItem[]
  className?: string
}

export function UploadSummaryList({ items, className }: UploadSummaryListProps) {
  const { t } = useTranslation('features.commandPalette')

  const succeeded = useMemo(() => items.filter((item) => item.status === 'success'), [items])
  const failed = useMemo(() => items.filter((item) => item.status === 'failed'), [items])

  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div className="space-y-1 px-1">
        <Text
          as="p"
          variant="body"
          className="text-sm font-semibold text-foreground"
        >
          {t('upload.summary.title')}
        </Text>
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('upload.summary.stats', {
            successCount: succeeded.length,
            failedCount: failed.length,
          })}
        </Text>
      </div>

      <Separator />

      <ScrollArea className="h-[min(36vh,220px)] w-full min-w-0 rounded-xl border border-border/60 bg-background/40 backdrop-blur-md">
        <div className="min-w-0 px-3 py-1">
          {succeeded.length > 0 ? (
            <section
              className="min-w-0"
              aria-label={t('upload.summary.succeededSection')}
            >
              <Text
                as="p"
                variant="small"
                muted
                className="py-2 text-xs font-medium uppercase tracking-wide"
              >
                {t('upload.summary.succeededHeading')}
              </Text>
              <ul className="min-w-0 list-none">
                {succeeded.map((item) => (
                  <UploadSummaryListItem
                    key={item.id}
                    item={item}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {succeeded.length > 0 && failed.length > 0 ? <Separator className="my-2" /> : null}

          {failed.length > 0 ? (
            <section
              className="min-w-0"
              aria-label={t('upload.summary.failedSection')}
            >
              <Text
                as="p"
                variant="small"
                muted
                className="py-2 text-xs font-medium uppercase tracking-wide"
              >
                {t('upload.summary.failedHeading')}
              </Text>
              <ul className="min-w-0 list-none">
                {failed.map((item) => (
                  <UploadSummaryListItem
                    key={item.id}
                    item={item}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}
