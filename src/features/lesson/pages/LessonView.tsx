import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { getLessonById } from '../api/lessonsApi'
import type { Lesson } from '../types/lesson.types'

const LessonView = () => {
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
        if (!cancelled) {
          setLesson(data)
        }
      } catch (error) {
        console.error('Error loading lesson for student view:', error)
        if (!cancelled) {
          setLesson(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadLesson()

    return () => {
      cancelled = true
    }
  }, [lessonId])

  return (
    <AppShell role="student">
      <div className="container flex w-full max-w-3xl flex-col gap-4 py-6">
        {!loading && !lesson ? (
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {t('page.notFound', { defaultValue: 'Lesson not found' })}
          </Text>
        ) : (
          <>
            <Text
              as="h1"
              variant="h2"
            >
              {lesson?.title?.trim() || t('page.fallbackTitle')}
            </Text>
            <div className="space-y-1">
              <Text
                as="label"
                variant="small"
              >
                Title
              </Text>
              <Input
                value={lesson?.title ?? ''}
                readOnly
              />
            </div>
            <div className="space-y-1">
              <Text
                as="label"
                variant="small"
              >
                Description
              </Text>
              <Textarea
                value={lesson?.description ?? ''}
                readOnly
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Text
                as="label"
                variant="small"
              >
                Content
              </Text>
              <Textarea
                value={lesson?.content ?? ''}
                readOnly
                rows={10}
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

export { LessonView }
