import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

import { useLessonReleaseStatus } from '../../hooks/useLessonReleaseStatus'
import { buildCourseReleaseReviewRoute } from '../../utils/courseRelease.utils'

type LessonLiveStatusBannerProps = {
  courseId: string | undefined
  lessonId: string | undefined
}

export function LessonLiveStatusBanner({ courseId, lessonId }: LessonLiveStatusBannerProps) {
  const { t } = useTranslation('features.course')
  const { status, loading } = useLessonReleaseStatus({ courseId, lessonId })

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3">
        <Spinner
          variant="gray"
          size="sm"
        />
      </div>
    )
  }

  if (!status.isInLiveSnapshot) {
    return (
      <Alert variant="blue">
        <AlertTitle>{t('lesson.liveStatus.notPublishedTitle')}</AlertTitle>
        <AlertDescription>{t('lesson.liveStatus.notPublishedDescription')}</AlertDescription>
      </Alert>
    )
  }

  if (!status.hasDraftDrift) {
    return (
      <Alert variant="default">
        <div className="flex flex-wrap items-center gap-2">
          <AlertTitle>{t('lesson.liveStatus.inLiveTitle')}</AlertTitle>
          <Badge variant="secondary">
            {t('lesson.liveStatus.versionBadge', { version: status.liveVersionNo ?? 0 })}
          </Badge>
        </div>
        <AlertDescription>{t('lesson.liveStatus.inLiveDescription')}</AlertDescription>
      </Alert>
    )
  }

  const reviewHref =
    courseId && lessonId ? buildCourseReleaseReviewRoute(courseId, lessonId) : undefined

  return (
    <Alert variant="orange">
      <AlertTitle>{t('lesson.liveStatus.unpublishedTitle')}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>{t('lesson.liveStatus.unpublishedDescription')}</span>
        {reviewHref ? (
          <Link
            to={reviewHref}
            className="font-medium underline underline-offset-4"
          >
            {t('lesson.liveStatus.reviewChanges')}
          </Link>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
