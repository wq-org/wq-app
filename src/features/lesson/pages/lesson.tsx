import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FolderSync } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useLesson } from '@/contexts/lesson'
import { showUnsavedChangesToast } from '@/components/shared'
import { AutoImportDrawer } from '../components/AutoImportDrawer'
import { LessonHelpDrawer } from '../components/LessonHelpDrawer'
import { LessonPageSystem } from '../components/LessonPageSystem'
import { LessonPreview } from '../components/LessonPreview'
import { LessonSettings } from '../components/LessonSettings'
import { LessonTabs, type LessonTabId } from '../components/LessonTabs'
import { LessonWorkspaceShell } from '../components/LessonWorkspaceShell'
import { TableOfContentDrawer } from '../components/TableOfContentDrawer'
import type { LessonPage } from '../types/lesson.types'
import { formatLessonMetaTimestamp } from '../utils/formatLessonMetaTimestamp'
import { getHeadingsFromLessonPages } from '../utils/lessonHeadings'
import { scrollToLessonHeading } from '../utils/scrollToLessonHeading'

function normalizeLessonTab(tab?: string): LessonTabId {
  switch (tab) {
    case 'editor':
      return 'editor'
    case 'settings':
      return 'settings'
    case 'analytics':
      return 'analytics'
    case 'preview':
    case 'overview':
      return 'preview'
    default:
      return 'editor'
  }
}

const Lesson = () => {
  const { t, i18n } = useTranslation('features.lesson')
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
  const { lesson, fetchLessonById, createLesson, updateLessonPages } = useLesson()
  const [lessonPages, setLessonPages] = useState<LessonPage[]>([])
  const [isInitialContentLoading, setIsInitialContentLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<LessonTabId>(() =>
    normalizeLessonTab(initialTabFromNav),
  )
  const [isAutoImportOpen, setIsAutoImportOpen] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingTabRef = useRef<LessonTabId | null>(null)

  useEffect(() => {
    if (initialTabFromNav != null) {
      setActiveTab(normalizeLessonTab(initialTabFromNav))
    }
  }, [initialTabFromNav, lessonId])

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    setHasUnsavedChanges(false)
    setLessonPages([])
  }, [lessonId])

  useEffect(() => {
    let cancelled = false

    async function loadLesson() {
      if (!lessonId) {
        setIsInitialContentLoading(false)
        return
      }

      setLessonPages([])
      setIsInitialContentLoading(true)

      if (draftLessonTitle && draftLessonTopicId) {
        try {
          const newLesson = await createLesson({
            title: draftLessonTitle,
            content: '',
            description: draftLessonDescription || '',
            topic_id: draftLessonTopicId,
          })

          if (!cancelled) {
            const nextPath = courseId
              ? `/teacher/course/${courseId}/lesson/${newLesson.id}`
              : `/teacher/lesson/${newLesson.id}`
            navigate(nextPath, { replace: true })
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
          setLessonPages(fetchedLesson.pages)
          setHasUnsavedChanges(false)
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error)
          setLessonPages([])
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
    courseId,
    createLesson,
    draftLessonDescription,
    draftLessonTitle,
    draftLessonTopicId,
    fetchLessonById,
    lessonId,
    navigate,
  ])

  useEffect(() => {
    if (!lesson || lesson.id !== lessonId) return
    if (hasUnsavedChanges) return
    setLessonPages(lesson.pages)
    setHasUnsavedChanges(false)
  }, [lesson, lessonId, hasUnsavedChanges])

  const savePagesNow = useCallback(
    async (pagesOverride?: LessonPage[]) => {
      if (!lessonId) return

      const pagesToSave = pagesOverride ?? lessonPages

      try {
        await updateLessonPages(pagesToSave, lessonId)
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error(error)
      }
    },
    [lessonId, lessonPages, updateLessonPages],
  )

  const handlePagesChange = useCallback(
    (nextPages: LessonPage[]) => {
      if (!lessonId) return

      setLessonPages(nextPages)
      setHasUnsavedChanges(true)

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }

      saveTimerRef.current = setTimeout(() => {
        void savePagesNow(nextPages)
      }, 1500)
    },
    [lessonId, savePagesNow],
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
    const anyUnsavedChanges = hasUnsavedChanges || hasUnsavedSettingsChanges
    if (!anyUnsavedChanges) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
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
  const lessonDescription = lesson?.description?.trim() || t('page.fallbackDescription')
  const updatedText =
    formatLessonMetaTimestamp(lesson?.updated_at, lesson?.created_at, i18n.language) ??
    t('page.meta.unavailable')
  const lessonHeadings = getHeadingsFromLessonPages(lessonPages)

  const lessonTabs = (
    <LessonTabs
      activeTabId={activeTab}
      onTabChange={handleTabChange}
      className="border-b"
    />
  )

  const resolvedFirstPage = lessonPages[0] ?? null

  const lessonActions = (
    <>
      <TableOfContentDrawer
        headings={lessonHeadings}
        loading={isInitialContentLoading}
        triggerLabel={t('page.actions.tableOfContents')}
        title={t('page.drawers.tableOfContents.title')}
        description={t('page.drawers.tableOfContents.description')}
        emptyLabel={t('page.drawers.tableOfContents.empty')}
        closeLabel={t('page.drawers.closeLabel')}
        onHeadingSelect={scrollToLessonHeading}
      />
      <Button
        type="button"
        variant="darkblue"
        className="w-full justify-start bg-card/80 backdrop-blur sm:w-auto lg:w-full"
        onClick={() => setIsAutoImportOpen(true)}
      >
        <FolderSync className="h-4 w-4" />
        {t('page.actions.autoImport')}
      </Button>
      {resolvedFirstPage && (
        <AutoImportDrawer
          isOpen={isAutoImportOpen}
          onClose={() => setIsAutoImportOpen(false)}
          lessonId={lessonId}
          pageId={resolvedFirstPage.id}
          currentContent={resolvedFirstPage.content}
          onPagesChange={handlePagesChange}
          lessonPages={lessonPages}
        />
      )}
      <LessonHelpDrawer
        triggerLabel={t('page.actions.help')}
        title={t('page.help.title')}
        description={t('page.help.description')}
        closeLabel={t('page.drawers.closeLabel')}
      />
    </>
  )

  if (activeTab === 'editor' || activeTab === 'preview') {
    return (
      <LessonWorkspaceShell
        tabs={lessonTabs}
        title={lessonTitle}
        description={lessonDescription}
        updatedLabel={t('page.meta.lastUpdatedLabel')}
        updatedValue={updatedText}
        filesLabel={t('page.meta.noFilesLinked')}
        actions={lessonActions}
      >
        {activeTab === 'editor' ? (
          <LessonPageSystem
            mode="edit"
            pages={lessonPages}
            loading={isInitialContentLoading}
            loadingLabel={t('layout.loading')}
            onPagesChange={handlePagesChange}
            pageBreakLabel={t('page.pageBreakLabel')}
            placeholder={t('page.editorPlaceholder')}
          />
        ) : (
          <LessonPreview
            pages={lessonPages}
            loading={isInitialContentLoading}
            loadingLabel={t('layout.loading')}
            editorPlaceholder={t('page.editorPlaceholder')}
            pageBreakLabel={t('page.pageBreakLabel')}
          />
        )}
      </LessonWorkspaceShell>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {lessonTabs}
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
    </div>
  )
}

export { Lesson }
