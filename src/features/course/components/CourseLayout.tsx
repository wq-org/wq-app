import { useState, useEffect } from 'react'
import { useParams, useLocation, Outlet } from 'react-router-dom'
import { LayoutDashboard, Settings } from 'lucide-react'
import AppWrapper from '@/components/layout/AppWrapper'
import { Text } from '@/components/ui/text'
import SelectTabs, { type TabItem } from '@/components/shared/tabs/SelectTabs'
import { useCourse } from '@/contexts/course'
import CourseSettings from '@/features/course/components/CourseSettings'

const COURSE_TABS: TabItem[] = [
  { id: 'overview', icon: LayoutDashboard, title: 'Overview' },
  { id: 'settings', icon: Settings, title: 'Settings' },
]

export default function CourseLayout() {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const { fetchCourseById } = useCourse()
  const [activeTab, setActiveTab] = useState<string>('overview')

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
        <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
          <Text as="p" variant="body" className="text-muted-foreground">
            Course not found
          </Text>
        </div>
      </AppWrapper>
    )
  }

  const contentMaxWidth = isLessonRoute ? 'max-w-6xl' : 'max-w-4xl'

  return (
    <AppWrapper role="teacher">
      <div className={`flex flex-col gap-6 ${contentMaxWidth} mx-auto p-6`}>
        {isLessonRoute ? (
          /* Outlet: renders the matched child route (e.g. Lesson page). Needed so nested routes under this layout show here. */
          <Outlet />
        ) : (
          <>
            <SelectTabs
              tabs={COURSE_TABS}
              activeTabId={activeTab}
              onTabChange={setActiveTab}
              className="border-b"
            />
            <div className="mt-6">
              {activeTab === 'overview' && <Outlet />}
              {activeTab === 'settings' && <CourseSettings courseId={courseId} />}
            </div>
          </>
        )}
      </div>
    </AppWrapper>
  )
}
