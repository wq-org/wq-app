import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { useGameComponentImageUrl } from '../hooks/useGameComponentImageUrl'
import type { GameComponentScore } from '../types/classroom-game.types'
import { GameNodeRegistryIcon } from './GameNodeRegistryIcon'

type GameRunComponentScoreRowProps = {
  component: GameComponentScore
}

export function GameRunComponentScoreRow({ component }: GameRunComponentScoreRowProps) {
  const { t } = useTranslation('features.teacher')
  const { url: imageUrl } = useGameComponentImageUrl(
    component.imagePreview,
    component.imageFilepath,
  )

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <GameNodeRegistryIcon nodeType={component.nodeType} />
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="size-8 shrink-0 rounded-md border border-blue-500/20 object-cover"
          />
        ) : null}
        <Text
          as="span"
          variant="small"
          className="truncate"
        >
          {component.label}
        </Text>
      </div>
      <Text
        as="span"
        variant="small"
        muted
        className={cn('shrink-0 tabular-nums')}
      >
        {t('pages.gameRunAnalytics.detail.componentScore', {
          score: component.score,
          maxScore: component.maxScore,
        })}
      </Text>
    </div>
  )
}
