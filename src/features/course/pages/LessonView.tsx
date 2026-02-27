import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppWrapper from '@/components/layout/AppWrapper'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import LessonEditor from '@/features/course/components/LessonEditor'
import { getLessonById } from '@/features/course/api/lessonsApi'
import type { Lesson } from '@/features/course/types/lesson.types'

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
  const { lessonId } = useParams<{ lessonId: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
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
          <div className="rounded-2xl border bg-white p-6">
            <Text
              as="h1"
              variant="h1"
              className="text-3xl font-semibold"
            >
              {lesson.title?.trim() || t('page.fallbackTitle')}
            </Text>
            {lesson.description ? (
              <Text
                as="p"
                variant="body"
                className="mt-2 text-muted-foreground"
              >
                {lesson.description}
              </Text>
            ) : null}

            <LessonEditor
              className="mt-6 rounded-xl border bg-background"
              value={contentValue}
              readOnly
              placeholder={t('page.editorPlaceholder')}
            />
          </div>
        )}
      </div>
    </AppWrapper>
  )
}
