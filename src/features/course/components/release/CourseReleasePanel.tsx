'use client'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { SkeletonLoaderCard } from '@/components/shared/skeletons/SkeletonLoaderCard'
import { FieldCard } from '@/components/ui/field-card'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import type { CourseDraftDiff } from '../../types/course-release.types'
import type { PublishedCourseVersion } from '../../types/course-version.types'
import { releaseBadgeLabel, releaseBadgeVariant } from './courseReleaseBadge.utils'

type CourseReleasePanelProps = {
  live: PublishedCourseVersion | null
  diff: CourseDraftDiff | null
  loading?: boolean
}

export function CourseReleasePanel({ live, diff, loading = false }: CourseReleasePanelProps) {
  const { t } = useTranslation('features.course')

  const hasLiveVersion = Boolean(live)
  const hasChanges = (diff?.summary.totalChanges ?? 0) > 0
  const releaseType = diff?.recommendedReleaseType ?? 'none'
  const statusLines = diff?.statusLineKeys ?? [{ key: 'settings.draftChanges.status.noChanges' }]
  const detailStatusLines = statusLines.filter(
    (line) => line.key !== 'settings.draftChanges.status.totalChanges',
  )

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
            {t('settings.releasePanel.firstPublishTitle')}
          </Text>
          <Text
            as="p"
            variant="small"
            muted
          >
            {t('settings.releasePanel.firstPublishDescription')}
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
            {t('settings.releasePanel.title')}
          </Text>
          <Text
            as="p"
            variant="small"
            muted
            className="mt-1"
          >
            {t('settings.releasePanel.description')}
          </Text>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col gap-1 py-3">
            <Text
              as="p"
              variant="small"
              muted
            >
              {t('settings.releasePanel.currentLive')}
            </Text>
            <Text
              as="p"
              variant="small"
              className="font-medium"
            >
              {t('settings.releasePanel.currentLiveValue', { version: live!.versionNo })}
            </Text>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 py-3">
            <Text
              as="p"
              variant="small"
              muted
            >
              {t('settings.releasePanel.draftStatus')}
            </Text>
            {hasChanges ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Text
                    as="p"
                    variant="small"
                    className="font-medium"
                  >
                    {t('settings.releasePanel.draftStatusChanged', {
                      count: diff!.summary.totalChanges,
                    })}
                  </Text>
                  {releaseType !== 'none' ? (
                    <Badge
                      variant={releaseBadgeVariant(releaseType)}
                      className="w-fit"
                    >
                      {releaseBadgeLabel(releaseType, t)}
                    </Badge>
                  ) : null}
                </div>
                <ul className="flex flex-col gap-1.5 pl-1">
                  {detailStatusLines.map((line, index) => (
                    <li key={`${line.key}-${index}`}>
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
                {t('settings.releasePanel.draftStatusUpToDate')}
              </Text>
            )}
          </div>
          {hasChanges ? (
            <>
              <Separator />
              <div className="flex flex-col gap-2 py-3">
                <Text
                  as="p"
                  variant="small"
                  muted
                >
                  {t('settings.releasePanel.classroomImpactTitle')}
                </Text>
                <ul className="flex flex-col gap-1.5 pl-1">
                  {(
                    t('settings.releasePanel.classroomImpactPoints', {
                      returnObjects: true,
                    }) as string[]
                  ).map((point) => (
                    <li key={point}>
                      <Text
                        as="span"
                        variant="small"
                        muted
                      >
                        {point}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </FieldCard>
  )
}
