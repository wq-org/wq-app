import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import { useCourse } from '@/contexts/course'
import { LessonLayout } from '@/features/lesson'
import { LessonPreview } from '@/features/lesson'
import { LessonSettings } from '@/features/lesson'
import { LessonEditor } from '@/features/lesson'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { createYooptaStarterContentJson, createYooptaStarterContentObject } from '@/features/course'
import { showUnsavedChangesToast } from '@/components/shared'
import type { LessonTabId } from '@/features/lesson'
import { LessonHeroBannerSection } from '../components/LessonHeroBannerSection'
import { LessonGuidePopoverSection } from '../components/LessonGuidePopoverSection'
import { LESSON_GUIDES, type LessonGuideValue } from '../constants/lessonGuides'

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

function normalizeLessonTab(tab?: string): LessonTabId {
  switch (tab) {
    case 'editor':
      return 'editor'
    case 'settings':
      return 'settings'
    case 'analytics':
      return 'analytics'
    case 'preview':
      return 'preview'
    case 'overview':
      return 'preview'
    default:
      return 'editor'
  }
}

export function Lesson() {
  const { t } = useTranslation('features.lesson')
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const navState = location.state as {
    initialTab?: 'editor' | 'preview' | 'overview' | 'settings' | 'analytics'
    title?: string
    description?: string
    topicId?: string
  } | null
  const initialTabFromNav = navState?.initialTab
  const draftLessonTitle = typeof navState?.title === 'string' ? navState.title : undefined
  const draftLessonDescription =
    typeof navState?.description === 'string' ? navState.description : undefined
  const draftLessonTopicId = typeof navState?.topicId === 'string' ? navState.topicId : undefined
  const { lesson, fetchLessonById, createLesson, updateLesson } = useLesson()
  const { selectedCourse, fetchCourseById } = useCourse()
  const [editorValue, setEditorValue] = useState<Record<string, unknown> | undefined>(undefined)
  const [isInitialContentLoading, setIsInitialContentLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<LessonTabId>(() =>
    normalizeLessonTab(initialTabFromNav),
  )
  const [selectedGuide, setSelectedGuide] = useState<LessonGuideValue>(LESSON_GUIDES[0].value)

  useEffect(() => {
    if (initialTabFromNav != null) {
      setActiveTab(normalizeLessonTab(initialTabFromNav))
    }
  }, [lessonId, initialTabFromNav])
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingTabRef = useRef<LessonTabId | null>(null)

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

      if (draftLessonTitle && draftLessonTopicId) {
        try {
          const newLesson = await createLesson({
            title: draftLessonTitle,
            content: createYooptaStarterContentJson(),
            description: draftLessonDescription || '',
            topic_id: draftLessonTopicId,
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
          setEditorValue(parseContent(fetchedLesson.content) ?? createYooptaStarterContentObject())
          setHasUnsavedChanges(false)
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error)
          setEditorValue(createYooptaStarterContentObject())
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
  }, [
    lessonId,
    courseId,
    draftLessonTitle,
    draftLessonDescription,
    draftLessonTopicId,
    fetchLessonById,
    createLesson,
    navigate,
  ])

  useEffect(() => {
    if (!lesson || lesson.id !== lessonId) return
    setEditorValue(parseContent(lesson.content) ?? createYooptaStarterContentObject())
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
    (requestedTab: LessonTabId) => {
      if (requestedTab === activeTab) return
      const isLeavingSettingsWithUnsavedChanges =
        activeTab === 'settings' && requestedTab !== 'settings' && hasUnsavedSettingsChanges

      if (isLeavingSettingsWithUnsavedChanges) {
        pendingTabRef.current = requestedTab
        showUnsavedChangesToast({
          t,
          onStay: () => {
            pendingTabRef.current = null
          },
          onContinue: () => {
            const tab = pendingTabRef.current
            pendingTabRef.current = null
            setHasUnsavedSettingsChanges(false)
            if (tab) setActiveTab(tab)
          },
        })
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

  const editorContent = (
    <div className="relative flex flex-col gap-6">
      <div className="animate-in fade-in-0 slide-in-from-bottom-4">
        <LessonHeroBannerSection
          title={lessonTitle}
          description={lessonDescription}
          themeId={selectedCourse?.theme_id}
        />
      </div>

      <LessonGuidePopoverSection
        guides={LESSON_GUIDES}
        selectedGuide={selectedGuide}
        onSelectGuide={(value) => setSelectedGuide(value as LessonGuideValue)}
        helpLabel={t('page.helpLabel', { defaultValue: 'Help' })}
      />

      {!isInitialContentLoading ? (
        <LessonEditor
          key={`lesson-${lessonId}`}
          className="w-full flex-1 rounded-2xl border border-border bg-card animate-in fade-in-0 slide-in-from-bottom-4"
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

  const previewTabContent = (
    <LessonPreview
      title={lessonTitle}
      description={lessonDescription}
      value={editorValue}
      loading={isInitialContentLoading}
      previewTitle={t('page.previewTitle', { defaultValue: 'Preview' })}
      previewHint={t('page.previewHint', {
        defaultValue: 'Read-only preview of the lesson content.',
      })}
      headingsNavLabel={t('page.headingsNavLabel', { defaultValue: 'On this page' })}
      loadingLabel={t('layout.loading')}
      editorPlaceholder={t('page.editorPlaceholder')}
      themeId={selectedCourse?.theme_id}
      guides={LESSON_GUIDES}
      selectedGuide={selectedGuide}
      onGuideChange={(value) => setSelectedGuide(value as LessonGuideValue)}
      helpLabel={t('page.helpLabel', { defaultValue: 'Help' })}
    />
  )

  return (
    <LessonLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === 'editor' ? editorContent : null}
      {activeTab === 'preview' ? previewTabContent : null}
      {activeTab === 'settings' ? (
        <LessonSettings
          lessonId={lessonId}
          courseId={courseId}
          onUnsavedChange={setHasUnsavedSettingsChanges}
        />
      ) : null}
      {activeTab === 'analytics' ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <Text
            as="h3"
            variant="h3"
          >
            {t('layout.tabs.analytics', { defaultValue: 'Analytics' })}
          </Text>
          <Text
            as="p"
            variant="body"
            className="mt-2 text-muted-foreground"
          >
            Lesson analytics will be available soon.
          </Text>
        </div>
      ) : null}
    </LessonLayout>
  )
}
