import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type SkeletonLoaderCardVariant =
  | 'default'
  | 'statusSummary'
  | 'releasePanel'
  | 'historyTimeline'

type SkeletonLoaderCardProps = {
  variant?: SkeletonLoaderCardVariant
  className?: string
}

const STATUS_SUMMARY_ROW_COUNT = 6
const RELEASE_PANEL_SECTION_COUNT = 3
const HISTORY_TIMELINE_ROW_COUNT = 3

function HistoryTimelineSkeletonLoaderCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: HISTORY_TIMELINE_ROW_COUNT }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border bg-card px-4 py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-full max-w-md" />
              <Skeleton className="h-3.5 w-full max-w-sm" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DefaultSkeletonLoaderCard({ className }: { className?: string }) {
  return (
    <Card className={cn('w-full max-w-xs', className)}>
      <CardHeader className="gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

function StatusSummarySkeletonLoaderCard({ className }: { className?: string }) {
  return (
    <Card className={cn('w-full overflow-hidden p-0', className)}>
      <CardContent className="flex flex-col items-center p-0">
        <div className="flex min-h-[200px] w-full flex-col items-center justify-center bg-linear-to-b from-muted/45 via-muted/20 to-transparent py-10 dark:from-muted/20 dark:via-muted/10">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="mt-4 h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-72 max-w-[85%]" />
        </div>

        <div className="w-full space-y-1 px-4 pb-6 pt-2">
          {Array.from({ length: STATUS_SUMMARY_ROW_COUNT }, (_, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5',
                index % 2 === 0 && 'bg-muted/40',
              )}
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ReleasePanelSkeletonLoaderCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-[520px] flex-col gap-4 rounded-3xl border bg-card px-5 py-4',
        className,
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="flex flex-col">
        {Array.from({ length: RELEASE_PANEL_SECTION_COUNT }, (_, index) => (
          <div key={index}>
            {index > 0 ? <Separator className="my-0" /> : null}
            <div className="flex flex-col gap-2 py-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
              {index === 1 ? (
                <div className="flex flex-col gap-1.5 pl-1 pt-1">
                  <Skeleton className="h-3.5 w-full max-w-md" />
                  <Skeleton className="h-3.5 w-full max-w-sm" />
                  <Skeleton className="h-3.5 w-full max-w-lg" />
                  <Skeleton className="h-3.5 w-full max-w-xs" />
                </div>
              ) : index === 2 ? (
                <Skeleton className="h-6 w-32 rounded-full" />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex flex-wrap gap-2 pt-2">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-52 rounded-md" />
      </div>
    </div>
  )
}

export function SkeletonLoaderCard({ variant = 'default', className }: SkeletonLoaderCardProps) {
  if (variant === 'statusSummary') {
    return <StatusSummarySkeletonLoaderCard className={className} />
  }

  if (variant === 'releasePanel') {
    return <ReleasePanelSkeletonLoaderCard className={className} />
  }

  if (variant === 'historyTimeline') {
    return <HistoryTimelineSkeletonLoaderCard className={className} />
  }

  return <DefaultSkeletonLoaderCard className={className} />
}
