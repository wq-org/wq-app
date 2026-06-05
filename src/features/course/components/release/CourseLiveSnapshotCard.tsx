import { useTranslation } from 'react-i18next'
import { RadioTowerIcon } from 'lucide-react'

import { StatusSummaryCard } from '@/components/shared'
import { SkeletonLoaderCard } from '@/components/shared/skeletons/SkeletonLoaderCard'
import { Text } from '@/components/ui/text'
import { COLORS } from '@/lib/themes'

import type { PublishedCourseVersion } from '../../types/course-version.types'
import { formatPublishedAt } from '../../utils/courseVersion.utils'

type CourseLiveSnapshotCardProps = {
  live: PublishedCourseVersion | null
  deliveryCount: number
  loading?: boolean
}

export function CourseLiveSnapshotCard({
  live,
  deliveryCount,
  loading = false,
}: CourseLiveSnapshotCardProps) {
  const { t, i18n } = useTranslation('features.course')

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
          {t('settings.liveCourse.emptyTitle')}
        </Text>
        <Text
          as="p"
          variant="small"
          muted
          className="mt-2"
        >
          {t('settings.liveCourse.emptyDescription')}
        </Text>
      </div>
    )
  }

  const publishedAtLabel = formatPublishedAt(live.publishedAt, i18n.language)
  const themeLabel = COLORS[live.themeId].label

  return (
    <StatusSummaryCard
      title={t('settings.liveCourse.title')}
      description={t('settings.liveCourse.description')}
      icon={RadioTowerIcon}
      variant={live.themeId}
      rows={[
        {
          label: t('settings.liveCourse.version'),
          value: t('settings.liveCourse.versionValue', { version: live.versionNo }),
        },
        {
          label: t('settings.liveCourse.publishedAt'),
          value: publishedAtLabel,
        },
        {
          label: t('settings.liveCourse.deliveries'),
          value: t('settings.liveCourse.deliveriesValue', { count: deliveryCount }),
        },
        {
          label: t('settings.liveCourse.titleLabel'),
          value: live.courseTitle,
        },
        {
          label: t('settings.liveCourse.descriptionLabel'),
          value: live.courseDescription || t('settings.liveCourse.noDescription'),
        },
        {
          label: t('settings.liveCourse.themeLabel'),
          value: themeLabel,
        },
      ]}
    />
  )
}
