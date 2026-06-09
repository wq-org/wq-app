import { useTranslation } from 'react-i18next'

import { SkeletonLoaderCard } from '@/components/shared/skeletons/SkeletonLoaderCard'
import { FieldCard } from '@/components/ui/field-card'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import type { GameDraftDiff, PublishedGameVersion } from '../types/game-version.types'

type GameReleasePanelProps = {
  live: PublishedGameVersion | null
  diff: GameDraftDiff | null
  loading?: boolean
}

export function GameReleasePanel({ live, diff, loading = false }: GameReleasePanelProps) {
  const { t } = useTranslation('features.gameStudio')

  const hasLiveVersion = Boolean(live)
  const hasChanges = (diff?.summary.totalChanges ?? 0) > 0
  const statusLines = diff?.statusLineKeys ?? [{ key: 'releasePanel.noChanges' }]

  if (loading) {
    return (
      <SkeletonLoaderCard
        variant="releasePanel"
        className="w-full"
      />
    )
  }

  if (!hasLiveVersion) {
    return (
      <FieldCard>
        <div className="flex flex-col gap-3">
          <Text
            as="h3"
            variant="body"
            className="font-semibold"
          >
            {t('releasePanel.firstPublishTitle')}
          </Text>
          <Text
            as="p"
            variant="small"
            muted
          >
            {t('releasePanel.firstPublishDescription')}
          </Text>
        </div>
      </FieldCard>
    )
  }

  return (
    <FieldCard>
      <div className="flex flex-col gap-4">
        <div>
          <Text
            as="h3"
            variant="body"
            className="font-semibold"
          >
            {t('releasePanel.title')}
          </Text>
          <Text
            as="p"
            variant="small"
            muted
            className="mt-1"
          >
            {t('releasePanel.description')}
          </Text>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col gap-1 py-3">
            <Text
              as="p"
              variant="small"
              muted
            >
              {t('releasePanel.currentLive')}
            </Text>
            <Text
              as="p"
              variant="small"
              className="font-medium"
            >
              {t('releasePanel.currentLiveValue', { version: live!.versionNo })}
            </Text>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 py-3">
            <Text
              as="p"
              variant="small"
              muted
            >
              {t('releasePanel.draftStatus')}
            </Text>
            {hasChanges ? (
              <>
                <Text
                  as="p"
                  variant="small"
                  className="font-medium"
                >
                  {t('releasePanel.draftStatusChanged', { count: diff!.summary.totalChanges })}
                </Text>
                <ul className="flex flex-col gap-1.5 pl-1">
                  {statusLines.map((line, idx) => (
                    <li key={`${line.key}-${idx}`}>
                      <Text
                        as="span"
                        variant="small"
                        muted
                      >
                        {line.count != null ? t(line.key, { count: line.count }) : t(line.key)}
                      </Text>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {t('releasePanel.draftStatusUpToDate')}
              </Text>
            )}
          </div>
        </div>
      </div>
    </FieldCard>
  )
}
