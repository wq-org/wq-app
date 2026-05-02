import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/layout'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { CoursePreviewTab } from '../components/CoursePreviewTab'
import { useCourseDetail } from '../hooks/useCourseDetail'

export function CourseDetailPage() {
  const { t } = useTranslation('features.course')
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { course, loading, error } = useCourseDetail(courseId)

  const handleTopicView = (topicId: string) => {
    navigate(`/student/course/${courseId}/topic/${topicId}`)
  }

  const missingId = !courseId?.trim()

  return (
    <AppShell role="student">
      <div className="container flex w-full flex-col gap-6 py-6">
        {missingId ? (
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {t('page.notFound')}
          </Text>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner
              variant="gray"
              size="lg"
              speed={1750}
            />
          </div>
        ) : error ? (
          <Text
            as="p"
            variant="body"
            className="text-sm text-destructive"
          >
            {t('page.loadError')}
          </Text>
        ) : !course ? (
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {t('page.notFound')}
          </Text>
        ) : (
          <>
            <div className="space-y-1 text-center">
              <Text
                as="h1"
                variant="h1"
              >
                {course.title}
              </Text>
              {course.description ? (
                <Text
                  as="p"
                  variant="body"
                  className="text-muted-foreground"
                >
                  {course.description}
                </Text>
              ) : null}
            </div>
            <CoursePreviewTab
              courseId={courseId}
              themeId={course.theme_id}
              onTopicView={handleTopicView}
            />
          </>
        )}
      </div>
    </AppShell>
  )
}
