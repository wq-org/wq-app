import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppWrapper from '@/components/layout/AppWrapper'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { getLessonById } from '@/features/course/api/lessonsApi'
import { getCourseById } from '@/features/course/api/coursesApi'
import type { Lesson } from '@/features/course/types/lesson.types'
import type { Course } from '@/features/course/types/course.types'
import LessonPreviewContent from '@/features/course/components/LessonPreviewContent'

function parseLessonContent(raw: unknown): Record<string, unknown> {
  if (raw == null || raw === '') return {}
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return {}
}

export default function LessonView() {
  const { t } = useTranslation('features.lesson')
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadLesson() {
      if (!lessonId) {
        setLesson(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await getLessonById(lessonId)
        if (!cancelled) setLesson(data)
      } catch (error) {
        console.error('Error loading lesson for student view:', error)
        if (!cancelled) setLesson(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadLesson()
    return () => {
      cancelled = true
    }
  }, [lessonId])

  useEffect(() => {
    let cancelled = false

    async function loadCourse() {
      if (!courseId) {
        setCourse(null)
        return
      }

      try {
        const data = await getCourseById(courseId)
        if (!cancelled) setCourse(data)
      } catch (error) {
        console.error('Error loading course for lesson preview:', error)
        if (!cancelled) setCourse(null)
      }
    }

    void loadCourse()
    return () => {
      cancelled = true
    }
  }, [courseId])

  const contentValue = useMemo(() => parseLessonContent(lesson?.content), [lesson?.content])

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
        ) : !lesson ? (
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {t('page.notFound', { defaultValue: 'Lesson not found' })}
          </Text>
        ) : (
          <LessonPreviewContent
            title={lesson.title?.trim() || t('page.fallbackTitle')}
            description={
              lesson.description?.trim() ||
              t('page.headerDescription', {
                defaultValue: 'Write a short summary to introduce this lesson.',
              })
            }
            value={contentValue}
            previewTitle={t('page.previewTitle', { defaultValue: 'Preview' })}
            previewHint={t('page.previewHint', {
              defaultValue: 'Read-only preview of the lesson content.',
            })}
            headingsNavLabel={t('page.headingsNavLabel', { defaultValue: 'On this page' })}
            loadingLabel={t('layout.loading')}
            editorPlaceholder={t('page.editorPlaceholder')}
            themeId={course?.theme_id}
          />
        )}
      </div>
    </AppWrapper>
  )
}
