import { Skeleton } from '@/components/ui/skeleton'

export function LessonTextSkeleton() {
  return (
    <div className="w-full pb-24">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 max-w-2xl" />
        <div className="flex items-start gap-2">
          <Skeleton className="mt-1 h-5 w-5 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-9/12" />
      </div>

      <div className="mt-10 space-y-4">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[97%]" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[82%]" />
      </div>

      <div className="mt-10 space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[88%]" />
      </div>

      <div className="mt-10 space-y-4">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[93%]" />
        <Skeleton className="h-4 w-[86%]" />
        <Skeleton className="h-4 w-[78%]" />
      </div>
    </div>
  )
}
