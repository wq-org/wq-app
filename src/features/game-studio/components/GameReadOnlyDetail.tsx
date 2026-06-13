import { useMemo } from 'react'
import type { Edge, Node } from '@xyflow/react'
import { Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { useGameReadOnlyPreview } from '../hooks/useGameReadOnlyPreview'
import { computePlayPreviewSessionMaxScore } from '../utils/playPreviewSessionScore'
import { GamePreviewPlayFlow } from './GamePreviewPlayFlow'

type GameReadOnlyDetailProps = {
  gameId: string | undefined
}

export function GameReadOnlyDetail({ gameId }: GameReadOnlyDetailProps) {
  const { t, i18n } = useTranslation('features.gameStudio')
  const { preview, isLoading, error } = useGameReadOnlyPreview(gameId)

  const nodes = useMemo(() => (preview?.content?.nodes ?? []) as Node[], [preview])
  const edges = useMemo(() => (preview?.content?.edges ?? []) as Edge[], [preview])
  const sessionMaxScore = useMemo(() => computePlayPreviewSessionMaxScore(nodes), [nodes])

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner
          variant="gray"
          size="sm"
          speed={1750}
        />
      </div>
    )
  }

  if (error || !preview) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Gamepad2 />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>
            {t('adminPreview.errorTitle', { defaultValue: 'Game unavailable' })}
          </EmptyTitle>
          <EmptyDescription>
            {t('adminPreview.errorDescription', {
              defaultValue: 'The game preview could not be loaded.',
            })}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const publishedAt = preview.publishedAt
    ? new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(preview.publishedAt)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {preview.title}
          </Text>
          {preview.versionNo ? (
            <Badge variant="secondary">
              {t('gameCard.versionValue', { version: preview.versionNo })}
            </Badge>
          ) : null}
          <Badge variant={preview.status === 'published' ? 'default' : 'secondary'}>
            {preview.status === 'published'
              ? t('gameCard.status.published')
              : t('gameCard.status.draft')}
          </Badge>
        </div>

        {preview.description ? (
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {preview.description}
          </Text>
        ) : null}

        {publishedAt ? (
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('adminPreview.publishedAt', {
              defaultValue: 'Published {{date}}',
              date: publishedAt,
            })}
          </Text>
        ) : null}
      </div>

      <div className="flex min-h-[36rem] flex-col rounded-lg border bg-background p-4">
        <GamePreviewPlayFlow
          nodes={nodes}
          edges={edges}
          sessionMaxScore={sessionMaxScore}
        />
      </div>
    </div>
  )
}
