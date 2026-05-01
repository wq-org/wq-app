import { useState } from 'react'
import { AppShell } from '@/components/layout'
import { SelectTabs, SelectTabsContent } from '@/components/shared'
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

import { ClassroomCardList } from '@/features/classroom'

const CLASSROOM_TABS = [
  { id: 'all', title: 'All', icon: CalendarDays },
  { id: 'rolex-design', title: 'Rolex Design', icon: Calendar1 },
] as const

const DUMMY_TEACHER_CLASSROOM_CARDS = [
  { id: 'c1', icon: LampDesk, name: 'Rolex Design', studentCount: 30 },
  { id: 'c2', icon: BookOpen, name: 'Mechanics 101', studentCount: 18 },
  { id: 'c3', icon: SplinePointer, name: 'Studio Lab', studentCount: 12 },
  { id: 'c4', icon: ListTodo, name: 'Capstone', studentCount: 24 },
  { id: 'c5', icon: BookOpen, name: 'Materials Lab', studentCount: 16 },
  { id: 'c6', icon: LampDesk, name: 'Studio critique', studentCount: 20 },
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
          <DashboardSection
            title="Classrooms"
            icon={LampDesk}
            classNameContainer="px-4"
          >
            <ClassroomCardList items={DUMMY_TEACHER_CLASSROOM_CARDS} />
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
              <SelectTabsContent
                key={tab.id}
                tabId={tab.id}
                activeTabId={activeClassroomTabId}
              >
                <p className="text-sm text-muted-foreground">{tab.title} dummy title</p>
              </SelectTabsContent>
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
