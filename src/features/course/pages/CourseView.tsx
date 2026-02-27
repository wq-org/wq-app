import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppWrapper from '@/components/layout/AppWrapper'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import CoursePreviewTab from '@/features/course/components/CoursePreviewTab'
import { getCourseById } from '@/features/course/api/coursesApi'
import type { Course } from '@/features/course/types/course.types'
import { useTranslation } from 'react-i18next'

export default function CourseView() {
  const { t } = useTranslation('features.course')
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadCourse() {
      if (!courseId) {
        setCourse(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await getCourseById(courseId)
        if (!cancelled) setCourse(data)
      } catch (error) {
        console.error('Error loading course for student view:', error)
        if (!cancelled) setCourse(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadCourse()
    return () => {
      cancelled = true
    }
  }, [courseId])

  return (
    <AppWrapper role="student">
      <div className="flex flex-col gap-6 w-full mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner
              variant="gray"
              size="lg"
              speed={1750}
            />
          </div>
        ) : !course || !courseId ? (
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {t('page.notFound')}
          </Text>
        ) : (
          <>
            <div className="space-y-1">
              <Text
                as="h1"
                variant="h1"
                className="text-3xl font-semibold"
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
              onLessonView={(lessonId) =>
                navigate(`/student/course/${courseId}/lesson/${lessonId}`)
              }
            />
          </>
        )}
      </div>
    </AppWrapper>
  )
}
