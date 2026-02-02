import { ListOrdered, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface GameSummaryCardProps {
  totalQuestions: number
  totalPoints: number
  questionsLabel?: string
  pointsLabel?: string
}

export default function GameSummaryCard({
  totalQuestions,
  totalPoints,
  questionsLabel,
  pointsLabel,
}: GameSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-4">
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
      </CardContent>
    </Card>
  )
}
