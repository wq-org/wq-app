import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpCircle, GitCompareArrows, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkeletonLoaderCard } from '@/components/shared/skeletons/SkeletonLoaderCard'
import { FieldCard } from '@/components/ui/field-card'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useDisclosure } from '@/hooks/use-disclosure'

import type { CourseDraftDiff } from '../../types/course-release.types'
import type { PublishedCourseVersion } from '../../types/course-version.types'
import { buildCourseReleaseReviewRoute } from '../../utils/courseRelease.utils'
import { releaseBadgeLabel, releaseBadgeVariant } from './courseReleaseBadge.utils'
import { CourseReleaseConfirmationDialog } from './CourseReleaseConfirmationDialog'
import {
  CoursePublishMajorDialog,
  CoursePublishPatchDialog,
  CoursePublishReleaseDialog,
} from './CoursePublishReleaseDialog'

type CourseReleasePanelProps = {
  courseId: string
  live: PublishedCourseVersion | null
  diff: CourseDraftDiff | null
  loading?: boolean
  onPublished?: () => void
}

export function CourseReleasePanel({
  courseId,
  live,
  diff,
  loading = false,
  onPublished,
}: CourseReleasePanelProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const firstPublishDialog = useDisclosure()
  const patchDialog = useDisclosure()
  const majorConfirmDialog = useDisclosure()
  const majorDialog = useDisclosure()

  const hasLiveVersion = Boolean(live)
  const hasChanges = (diff?.summary.totalChanges ?? 0) > 0
  const releaseType = diff?.recommendedReleaseType ?? 'none'
  const statusLines = diff?.statusLineKeys ?? [{ key: 'settings.draftChanges.status.noChanges' }]
  const detailStatusLines = statusLines.filter(
    (line) => line.key !== 'settings.draftChanges.status.totalChanges',
  )
  const canPublishPatch = hasLiveVersion && hasChanges && releaseType === 'patch'
  const canPublishMajor = hasLiveVersion && hasChanges
  const nextVersionNo = live ? live.versionNo + 1 : null

  const handleReviewChanges = () => {
    navigate(buildCourseReleaseReviewRoute(courseId))
  }

  const handlePatchClick = () => {
    if (releaseType === 'major') {
      toast.message(t('settings.releasePanel.patchBlockedTitle'), {
        description: t('settings.releasePanel.patchBlockedDescription'),
      })
      return
    }
    patchDialog.onOpen()
  }

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
          <Button
            type="button"
            variant="darkblue"
            className="w-fit gap-2"
            onClick={firstPublishDialog.onOpen}
          >
            <Upload
              className="size-4"
              aria-hidden
            />
            {t('settings.publishAction')}
          </Button>
        </div>

        <CoursePublishReleaseDialog
          courseId={courseId}
          variant="first"
          open={firstPublishDialog.isOpen}
          onOpenChange={firstPublishDialog.onToggle}
          onPublished={onPublished}
        />
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
                <Text
                  as="p"
                  variant="small"
                  className="font-medium"
                >
                  {t('settings.releasePanel.draftStatusChanged', {
                    count: diff!.summary.totalChanges,
                  })}
                </Text>
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
          <Separator />
          <div className="flex flex-col gap-2 py-3">
            <Text
              as="p"
              variant="small"
              muted
            >
              {t('settings.releasePanel.recommendedType')}
            </Text>
            <Badge
              variant={releaseBadgeVariant(releaseType)}
              className="w-fit"
            >
              {releaseBadgeLabel(releaseType, t)}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleReviewChanges}
            disabled={!hasChanges}
          >
            <GitCompareArrows
              className="size-4"
              aria-hidden
            />
            {t('settings.releasePanel.reviewChanges')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={!canPublishPatch}
            onClick={handlePatchClick}
          >
            <Upload
              className="size-4"
              aria-hidden
            />
            {t('settings.releasePanel.publishPatch')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            className="gap-2"
            disabled={!canPublishMajor}
            onClick={majorConfirmDialog.onOpen}
          >
            <ArrowUpCircle
              className="size-4"
              aria-hidden
            />
            {t('settings.releasePanel.publishMajor')}
          </Button>
        </div>
      </div>

      <CourseReleaseConfirmationDialog
        open={majorConfirmDialog.isOpen}
        onOpenChange={majorConfirmDialog.onToggle}
        onConfirm={majorDialog.onOpen}
        nextVersionNo={nextVersionNo}
      />
      <CoursePublishPatchDialog
        courseId={courseId}
        open={patchDialog.isOpen}
        onOpenChange={patchDialog.onToggle}
        onPublished={onPublished}
      />
      <CoursePublishMajorDialog
        courseId={courseId}
        open={majorDialog.isOpen}
        onOpenChange={majorDialog.onToggle}
        onPublished={onPublished}
      />
    </FieldCard>
  )
}
