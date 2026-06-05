import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  PublishedCoursePageShell,
  PublishedCourseView,
  PublishedLessonReader,
  PublishedTopicView,
  usePublishedCourseVersion,
  buildClassroomPublishedLessonRoute,
  buildClassroomPublishedTopicRoute,
  buildClassroomPublishedGameRoute,
  buildCourseReleaseReviewRoute,
  findPublishedTopicInTree,
  findPublishedLessonInTopic,
} from '@/features/course'

function useTrimmedClassroomPublishedParams() {
  const { classroomId, courseId, topicId, lessonId } = useParams<{
    classroomId: string
    courseId: string
    topicId?: string
    lessonId?: string
  }>()

  return {
    classroomId: classroomId?.trim(),
    courseId: courseId?.trim(),
    topicId: topicId?.trim(),
    lessonId: lessonId?.trim(),
  }
}

export function ClassroomPublishedCoursePage() {
  const { t } = useTranslation('features.teacher')
  const navigate = useNavigate()
  const { classroomId, courseId } = useTrimmedClassroomPublishedParams()

  const { tree, deliveryCount, resolvedVersionId, isLoading, error } = usePublishedCourseVersion({
    courseId,
    classroomId,
  })

  const handleCompareToDraft = () => {
    if (!courseId) return
    navigate(buildCourseReleaseReviewRoute(courseId))
  }

  const handleTopicView = (topicCardId: string) => {
    if (!classroomId || !courseId) return
    navigate(buildClassroomPublishedTopicRoute(classroomId, courseId, topicCardId))
  }

  const handleGameOpen = (gameId: string) => {
    if (!classroomId || !courseId) return
    navigate(buildClassroomPublishedGameRoute(classroomId, courseId, gameId))
  }

  if (!classroomId || !courseId) {
    return (
      <PublishedCoursePageShell>
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('pages.classroomDetail.publishedCourse.invalidLink')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  if (isLoading) {
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
          {error === 'delivery_not_found'
            ? t('pages.classroomDetail.publishedCourse.notDelivered')
            : t('pages.classroomDetail.publishedCourse.loadError')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  return (
    <PublishedCoursePageShell>
      <PublishedCourseView
        tree={tree}
        deliveryCount={deliveryCount}
        versions={[]}
        selectedVersionId={resolvedVersionId}
        shouldShowVersionSelect={false}
        classroomContextLabel={t('pages.classroomDetail.publishedCourse.contextLabel')}
        onTopicView={handleTopicView}
        onGameOpen={handleGameOpen}
        onVersionChange={() => undefined}
        onCompareToDraft={handleCompareToDraft}
      />
    </PublishedCoursePageShell>
  )
}

export function ClassroomTopicPublishedPage() {
  const { t } = useTranslation('features.teacher')
  const { t: tCourse } = useTranslation('features.course')
  const navigate = useNavigate()
  const { classroomId, courseId, topicId } = useTrimmedClassroomPublishedParams()

  const { tree, isLoading, error } = usePublishedCourseVersion({
    courseId,
    classroomId,
  })

  const topic = tree && topicId ? findPublishedTopicInTree(tree, topicId) : null

  const handleLessonOpen = (sourceLessonId: string) => {
    if (!classroomId || !courseId || !topicId) return
    navigate(buildClassroomPublishedLessonRoute(classroomId, courseId, topicId, sourceLessonId))
  }

  if (!classroomId || !courseId || !topicId) {
    return (
      <PublishedCoursePageShell>
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('pages.classroomDetail.publishedCourse.invalidLink')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  if (isLoading) {
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

  if (error || !tree || !topic) {
    return (
      <PublishedCoursePageShell>
        <Text
          as="p"
          variant="body"
          className="text-destructive"
        >
          {error === 'delivery_not_found'
            ? t('pages.classroomDetail.publishedCourse.notDelivered')
            : tCourse('published.topicNotFound')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  return (
    <PublishedCoursePageShell>
      <PublishedTopicView
        topic={topic}
        themeId={tree.themeId}
        versionNo={tree.versionNo}
        publishedAt={tree.publishedAt}
        onLessonOpen={handleLessonOpen}
      />
    </PublishedCoursePageShell>
  )
}

export function ClassroomCourseTopicLessonPublishedPage() {
  const { t } = useTranslation('features.teacher')
  const { t: tCourse } = useTranslation('features.course')
  const { classroomId, courseId, topicId, lessonId } = useTrimmedClassroomPublishedParams()

  const { tree, isLoading, error } = usePublishedCourseVersion({
    courseId,
    classroomId,
  })

  const topic = tree && topicId ? findPublishedTopicInTree(tree, topicId) : null
  const lesson = topic && lessonId ? findPublishedLessonInTopic(topic, lessonId) : null

  if (!classroomId || !courseId || !topicId || !lessonId) {
    return (
      <PublishedCoursePageShell>
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('pages.classroomDetail.publishedCourse.invalidLink')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  if (isLoading) {
    return (
      <PublishedCoursePageShell layout="fullBleed">
        <div className="flex items-center justify-center py-16">
          <Spinner
            variant="gray"
            size="lg"
          />
        </div>
      </PublishedCoursePageShell>
    )
  }

  if (error || !tree || !topic || !lesson) {
    return (
      <PublishedCoursePageShell>
        <div className="container py-6">
          <Text
            as="p"
            variant="body"
            className="text-destructive"
          >
            {tCourse('published.lessonNotFound')}
          </Text>
        </div>
      </PublishedCoursePageShell>
    )
  }

  return (
    <PublishedCoursePageShell layout="fullBleed">
      <PublishedLessonReader
        lesson={lesson}
        themeId={tree.themeId}
      />
    </PublishedCoursePageShell>
  )
}
