import { ListOrdered, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export interface GameSummaryCardProps {
  totalQuestions: number
  totalPoints: number
  questionsLabel?: string
  pointsLabel?: string
  /** Optional subtitle when penalties exist, e.g. "Points range: 0–X. Score never below 0." */
  pointsSubtitle?: string
}

export function GameSummaryCard({
  totalQuestions,
  totalPoints,
  questionsLabel,
  pointsLabel,
  pointsSubtitle,
}: GameSummaryCardProps) {
  const { t } = useTranslation('features.games')
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <Text
              as="span"
              variant="small"
              className="flex items-center gap-2"
            >
              <ListOrdered
                className="size-4"
                aria-hidden
              />
              {t('gameSummary.totalLabel', {
                label: questionsLabel || t('gameSummary.questions'),
                value: totalQuestions,
              })}
            </Text>
            <Text
              as="span"
              variant="small"
              className="flex items-center gap-2"
            >
              <Award
                className="size-4"
                aria-hidden
              />
              {t('gameSummary.totalLabel', {
                label: pointsLabel || t('gameSummary.points'),
                value: totalPoints,
              })}
            </Text>
          </div>
          {pointsSubtitle && (
            <Text
              as="p"
              variant="body"
              className="text-xs text-muted-foreground"
            >
              {pointsSubtitle}
            </Text>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
