import { useParams, useSearchParams } from 'react-router-dom'

import { AppShell } from '@/components/layout'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

import { CourseReleaseReview } from '../components/release/CourseReleaseReview'

export function CourseReleaseReviewPage() {
  const { t } = useTranslation('features.course')
  const { courseId } = useParams<{ courseId: string }>()
  const [searchParams] = useSearchParams()
  const trimmedCourseId = courseId?.trim()
  const focusLessonId = searchParams.get('focus')?.trim() || undefined

  if (!trimmedCourseId) {
    return (
      <AppShell role="teacher">
        <div className="container py-6">
          <Text
            as="p"
            variant="body"
            muted
          >
            {t('page.notFound')}
          </Text>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell role="teacher">
      <div className="container flex w-full flex-col gap-6 py-6">
        <CourseReleaseReview
          courseId={trimmedCourseId}
          focusLessonId={focusLessonId}
        />
      </div>
    </AppShell>
  )
}
