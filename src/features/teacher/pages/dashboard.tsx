import { useState } from 'react'
import { AppShell } from '@/components/layout'
import { SelectTabs } from '@/components/shared'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import { DashboardSection } from '@/features/dashboard'
import {
  BookOpen,
  Calendar,
  Calendar1,
  CalendarDays,
  // Clock,
  LampDesk,
  ListTodo,
  SplinePointer,
} from 'lucide-react'

const CLASSROOM_TABS = [
  { id: 'all', title: 'All', icon: CalendarDays },
  { id: 'rolex-design', title: 'Rolex Design', icon: Calendar1 },
] as const

const Dashboard = () => {
  const [activeClassroomTabId, setActiveClassroomTabId] = useState<string>(CLASSROOM_TABS[0].id)

  const handleClassroomTabChange = (tabId: string) => {
    setActiveClassroomTabId(tabId)
  }

  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8"
    >
      <div className="flex w-full justify-center">
        <QuoteOfTheDay />
      </div>
      <main className="container flex flex-col gap-11 pb-40">
        <div className="flex gap-8 w-full">
          {/* <DashboardSection
            title="Recently Visited"
            icon={Clock}
            classNameContainer="h-35"
          >
            <p>content</p>
          </DashboardSection> */}
          <DashboardSection
            title="Classrooms"
            icon={LampDesk}
            classNameContainer="h-35"
          >
            <p>content</p>
          </DashboardSection>
        </div>

        <div className="flex gap-8 w-full">
          <DashboardSection
            title="Schedule"
            classNameContainer="h-55.5"
            icon={Calendar}
          >
            <SelectTabs
              variant="compact"
              tabs={CLASSROOM_TABS}
              activeTabId={activeClassroomTabId}
              onTabChange={handleClassroomTabChange}
            />
            {CLASSROOM_TABS.map((tab) => (
              <div
                key={tab.id}
                className={
                  tab.id === activeClassroomTabId
                    ? 'mt-3 rounded-xl border border-dashed border-border/70 p-3'
                    : 'hidden'
                }
              >
                <p className="text-sm text-muted-foreground">{tab.title} dummy title</p>
              </div>
            ))}
          </DashboardSection>
        </div>

        <div className="flex gap-8 w-full">
          <DashboardSection
            title="Courses"
            classNameContainer="h-55.5"
            icon={BookOpen}
          >
            <p>content</p>
          </DashboardSection>
          <DashboardSection
            title="Game Studio"
            classNameContainer="h-55.5"
            icon={SplinePointer}
          >
            <p>content</p>
          </DashboardSection>
        </div>
        <DashboardSection
          title="Tasks"
          classNameContainer="h-55.5"
          icon={ListTodo}
        >
          <p>content</p>
        </DashboardSection>
      </main>
    </AppShell>
  )
}

export { Dashboard }
