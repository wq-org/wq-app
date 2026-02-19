import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation, Outlet } from 'react-router-dom'
import { LayoutDashboard, Settings } from 'lucide-react'
import AppWrapper from '@/components/layout/AppWrapper'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import SelectTabs, { type TabItem } from '@/components/shared/tabs/SelectTabs'
import { useCourse } from '@/contexts/course'
import CourseSettings from '@/features/course/components/CourseSettings'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function CourseLayout() {
  const { t } = useTranslation('features.course')
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const { fetchCourseById } = useCourse()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const pendingTabRef = useRef<string | null>(null)
  const courseTabs: TabItem[] = [
    { id: 'overview', icon: LayoutDashboard, title: t('layout.tabs.overview') },
    { id: 'settings', icon: Settings, title: t('layout.tabs.settings') },
  ]

  const handleTabChange = useCallback(
    (requestedTab: string) => {
      if (requestedTab === activeTab) return
      // Only show "Trotzdem fortfahren" when user changed settings (title/description) and tries to switch tab
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

  // Child route under this layout (e.g. course overview or lesson) is rendered here.
  const isLessonRoute = /\/lesson\/[^/]+$/.test(location.pathname)

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
        {isLessonRoute ? (
          /* Outlet: renders the matched child route (e.g. Lesson page). Needed so nested routes under this layout show here. */
          <Outlet />
        ) : (
          <>
            <SelectTabs
              tabs={courseTabs}
              activeTabId={activeTab}
              onTabChange={handleTabChange}
              className="border-b"
            />
            <div className="mt-6">
              {activeTab === 'overview' && <Outlet />}
              {activeTab === 'settings' && (
                <CourseSettings
                  courseId={courseId}
                  onUnsavedChange={setHasUnsavedChanges}
                />
              )}
            </div>
          </>
        )}
      </div>
    </AppWrapper>
  )
}
