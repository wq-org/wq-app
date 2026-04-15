import { Rating } from '@/components/ui/rating'

import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

type RatingDistributionItem = {
  stars: number
  count: number
  percentage: number
}

type RatingWithReviewSummaryProps = {
  rating?: number
  reviewCount?: number
  maxRating?: number
  distribution?: RatingDistributionItem[]
}

const DEFAULT_DISTRIBUTION: RatingDistributionItem[] = [
  { stars: 5, count: 124, percentage: 62 },
  { stars: 4, count: 45, percentage: 22 },
  { stars: 3, count: 18, percentage: 9 },
  { stars: 2, count: 8, percentage: 4 },
  { stars: 1, count: 5, percentage: 3 },
]

export function RatingWithReviewSummary({
  rating = 4.6,
  reviewCount = 200,
  maxRating = 5,
  distribution = DEFAULT_DISTRIBUTION,
}: RatingWithReviewSummaryProps) {
  return (
    <div className="mx-auto w-full max-w-xs space-y-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl font-semibold">{rating.toFixed(1)}</span>
        <Rating
          rating={rating}
          maxRating={maxRating}
          size="sm"
        />
        <span className="text-muted-foreground text-xs">Based on {reviewCount} reviews</span>
      </div>
      <Separator />
      <div className="space-y-2">
        {distribution.map((row) => (
          <div
            key={row.stars}
            className="flex items-center gap-3 text-sm"
          >
            <span className="text-muted-foreground w-3 text-right text-xs">{row.stars}</span>
            <Progress
              value={row.percentage}
              className="flex-1 **:data-[slot=progress-indicator]:bg-yellow-400 **:data-[slot=progress-track]:h-1.5"
            />
            <span className="text-muted-foreground w-7 text-right text-xs">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
