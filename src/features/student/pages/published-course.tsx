import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  PublishedCoursePageShell,
  PublishedCourseView,
  PublishedLessonReader,
  PublishedTopicView,
  buildStudentPublishedGameRoute,
  buildStudentPublishedLessonRoute,
  buildStudentPublishedTopicRoute,
  findPublishedLessonInTopic,
  findPublishedTopicInTree,
  usePublishedCourseVersion,
} from '@/features/course'

function useTrimmedStudentPublishedParams() {
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

export function StudentPublishedCoursePage() {
  const { t } = useTranslation('features.student')
  const navigate = useNavigate()
  const { classroomId, courseId } = useTrimmedStudentPublishedParams()

  const { tree, deliveryCount, resolvedVersionId, isLoading, error } = usePublishedCourseVersion({
    courseId,
    classroomId,
  })

  const handleTopicView = (topicCardId: string) => {
    if (!classroomId || !courseId) return
    navigate(buildStudentPublishedTopicRoute(classroomId, courseId, topicCardId))
  }

  const handleGameOpen = (gameId: string) => {
    if (!classroomId || !courseId) return
    navigate(buildStudentPublishedGameRoute(classroomId, courseId, gameId))
  }

  if (!classroomId || !courseId) {
    return (
      <PublishedCoursePageShell role="student">
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('publishedCourse.invalidLink')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  if (isLoading) {
    return (
      <PublishedCoursePageShell role="student">
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
      <PublishedCoursePageShell role="student">
        <Text
          as="p"
          variant="body"
          className="text-destructive"
        >
          {error === 'delivery_not_found'
            ? t('publishedCourse.notDelivered')
            : t('publishedCourse.loadError')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  return (
    <PublishedCoursePageShell role="student">
      <PublishedCourseView
        tree={tree}
        deliveryCount={deliveryCount}
        versions={[]}
        selectedVersionId={resolvedVersionId}
        shouldShowVersionSelect={false}
        classroomContextLabel={t('publishedCourse.contextLabel')}
        onTopicView={handleTopicView}
        onGameOpen={handleGameOpen}
        onVersionChange={() => undefined}
      />
    </PublishedCoursePageShell>
  )
}

export function StudentPublishedTopicPage() {
  const { t } = useTranslation('features.student')
  const { t: tCourse } = useTranslation('features.course')
  const navigate = useNavigate()
  const { classroomId, courseId, topicId } = useTrimmedStudentPublishedParams()

  const { tree, isLoading, error } = usePublishedCourseVersion({
    courseId,
    classroomId,
  })

  const topic = tree && topicId ? findPublishedTopicInTree(tree, topicId) : null

  const handleLessonOpen = (sourceLessonId: string) => {
    if (!classroomId || !courseId || !topicId) return
    navigate(buildStudentPublishedLessonRoute(classroomId, courseId, topicId, sourceLessonId))
  }

  if (!classroomId || !courseId || !topicId) {
    return (
      <PublishedCoursePageShell role="student">
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('publishedCourse.invalidLink')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  if (isLoading) {
    return (
      <PublishedCoursePageShell role="student">
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
      <PublishedCoursePageShell role="student">
        <Text
          as="p"
          variant="body"
          className="text-destructive"
        >
          {error === 'delivery_not_found'
            ? t('publishedCourse.notDelivered')
            : tCourse('published.topicNotFound')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  return (
    <PublishedCoursePageShell role="student">
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

export function StudentPublishedLessonPage() {
  const { t } = useTranslation('features.student')
  const { t: tCourse } = useTranslation('features.course')
  const { classroomId, courseId, topicId, lessonId } = useTrimmedStudentPublishedParams()

  const { tree, isLoading, error } = usePublishedCourseVersion({
    courseId,
    classroomId,
  })

  const topic = tree && topicId ? findPublishedTopicInTree(tree, topicId) : null
  const lesson = topic && lessonId ? findPublishedLessonInTopic(topic, lessonId) : null

  if (!classroomId || !courseId || !topicId || !lessonId) {
    return (
      <PublishedCoursePageShell role="student">
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('publishedCourse.invalidLink')}
        </Text>
      </PublishedCoursePageShell>
    )
  }

  if (isLoading) {
    return (
      <PublishedCoursePageShell
        role="student"
        layout="fullBleed"
      >
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
      <PublishedCoursePageShell role="student">
        <div className="container py-6">
          <Text
            as="p"
            variant="body"
            className="text-destructive"
          >
            {error === 'delivery_not_found'
              ? t('publishedCourse.notDelivered')
              : tCourse('published.lessonNotFound')}
          </Text>
        </div>
      </PublishedCoursePageShell>
    )
  }

  return (
    <PublishedCoursePageShell
      role="student"
      layout="fullBleed"
    >
      <PublishedLessonReader
        lesson={lesson}
        themeId={tree.themeId}
      />
    </PublishedCoursePageShell>
  )
}

export function StudentPublishedCourseGamePage() {
  return (
    <PublishedCoursePageShell
      role="student"
      layout="fullBleed"
    >
      {null}
    </PublishedCoursePageShell>
  )
}
