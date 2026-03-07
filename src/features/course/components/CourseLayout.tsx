import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom'
import AppWrapper from '@/components/layout/AppWrapper'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useCourse } from '@/contexts/course'
import CourseSettings from '@/features/course/components/CourseSettings'
import CoursePreviewTab from '@/features/course/components/CoursePreviewTab'
import { FeatureWorkspaceLayout, type WorkspaceTabId } from '@/components/shared/workspace'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function CourseLayout() {
  const { t } = useTranslation('features.course')
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { fetchCourseById, selectedCourse } = useCourse()
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('editor')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const pendingTabRef = useRef<WorkspaceTabId | null>(null)

  const handleTabChange = useCallback(
    (requestedTab: WorkspaceTabId) => {
      if (requestedTab === activeTab) return
      if (hasUnsavedChanges) {
        pendingTabRef.current = requestedTab
        toast.custom(
          (id) => (
            <div className="flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-md">
              <Text
                as="p"
                variant="body"
                className="font-semibold"
              >
                {t('layout.unsavedChanges.title')}
              </Text>
              <Text
                as="p"
                variant="small"
                className="text-muted-foreground"
              >
                {t('layout.unsavedChanges.description')}
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
                  {t('layout.unsavedChanges.stay')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const tab = pendingTabRef.current
                    pendingTabRef.current = null
                    setHasUnsavedChanges(false)
                    toast.dismiss(id)
                    if (tab) setActiveTab(tab)
                  }}
                >
                  {t('layout.unsavedChanges.continueAnyway')}
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
    [activeTab, hasUnsavedChanges, t],
  )

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasUnsavedChanges])

  // Child routes under this layout (e.g. topic or lesson pages) are rendered directly.
  const isNestedContentRoute = /\/(topic|lesson)\/[^/]+\/?$/.test(location.pathname)

  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId)
    }
  }, [courseId, fetchCourseById])

  if (!courseId) {
    return (
      <AppWrapper role="teacher">
        <div className="flex flex-col gap-6 w-full mx-auto p-6">
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {t('page.notFound')}
          </Text>
        </div>
      </AppWrapper>
    )
  }

  return (
    <AppWrapper role="teacher">
      <div className="flex flex-col gap-6 w-full mx-auto p-6">
        {isNestedContentRoute ? (
          // Nested content routes (topic and lesson) provide their own workspace layouts.
          <Outlet />
        ) : (
          <FeatureWorkspaceLayout
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabTitles={{
              editor: t('layout.tabs.editor', { defaultValue: 'Editor' }),
              overview: t('layout.tabs.preview', { defaultValue: 'Preview' }),
              settings: t('layout.tabs.settings', { defaultValue: 'Settings' }),
              analytics: t('layout.tabs.analytics', { defaultValue: 'Analytics' }),
            }}
            editorContent={<Outlet />}
            overviewContent={
              <CoursePreviewTab
                courseId={courseId}
                themeId={selectedCourse?.theme_id}
                onTopicView={(topicId) => navigate(`/teacher/course/${courseId}/topic/${topicId}`)}
              />
            }
            settingsContent={
              <CourseSettings
                courseId={courseId}
                onUnsavedChange={setHasUnsavedChanges}
              />
            }
            analyticsContent={<div className="flex flex-col gap-6 pb-32" />}
          />
        )}
      </div>
    </AppWrapper>
  )
}
