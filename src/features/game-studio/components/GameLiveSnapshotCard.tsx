import { useTranslation } from 'react-i18next'
import { RadioOff, RadioTowerIcon } from 'lucide-react'

import { StatusSummaryCard } from '@/components/shared'
import { SkeletonLoaderCard } from '@/components/shared/skeletons/SkeletonLoaderCard'
import { Text } from '@/components/ui/text'
import { COLORS } from '@/lib/themes'

import type { PublishedGameVersion } from '../types/game-version.types'
import { formatGamePublishedAt } from '../utils/gameLifecycle.utils'

type GameLiveSnapshotCardProps = {
  live: PublishedGameVersion | null
  deliveryCount: number
  offlineDeliveryCount?: number
  loading?: boolean
}

export function GameLiveSnapshotCard({
  live,
  deliveryCount,
  offlineDeliveryCount = 0,
  loading = false,
}: GameLiveSnapshotCardProps) {
  const { t, i18n } = useTranslation('features.gameStudio')

  if (loading) {
    return (
      <SkeletonLoaderCard
        variant="statusSummary"
        className="w-full"
      />
    )
  }

  if (!live) {
    return (
      <div className="rounded-3xl border bg-card px-5 py-8">
        <Text
          as="p"
          variant="body"
          className="font-medium"
        >
          {t('liveGame.emptyTitle')}
        </Text>
        <Text
          as="p"
          variant="small"
          muted
          className="mt-2"
        >
          {t('liveGame.emptyDescription')}
        </Text>
      </div>
    )
  }

  const publishedAtLabel = formatGamePublishedAt(live.publishedAt, i18n.language)
  const themeLabel = COLORS[live.themeId]?.label ?? live.themeId
  const isOffline = deliveryCount === 0 && offlineDeliveryCount > 0
  const cardTitle = isOffline ? t('liveGame.offlineTitle') : t('liveGame.title')
  const cardDescription = isOffline ? t('liveGame.offlineDescription') : t('liveGame.description')
  const deliveryLabel = isOffline ? t('liveGame.offlineDeliveries') : t('liveGame.deliveries')
  const deliveryValue = t('liveGame.deliveriesValue', {
    count: isOffline ? offlineDeliveryCount : deliveryCount,
  })

  return (
    <StatusSummaryCard
      title={cardTitle}
      description={cardDescription}
      icon={isOffline ? RadioOff : RadioTowerIcon}
      variant={isOffline ? 'default' : live.themeId}
      rows={[
        {
          label: t('liveGame.version'),
          value: t('liveGame.versionValue', { version: live.versionNo }),
        },
        { label: t('liveGame.publishedAt'), value: publishedAtLabel },
        { label: deliveryLabel, value: deliveryValue },
        { label: t('liveGame.titleLabel'), value: live.gameTitle },
        {
          label: t('liveGame.descriptionLabel'),
          value: live.gameDescription || t('liveGame.noDescription'),
        },
        { label: t('liveGame.themeLabel'), value: themeLabel },
      ]}
    />
  )
}
