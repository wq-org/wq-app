import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import LessonLayout from '@/features/course/components/LessonLayout'
import LessonSettings from '@/features/course/components/LessonSettings'
import LessonEditor from '@/features/course/components/LessonEditor'
import { DEFAULT_LESSON_BACKGROUND } from '@/lib/constants'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import Spinner from '@/components/ui/spinner'

function parseContent(raw: unknown): Record<string, unknown> | undefined {
  if (raw == null || raw === '') return undefined
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) return parsed
    } catch {
      return undefined
    }
  }
  return undefined
}

export default function Lesson() {
  const { t } = useTranslation('features.lesson')
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { lesson, loading, fetchLessonById, createLesson, updateLesson } = useLesson()
  const [editorValue, setEditorValue] = useState<Record<string, unknown> | undefined>(undefined)
  const [isInitialContentLoading, setIsInitialContentLoading] = useState(true)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadLesson = async () => {
      if (!lessonId) {
        setIsInitialContentLoading(false)
        return
      }

      setEditorValue(undefined)
      setIsInitialContentLoading(true)

      const state = location.state as {
        title?: string
        description?: string
        topicId?: string
      } | null

      if (state?.title && state?.topicId) {
        try {
          const newLesson = await createLesson({
            title: state.title,
            content: '',
            description: state.description || '',
            topic_id: state.topicId,
          })
          if (!cancelled) {
            if (courseId) {
              navigate(`/teacher/course/${courseId}/lesson/${newLesson.id}`, { replace: true })
            } else {
              navigate(`/teacher/lesson/${newLesson.id}`, { replace: true })
            }
          }
        } catch (error) {
          if (!cancelled) {
            console.error(error)
            setIsInitialContentLoading(false)
          }
        }
        return
      }

      try {
        const fetchedLesson = await fetchLessonById(lessonId)
        if (!cancelled) {
          setEditorValue(parseContent(fetchedLesson.content))
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error)
          setEditorValue(undefined)
        }
      } finally {
        if (!cancelled) {
          setIsInitialContentLoading(false)
        }
      }
    }

    void loadLesson()

    return () => {
      cancelled = true
    }
  }, [lessonId, courseId, location.state, fetchLessonById, createLesson, navigate])

  useEffect(() => {
    if (!lesson) return
    setEditorValue(parseContent(lesson.content))
  }, [lesson?.id, lesson?.content])

  const handleEditorChange = useCallback(
    (newValue: Record<string, unknown>) => {
      setEditorValue(newValue)

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      saveTimerRef.current = setTimeout(() => {
        updateLesson({ content: JSON.stringify(newValue) }).catch(console.error)
      }, 1500)
    },
    [updateLesson],
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  if (!lessonId) {
    return <div>Lesson not found</div>
  }

  const lessonTitle = lesson?.title?.trim() || t('page.fallbackTitle')
  const lessonDescription =
    lesson?.description?.trim() ||
    t('page.headerDescription', {
      defaultValue: 'Write a short summary to introduce this lesson.',
    })

  const overviewContent = (
    <div className="relative flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border min-h-[260px] animate-in fade-in-0 slide-in-from-bottom-4">
        <img
          src={DEFAULT_LESSON_BACKGROUND}
          alt={lessonTitle}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex min-h-[260px] items-center justify-center px-6 py-10">
          <div className="max-w-3xl text-center text-white">
            <Text
              as="h1"
              variant="h1"
              className="text-white text-4xl md:text-5xl font-semibold tracking-tight"
            >
              {lessonTitle}
            </Text>
            <Text
              as="p"
              variant="body"
              className="mt-4 text-white/90 text-base md:text-lg leading-7"
            >
              {lessonDescription}
            </Text>
          </div>
        </div>
      </section>

      <LessonEditor
        className="w-full border rounded-2xl flex-1 animate-in fade-in-0 slide-in-from-bottom-4 bg-white"
        value={editorValue}
        onChange={handleEditorChange}
        placeholder={t('page.editorPlaceholder')}
      />
      {isInitialContentLoading && loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Spinner
              variant="gray"
              size="md"
              speed={1750}
            />
            <Text
              as="p"
              variant="body"
              className="text-sm text-gray-500"
            >
              {t('editorCanvas.loading', { defaultValue: t('layout.loading') })}
            </Text>
          </div>
        </div>
      )}
    </div>
  )

  const previewContent = (
    <div className="relative flex flex-col gap-6">
      <section className="rounded-2xl border bg-white p-6 animate-in fade-in-0 slide-in-from-bottom-4">
        <Text
          as="h2"
          variant="h2"
          className="text-2xl font-semibold"
        >
          {t('page.previewTitle', { defaultValue: 'Preview' })}
        </Text>
        <Text
          as="p"
          variant="body"
          className="mt-2 text-sm text-muted-foreground"
        >
          {t('page.previewHint', {
            defaultValue: 'Read-only preview of the lesson content.',
          })}
        </Text>

        <LessonEditor
          className="mt-4 rounded-xl border bg-background"
          value={editorValue}
          readOnly
          placeholder={t('page.editorPlaceholder')}
        />
      </section>

      {isInitialContentLoading && loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Spinner
              variant="gray"
              size="md"
              speed={1750}
            />
            <Text
              as="p"
              variant="body"
              className="text-sm text-gray-500"
            >
              {t('editorCanvas.loading', { defaultValue: t('layout.loading') })}
            </Text>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <LessonLayout
      lessonId={lessonId}
      overviewContent={overviewContent}
      previewContent={previewContent}
      settingsContent={
        <LessonSettings
          lessonId={lessonId}
          courseId={courseId}
        />
      }
    />
  )
}
