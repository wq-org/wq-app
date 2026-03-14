import { FieldCard } from '@/components/ui/field-card'
import { Skeleton } from '@/components/ui/skeleton'

export function SettingsLoadingState() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-4 md:gap-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <FieldCard className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </FieldCard>
      <div className="flex w-full flex-wrap gap-4 md:gap-6">
        <FieldCard className="w-full md:min-w-[280px] md:flex-1 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </FieldCard>
        <FieldCard className="w-full md:min-w-[280px] md:flex-1 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </FieldCard>
      </div>
      <Skeleton className="h-11 w-48 rounded-xl" />
    </div>
  )
}
