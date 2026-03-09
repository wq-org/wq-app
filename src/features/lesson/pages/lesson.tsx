import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import { useCourse } from '@/contexts/course'
import { LessonLayout } from '@/features/lesson'
import { LessonPreviewTab } from '@/features/lesson'
import { LessonSettings } from '@/features/lesson'
import { LessonEditor } from '@/features/lesson'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'
import { getThemeBackgroundStyle, getThemeDescriptionStyle, getThemeTitleStyle } from '@/lib/themes'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MessageCircleQuestionMark } from 'lucide-react'
import type { WorkspaceTabId } from '@/components/shared/layout'
import { createYooptaStarterContentJson, createYooptaStarterContentObject } from '@/features/course'

const LESSON_GUIDES = [
  {
    value: 'learning-goal',
    label: 'Learning Goal',
    description:
      'Click inside the text editor first, then start with one or two sentences that explain what the learner should understand or be able to do by the end of this lesson.',
  },
  {
    value: 'section-structure',
    label: 'Section Structure',
    description:
      'Click inside the text editor first, then break the lesson into short sections with clear headings so students can scan and return to key ideas easily.',
  },
  {
    value: 'concrete-example',
    label: 'Concrete Example',
    description:
      'Click inside the text editor first, then add one practical example, scenario, or demonstration that makes the main concept easier to apply.',
  },
  {
    value: 'wrap-up',
    label: 'Wrap Up',
    description:
      'Click inside the text editor first, then end with a short recap, reflection prompt, or quick check so students can confirm what they learned.',
  },
] as const

type LessonGuideValue = (typeof LESSON_GUIDES)[number]['value']

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

function normalizeLessonTab(tab?: string): WorkspaceTabId {
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

export default function Lesson() {
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
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>(() =>
    normalizeLessonTab(initialTabFromNav),
  )
  const [selectedGuide, setSelectedGuide] = useState<LessonGuideValue>(LESSON_GUIDES[0].value)

  useEffect(() => {
    if (initialTabFromNav != null) {
      setActiveTab(normalizeLessonTab(initialTabFromNav))
    }
  }, [lessonId, initialTabFromNav])
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingTabRef = useRef<WorkspaceTabId | null>(null)

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
    (requestedTab: WorkspaceTabId) => {
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

  const activeGuide =
    LESSON_GUIDES.find((guide) => guide.value === selectedGuide) ?? LESSON_GUIDES[0]

  const editorContent = (
    <div className="relative flex flex-col gap-6">
      <div className="animate-in fade-in-0 slide-in-from-bottom-4">{lessonHeroBanner}</div>

      <div className="flex flex-col items-end gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="rounded-full bg-white px-4 shadow-sm"
            >
              <MessageCircleQuestionMark className="size-4" />
              <Text
                as="span"
                variant="body"
              >
                Help
              </Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-full max-w-md rounded-2xl border bg-white/85 p-4 shadow-lg backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {LESSON_GUIDES.map((guide) => (
                  <Button
                    key={guide.value}
                    type="button"
                    variant={selectedGuide === guide.value ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setSelectedGuide(guide.value)}
                  >
                    {guide.label}
                  </Button>
                ))}
              </div>
              <div className="rounded-2xl border bg-white/70 p-4 text-left">
                <Text
                  as="p"
                  variant="small"
                  className="font-semibold text-foreground"
                >
                  {activeGuide.label}
                </Text>
                <Text
                  as="p"
                  variant="small"
                  className="mt-2 leading-6 text-muted-foreground"
                >
                  {activeGuide.description}
                </Text>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {!isInitialContentLoading ? (
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

  const previewTabContent = (
    <LessonPreviewTab
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
    />
  )

  return (
    <LessonLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      editorContent={editorContent}
      previewContent={previewTabContent}
      settingsContent={
        <LessonSettings
          lessonId={lessonId}
          courseId={courseId}
          onUnsavedChange={setHasUnsavedSettingsChanges}
        />
      }
      analyticsContent={
        <div className="rounded-2xl border bg-white p-6">
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
      }
    />
  )
}
