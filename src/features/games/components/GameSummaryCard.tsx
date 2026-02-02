import { ListOrdered, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface GameSummaryCardProps {
  totalQuestions: number
  totalPoints: number
  questionsLabel?: string
  pointsLabel?: string
  /** Optional subtitle when penalties exist, e.g. "Points range: 0–X. Score never below 0." */
  pointsSubtitle?: string
}

export default function GameSummaryCard({
  totalQuestions,
  totalPoints,
  questionsLabel,
  pointsLabel,
  pointsSubtitle,
}: GameSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2">
              <ListOrdered
                className="size-4"
                aria-hidden
              />
              Total {questionsLabel || 'questions'}: {totalQuestions}
            </span>
            <span className="flex items-center gap-2">
              <Award
                className="size-4"
                aria-hidden
              />
              Total {pointsLabel || 'points'}: {totalPoints}
            </span>
          </div>
          {pointsSubtitle && (
            <p className="text-xs text-muted-foreground">{pointsSubtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
