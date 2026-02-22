import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import LessonLayout from '@/features/course/components/LessonLayout'
import LessonSettings from '@/features/course/components/LessonSettings'
import LessonEditor from '@/features/course/components/LessonEditor'
import { getHeadingsFromLessonValue } from '@/features/course/utils/lessonHeadings'
import { DEFAULT_LESSON_BACKGROUND } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
  const navState = location.state as { initialTab?: 'overview' | 'preview' | 'settings' } | null
  const initialTabFromNav = navState?.initialTab
  const { lesson, fetchLessonById, createLesson, updateLesson } = useLesson()
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
  }, [lessonId, lesson?.id, lesson?.content])

  const handleEditorChange = useCallback(
    (newValue: Record<string, unknown>) => {
      setEditorValue(newValue)
      setHasUnsavedChanges(true)

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      saveTimerRef.current = setTimeout(() => {
        updateLesson({ content: JSON.stringify(newValue) })
          .then(() => setHasUnsavedChanges(false))
          .catch(console.error)
      }, 1500)
    },
    [updateLesson],
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

  const previewHeadings = getHeadingsFromLessonValue(editorValue ?? undefined)

  const scrollToHeading = (heading: { blockId: string; elementId?: string }) => {
    const el =
      (heading.elementId ? document.getElementById(heading.elementId) : null) ??
      document.querySelector(`[data-block-id="${heading.blockId}"]`) ??
      document.getElementById(heading.blockId)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const previewContent = (
    <div className={cn('relative', previewHeadings.length > 0 && 'flex gap-4')}>
      {previewHeadings.length > 0 && (
        <aside
          className="sticky top-24 z-30 w-52 shrink-0 self-start rounded-2xl border bg-card/50 px-4 py-3 backdrop-blur"
          role="navigation"
          aria-label={t('page.headingsNavLabel', { defaultValue: 'On this page' })}
        >
          <Text
            as="p"
            variant="small"
            className="mb-2 font-semibold text-muted-foreground"
          >
            {t('page.headingsNavLabel', { defaultValue: 'On this page' })}
          </Text>
          <nav className="flex flex-col gap-0.5">
            {previewHeadings.map((h) => (
              <button
                key={h.blockId}
                type="button"
                onClick={() => scrollToHeading(h)}
                className={cn(
                  'text-left text-sm text-foreground hover:text-primary hover:underline',
                  h.level === 1 && 'font-semibold',
                  h.level === 2 && 'pl-2 font-medium',
                  h.level === 3 && 'pl-4',
                  h.level === 4 && 'pl-6 text-muted-foreground',
                )}
              >
                {h.text}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <section
        className={cn(
          'min-w-0 flex-1 rounded-2xl border bg-white p-6 animate-in fade-in-0 slide-in-from-bottom-4',
        )}
      >
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

        <div className="mt-4 animate-in fade-in-0 slide-in-from-bottom-4">{lessonHeroBanner}</div>

        {editorValue !== undefined ? (
          <LessonEditor
            key={`lesson-${lessonId}-preview`}
            className="mt-4 rounded-xl border bg-background"
            value={editorValue}
            readOnly
            placeholder={t('page.editorPlaceholder')}
          />
        ) : (
          <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-xl border bg-muted/30">
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
      </section>
    </div>
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
