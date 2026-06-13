import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { usePublishedCourseVersion } from '../../hooks/usePublishedCourseVersion'
import { usePublishedCourseVersionsList } from '../../hooks/usePublishedCourseVersionsList'
import {
  findPublishedLessonInTopic,
  findPublishedTopicInTree,
} from '../../utils/courseVersion.utils'
import { PublishedCourseView } from './PublishedCourseView'
import { PublishedLessonReader } from './PublishedLessonReader'
import { PublishedTopicView } from './PublishedTopicView'

type PublishedCourseReadOnlyContentProps = {
  courseId: string | undefined
  courseVersionId?: string | undefined
  courseBasePath: string
  gameBasePath?: string
}

type PublishedTopicReadOnlyContentProps = {
  courseId: string | undefined
  courseVersionId: string | undefined
  topicId: string | undefined
  courseBasePath: string
}

type PublishedLessonReadOnlyContentProps = PublishedTopicReadOnlyContentProps & {
  lessonId: string | undefined
}

function normalizeBasePath(path: string): string {
  return path.replace(/\/+$/, '')
}

function buildCourseVersionPath(
  courseBasePath: string,
  courseId: string,
  courseVersionId?: string,
): string {
  const basePath = normalizeBasePath(courseBasePath)
  if (!courseVersionId) return `${basePath}/${courseId}`
  return `${basePath}/${courseId}/published/${courseVersionId}`
}

function buildTopicPath(
  courseBasePath: string,
  courseId: string,
  courseVersionId: string,
  topicId: string,
): string {
  return `${buildCourseVersionPath(courseBasePath, courseId, courseVersionId)}/topic/${topicId}`
}

function buildTopicLessonPath(
  courseBasePath: string,
  courseId: string,
  courseVersionId: string,
  topicId: string,
  lessonId: string,
): string {
  return `${buildTopicPath(courseBasePath, courseId, courseVersionId, topicId)}/lesson/${lessonId}`
}

function LoadingState({ contained = false }: { contained?: boolean }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner
        variant="gray"
        size={contained ? 'sm' : 'lg'}
      />
    </div>
  )
}

export function PublishedCourseReadOnlyContent({
  courseId,
  courseVersionId,
  courseBasePath,
  gameBasePath,
}: PublishedCourseReadOnlyContentProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const trimmedCourseId = courseId?.trim()
  const trimmedVersionId = courseVersionId?.trim()

  const { tree, deliveryCount, resolvedVersionId, isLoading, error } = usePublishedCourseVersion({
    courseId: trimmedCourseId,
    courseVersionId: trimmedVersionId,
  })

  const { versions, isLoading: versionsLoading } = usePublishedCourseVersionsList(trimmedCourseId)

  const handleVersionChange = (nextVersionId: string) => {
    if (!trimmedCourseId) return
    navigate(buildCourseVersionPath(courseBasePath, trimmedCourseId, nextVersionId))
  }

  const handleTopicView = (topicCardId: string) => {
    if (!trimmedCourseId || !resolvedVersionId) return
    navigate(buildTopicPath(courseBasePath, trimmedCourseId, resolvedVersionId, topicCardId))
  }

  const handleGameOpen = (gameId: string) => {
    if (!gameBasePath) return
    navigate(`${normalizeBasePath(gameBasePath)}/${gameId}`)
  }

  if (!trimmedCourseId) {
    return (
      <Text
        as="p"
        variant="body"
        muted
      >
        {t('published.invalidCourse')}
      </Text>
    )
  }

  if (isLoading || versionsLoading) {
    return <LoadingState />
  }

  if (error || !tree) {
    return (
      <Text
        as="p"
        variant="body"
        className="text-destructive"
      >
        {error === 'no_published_version'
          ? t('published.noPublishedVersion')
          : t('published.loadError')}
      </Text>
    )
  }

  return (
    <PublishedCourseView
      tree={tree}
      deliveryCount={deliveryCount}
      versions={versions}
      selectedVersionId={resolvedVersionId}
      shouldShowVersionSelect={versions.length > 1}
      onTopicView={handleTopicView}
      onGameOpen={handleGameOpen}
      onVersionChange={handleVersionChange}
    />
  )
}

export function PublishedTopicReadOnlyContent({
  courseId,
  courseVersionId,
  topicId,
  courseBasePath,
}: PublishedTopicReadOnlyContentProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
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
      buildTopicLessonPath(
        courseBasePath,
        trimmedCourseId,
        trimmedVersionId,
        trimmedTopicId,
        sourceLessonId,
      ),
    )
  }

  if (!trimmedCourseId || !trimmedVersionId || !trimmedTopicId) {
    return (
      <Text
        as="p"
        variant="body"
        muted
      >
        {t('published.invalidCourse')}
      </Text>
    )
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !tree || !topic) {
    return (
      <Text
        as="p"
        variant="body"
        className="text-destructive"
      >
        {t('published.topicNotFound')}
      </Text>
    )
  }

  return (
    <PublishedTopicView
      topic={topic}
      themeId={tree.themeId}
      versionNo={tree.versionNo}
      publishedAt={tree.publishedAt}
      onLessonOpen={handleLessonOpen}
    />
  )
}

export function PublishedTopicLessonReadOnlyContent({
  courseId,
  courseVersionId,
  topicId,
  lessonId,
}: PublishedLessonReadOnlyContentProps) {
  const { t } = useTranslation('features.course')
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
      <Text
        as="p"
        variant="body"
        muted
      >
        {t('published.invalidLesson')}
      </Text>
    )
  }

  if (isLoading) {
    return <LoadingState contained />
  }

  if (error || !tree || !topic || !lesson) {
    return (
      <Text
        as="p"
        variant="body"
        className="text-destructive"
      >
        {t('published.lessonNotFound')}
      </Text>
    )
  }

  return (
    <PublishedLessonReader
      lesson={lesson}
      themeId={tree.themeId}
      layout="contained"
    />
  )
}
