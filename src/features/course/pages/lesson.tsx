import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import { useCourse } from '@/contexts/course'
import LessonLayout from '@/features/course/components/LessonLayout'
import LessonSettings from '@/features/course/components/LessonSettings'
import LessonEditor from '@/features/course/components/LessonEditor'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'
import LessonPreviewContent from '@/features/course/components/LessonPreviewContent'
import { getThemeBackgroundStyle, getThemeDescriptionStyle, getThemeTitleStyle } from '@/lib/themes'

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
  const navState = location.state as { initialTab?: 'overview' | 'preview' | 'settings' } | null
  const initialTabFromNav = navState?.initialTab
  const { lesson, fetchLessonById, createLesson, updateLesson } = useLesson()
  const { selectedCourse, fetchCourseById } = useCourse()
  const [editorValue, setEditorValue] = useState<Record<string, unknown> | undefined>(undefined)
  const [, setIsInitialContentLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'settings'>(
    () => initialTabFromNav ?? 'overview',
  )

  useEffect(() => {
    if (initialTabFromNav != null) {
      setActiveTab(initialTabFromNav)
    }
  }, [lessonId, initialTabFromNav])
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingTabRef = useRef<'overview' | 'preview' | 'settings' | null>(null)

  // Route changes can happen without unmounting. Clear pending autosave timers
  // so stale updates from a previous lesson do not fire against a reset context.
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    setHasUnsavedChanges(false)
  }, [lessonId])

  useEffect(() => {
    if (!courseId) return
    if (!selectedCourse || selectedCourse.id !== courseId) {
      void fetchCourseById(courseId)
    }
  }, [courseId, selectedCourse, fetchCourseById])

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
          setEditorValue(parseContent(fetchedLesson.content) ?? {})
          setHasUnsavedChanges(false)
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
    if (!lesson || lesson.id !== lessonId) return
    setEditorValue(parseContent(lesson.content) ?? {})
    setHasUnsavedChanges(false)
  }, [lessonId, lesson])

  const handleEditorChange = useCallback(
    (newValue: Record<string, unknown>) => {
      if (!lessonId) return
      setEditorValue(newValue)
      setHasUnsavedChanges(true)

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      saveTimerRef.current = setTimeout(() => {
        updateLesson({ content: JSON.stringify(newValue) }, lessonId)
          .then(() => setHasUnsavedChanges(false))
          .catch(console.error)
      }, 1500)
    },
    [lessonId, updateLesson],
  )

  const handleTabChange = useCallback(
    (requestedTab: 'overview' | 'preview' | 'settings') => {
      if (requestedTab === activeTab) return
      if (hasUnsavedSettingsChanges) {
        pendingTabRef.current = requestedTab
        toast.custom(
          (id) => (
            <div className="flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-md">
              <Text
                as="p"
                variant="body"
                className="font-semibold"
              >
                {t('unsavedChanges.title')}
              </Text>
              <Text
                as="p"
                variant="small"
                className="text-muted-foreground"
              >
                {t('unsavedChanges.description')}
              </Text>
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-foreground border-border"
                  onClick={() => {
                    pendingTabRef.current = null
                    toast.dismiss(id)
                  }}
                >
                  {t('unsavedChanges.stay')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const tab = pendingTabRef.current
                    pendingTabRef.current = null
                    toast.dismiss(id)
                    if (tab) setActiveTab(tab)
                  }}
                >
                  {t('unsavedChanges.continueAnyway')}
                </Button>
              </div>
            </div>
          ),
          { duration: Infinity },
        )
        return
      }
      setActiveTab(requestedTab)
    },
    [activeTab, hasUnsavedSettingsChanges, t],
  )

  useEffect(() => {
    const anyUnsaved = hasUnsavedChanges || hasUnsavedSettingsChanges
    if (!anyUnsaved) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasUnsavedChanges, hasUnsavedSettingsChanges])

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

  const lessonHeroBanner = (
    <div className="relative overflow-hidden rounded-2xl border min-h-[260px]">
      <div
        className="absolute inset-0 h-full w-full"
        style={getThemeBackgroundStyle(selectedCourse?.theme_id)}
      />
      <div className="relative z-10 flex min-h-[260px] items-center justify-center px-6 py-10">
        <div className="max-w-3xl text-center text-foreground">
          <Text
            as="h1"
            variant="h1"
            className="text-4xl font-semibold tracking-tight md:text-5xl"
            style={getThemeTitleStyle(selectedCourse?.theme_id)}
          >
            {lessonTitle}
          </Text>
          <Text
            as="p"
            variant="body"
            className="mt-4 text-base font-semibold leading-7 md:text-lg"
            style={getThemeDescriptionStyle(selectedCourse?.theme_id)}
          >
            {lessonDescription}
          </Text>
        </div>
      </div>
    </div>
  )

  const overviewContent = (
    <div className="relative flex flex-col gap-6">
      <div className="animate-in fade-in-0 slide-in-from-bottom-4">{lessonHeroBanner}</div>

      {editorValue !== undefined ? (
        <LessonEditor
          key={`lesson-${lessonId}`}
          className="w-full border rounded-2xl flex-1 animate-in fade-in-0 slide-in-from-bottom-4 bg-white"
          value={editorValue}
          onChange={handleEditorChange}
          placeholder={t('page.editorPlaceholder')}
        />
      ) : (
        <div className="flex min-h-[280px] w-full items-center justify-center rounded-2xl border bg-muted/30">
          <div className="flex flex-col items-center gap-2">
            <Spinner
              variant="gray"
              size="md"
              speed={1750}
            />
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('layout.loading')}
            </Text>
          </div>
        </div>
      )}
    </div>
  )

  const previewContent = (
    <LessonPreviewContent
      title={lessonTitle}
      description={lessonDescription}
      value={editorValue}
      loading={editorValue === undefined}
      previewTitle={t('page.previewTitle', { defaultValue: 'Preview' })}
      previewHint={t('page.previewHint', {
        defaultValue: 'Read-only preview of the lesson content.',
      })}
      headingsNavLabel={t('page.headingsNavLabel', { defaultValue: 'On this page' })}
      loadingLabel={t('layout.loading')}
      editorPlaceholder={t('page.editorPlaceholder')}
      themeId={selectedCourse?.theme_id}
    />
  )

  return (
    <LessonLayout
      lessonId={lessonId}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      overviewContent={overviewContent}
      previewContent={previewContent}
      settingsContent={
        <LessonSettings
          lessonId={lessonId}
          courseId={courseId}
          onUnsavedChange={setHasUnsavedSettingsChanges}
        />
      }
    />
  )
}
