import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { PublishedCoursePageShell, PublishedCourseView } from '../components/published'
import { usePublishedCourseVersion } from '../hooks/usePublishedCourseVersion'
import { usePublishedCourseVersionsList } from '../hooks/usePublishedCourseVersionsList'
import {
  buildPublishedCourseRoute,
  buildPublishedCourseGameRoute,
  buildPublishedTopicRoute,
} from '../utils/courseVersion.utils'
import { buildCourseReleaseReviewRoute } from '../utils/courseRelease.utils'

export function PublishedCoursePage() {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const { courseId, courseVersionId } = useParams<{
    courseId: string
    courseVersionId?: string
  }>()

  const trimmedCourseId = courseId?.trim()
  const trimmedVersionId = courseVersionId?.trim()

  const { tree, deliveryCount, resolvedVersionId, isLoading, error, isClassroomLocked } =
    usePublishedCourseVersion({
      courseId: trimmedCourseId,
      courseVersionId: trimmedVersionId,
    })

  const { versions, isLoading: versionsLoading } = usePublishedCourseVersionsList(
    isClassroomLocked ? undefined : trimmedCourseId,
  )

  const handleVersionChange = (nextVersionId: string) => {
    if (!trimmedCourseId) return
    navigate(buildPublishedCourseRoute(trimmedCourseId, nextVersionId))
  }

  const handleCompareToDraft = () => {
    if (!trimmedCourseId) return
    navigate(buildCourseReleaseReviewRoute(trimmedCourseId))
  }

  const handleOpenEditor = () => {
    if (!trimmedCourseId) return
    navigate(`/teacher/course/${trimmedCourseId}`)
  }

  const handleTopicView = (topicCardId: string) => {
    if (!trimmedCourseId || !resolvedVersionId) return
    navigate(buildPublishedTopicRoute(trimmedCourseId, resolvedVersionId, topicCardId))
  }

  const handleGameOpen = (gameId: string) => {
    if (!trimmedCourseId || !resolvedVersionId) return
    navigate(buildPublishedCourseGameRoute(trimmedCourseId, resolvedVersionId, gameId))
  }

  if (!trimmedCourseId) {
    return (
      <PublishedCoursePageShell>
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('published.invalidCourse')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  if (isLoading || versionsLoading) {
    return (
      <PublishedCoursePageShell>
        <div className="flex items-center justify-center py-16">
          <Spinner
            variant="gray"
            size="lg"
          />
        </div>
      </PublishedCoursePageShell>
    )
  }

  if (error || !tree) {
    return (
      <PublishedCoursePageShell>
        <Text
          as="p"
          variant="body"
          className="text-destructive"
        >
          {error === 'no_published_version'
            ? t('published.noPublishedVersion')
            : t('published.loadError')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  return (
    <PublishedCoursePageShell>
      <PublishedCourseView
        tree={tree}
        deliveryCount={deliveryCount}
        versions={versions}
        selectedVersionId={resolvedVersionId}
        shouldShowVersionSelect={!isClassroomLocked && versions.length > 1}
        onTopicView={handleTopicView}
        onGameOpen={handleGameOpen}
        onVersionChange={handleVersionChange}
        onCompareToDraft={handleCompareToDraft}
        onOpenEditor={handleOpenEditor}
      />
    </PublishedCoursePageShell>
  )
}
