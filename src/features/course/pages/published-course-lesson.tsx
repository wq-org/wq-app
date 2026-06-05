import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { PublishedCoursePageShell, PublishedLessonReader } from '../components/published'
import { usePublishedCourseVersion } from '../hooks/usePublishedCourseVersion'
import { findPublishedLessonInTree } from '../utils/courseVersion.utils'

export function PublishedCourseLessonPage() {
  const { t } = useTranslation('features.course')
  const { courseId, courseVersionId, lessonId } = useParams<{
    courseId: string
    courseVersionId: string
    lessonId: string
  }>()

  const trimmedCourseId = courseId?.trim()
  const trimmedVersionId = courseVersionId?.trim()
  const trimmedLessonId = lessonId?.trim()

  const { tree, isLoading, error } = usePublishedCourseVersion({
    courseId: trimmedCourseId,
    courseVersionId: trimmedVersionId,
  })

  const lesson = tree && trimmedLessonId ? findPublishedLessonInTree(tree, trimmedLessonId) : null

  if (!trimmedCourseId || !trimmedVersionId || !trimmedLessonId) {
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

  if (error || !tree || !lesson) {
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
