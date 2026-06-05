import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import {
  PublishedCoursePageShell,
  PublishedTopicView,
  PublishedLessonReader,
} from '../components/published'
import { usePublishedCourseVersion } from '../hooks/usePublishedCourseVersion'
import {
  buildPublishedTopicLessonRoute,
  findPublishedLessonInTopic,
  findPublishedTopicInTree,
} from '../utils/courseVersion.utils'

export function PublishedCourseTopicPage() {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const { courseId, courseVersionId, topicId } = useParams<{
    courseId: string
    courseVersionId: string
    topicId: string
  }>()

  const trimmedCourseId = courseId?.trim()
  const trimmedVersionId = courseVersionId?.trim()
  const trimmedTopicId = topicId?.trim()

  const { tree, isLoading, error } = usePublishedCourseVersion({
    courseId: trimmedCourseId,
    courseVersionId: trimmedVersionId,
  })

  const topic = tree && trimmedTopicId ? findPublishedTopicInTree(tree, trimmedTopicId) : null

  const handleLessonOpen = (sourceLessonId: string) => {
    if (!trimmedCourseId || !trimmedVersionId || !trimmedTopicId) return
    navigate(
      buildPublishedTopicLessonRoute(
        trimmedCourseId,
        trimmedVersionId,
        trimmedTopicId,
        sourceLessonId,
      ),
    )
  }

  if (!trimmedCourseId || !trimmedVersionId || !trimmedTopicId) {
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
          {t('published.topicNotFound')}
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

export function PublishedCourseTopicLessonPage() {
  const { t } = useTranslation('features.course')
  const { courseId, courseVersionId, topicId, lessonId } = useParams<{
    courseId: string
    courseVersionId: string
    topicId: string
    lessonId: string
  }>()

  const trimmedCourseId = courseId?.trim()
  const trimmedVersionId = courseVersionId?.trim()
  const trimmedTopicId = topicId?.trim()
  const trimmedLessonId = lessonId?.trim()

  const { tree, isLoading, error } = usePublishedCourseVersion({
    courseId: trimmedCourseId,
    courseVersionId: trimmedVersionId,
  })

  const topic = tree && trimmedTopicId ? findPublishedTopicInTree(tree, trimmedTopicId) : null
  const lesson =
    topic && trimmedLessonId ? findPublishedLessonInTopic(topic, trimmedLessonId) : null

  if (!trimmedCourseId || !trimmedVersionId || !trimmedTopicId || !trimmedLessonId) {
    return (
      <PublishedCoursePageShell>
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('published.invalidLesson')}
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
            {t('published.lessonNotFound')}
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
