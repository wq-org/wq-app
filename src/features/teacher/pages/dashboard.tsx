import { AppShell } from '@/components/layout'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import { DashboardSection } from '@/features/dashboard'
import { Clock, CalendarDays, LampDesk, ListTodo, SplinePointer, BookOpen } from 'lucide-react'
const Dashboard = () => {
  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8"
    >
      <div className="flex w-full justify-center">
        <QuoteOfTheDay />
      </div>
      <main className="container flex flex-col gap-12 pb-40">
        <div className="flex gap-12 w-full">
          <DashboardSection
            title="Recently Visited"
            icon={Clock}
            classNameContainer="h-35"
          >
            <p>content</p>
          </DashboardSection>
          <DashboardSection
            title="Classrooms"
            icon={LampDesk}
            classNameContainer="h-35"
          >
            <p>content</p>
          </DashboardSection>
        </div>

        <div className="flex gap-12 w-full">
          <DashboardSection
            title="Schedule"
            classNameContainer="h-55.5"
            icon={CalendarDays}
          >
            <p>content</p>
          </DashboardSection>
        </div>
        <DashboardSection
          title="Course"
          classNameContainer="h-55.5"
          icon={BookOpen}
        >
          <p>content</p>
        </DashboardSection>

        <div className="flex gap-12 w-full">
          <DashboardSection
            title="Game Studio"
            classNameContainer="h-55.5"
            icon={SplinePointer}
          >
            <p>content</p>
          </DashboardSection>
          <DashboardSection
            title="Tasks"
            classNameContainer="h-55.5"
            icon={ListTodo}
          >
            <p>content</p>
          </DashboardSection>
        </div>
      </main>
    </AppShell>
  )
}

export { Dashboard }
