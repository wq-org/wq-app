import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppShell } from '@/components/layout'
import { SelectTabs, SelectTabsContent, type TabItem } from '@/components/shared'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import { CourseCardList, type CourseCardProps } from '@/features/course'
import { DashboardSection } from '@/features/dashboard'
import { GameProjectCardList, type GameProjectCardListProps } from '@/features/game-studio'
import { TeacherClassroomsEmpty } from '../components/TeacherClassroomsEmpty'
import { TeacherCoursesEmpty } from '../components/TeacherCoursesEmpty'
import {
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  Calendar,
  DraftingCompass,
  Joystick,
  LampDesk,
  LibraryBig,
  ListTodo,
  SplinePointer,
} from 'lucide-react'

import { ClassroomCardList, type ClassroomCardListItem } from '@/features/classroom'

/** Demo classrooms until teacher classrooms API is wired; swap for fetched rows. */
const DUMMY_TEACHER_CLASSROOM_CARDS: readonly ClassroomCardListItem[] = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    icon: LampDesk,
    name: 'Rolex Design Studio',
    studentCount: 24,
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    icon: BookOpen,
    name: 'Mechanics 101',
    studentCount: 18,
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    icon: SplinePointer,
    name: 'Game Studio Lab',
    studentCount: 12,
  },
  {
    id: '00000000-0000-4000-8000-000000000104',
    icon: ListTodo,
    name: 'Capstone Critique',
    studentCount: 20,
  },
  {
    id: '00000000-0000-4000-8000-000000000105',
    icon: LampDesk,
    name: 'Materials Workshop',
    studentCount: 16,
  },
  {
    id: '00000000-0000-4000-8000-000000000106',
    icon: BookOpen,
    name: 'Sketch & Render',
    studentCount: 22,
  },
]

/** Demo courses for dashboard layout until teacher dashboard loads real rows from the API. */
const DUMMY_TEACHER_COURSE_CARDS: readonly CourseCardProps[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Introduction to Design',
    description: 'Foundations of visual composition and short weekly exercises.',
    is_published: true,
    themeId: 'blue',
    teacherInitials: 'JD',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    title: 'Mechanics Lab',
    description: 'Hands-on prototypes and materials exploration.',
    is_published: true,
    themeId: 'teal',
    teacherInitials: 'JD',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    title: 'Capstone Studio',
    description: 'Final project workspace — draft brief and milestones.',
    is_published: false,
    themeId: 'violet',
    teacherInitials: 'JD',
  },
]

const COURSE_FILTER_TABS = [
  { id: 'all', title: 'All', icon: LibraryBig },
  { id: 'published', title: 'Published', icon: BookOpenCheck },
  { id: 'drafts', title: 'Drafts', icon: BookOpenText },
] as const satisfies readonly TabItem[]

/** Demo flow games for dashboard until teacher dashboard loads studio rows from the API. */
const DUMMY_TEACHER_GAME_PROJECTS: GameProjectCardListProps['projects'] = [
  {
    id: '00000000-0000-4000-8000-000000000201',
    title: 'Branching wellness quest',
    description: 'If/else flow with two endings and a short score recap.',
    themeId: 'cyan',
    version: 3,
    status: 'published',
  },
  {
    id: '00000000-0000-4000-8000-000000000202',
    title: 'Image pin lab',
    description: 'Draft: image-pin nodes and placeholder assets.',
    themeId: 'orange',
    version: 1,
    status: 'draft',
  },
  {
    id: '00000000-0000-4000-8000-000000000203',
    title: 'Paragraph line select',
    description: 'Published reading activity with line highlights.',
    themeId: 'green',
    version: 2,
    status: 'published',
  },
]

const GAME_FILTER_TABS = [
  { id: 'all', title: 'All', icon: SplinePointer },
  { id: 'published', title: 'Published', icon: Joystick },
  { id: 'drafts', title: 'Drafts', icon: DraftingCompass },
] as const satisfies readonly TabItem[]

const Dashboard = () => {
  const navigate = useNavigate()
  const [activeCourseTabId, setActiveCourseTabId] = useState<string>(COURSE_FILTER_TABS[0].id)
  const [activeGameTabId, setActiveGameTabId] = useState<string>(GAME_FILTER_TABS[0].id)

  const coursesByFilterTab = useMemo(() => {
    const all = DUMMY_TEACHER_COURSE_CARDS
    return {
      all: [...all],
      published: all.filter((c) => c.is_published),
      drafts: all.filter((c) => !c.is_published),
    } as const
  }, [])

  const gamesByFilterTab = useMemo(() => {
    const all = DUMMY_TEACHER_GAME_PROJECTS
    return {
      all: [...all],
      published: all.filter((g) => g.status === 'published'),
      drafts: all.filter((g) => g.status === 'draft'),
    } as const
  }, [])

  const handleCourseView = (id: string) => {
    navigate(`/teacher/course/${id}`)
  }

  const handleGameOpen = (id: string) => {
    navigate(`/teacher/canvas/${id}`)
  }

  const handleCourseTabChange = (tabId: string) => {
    setActiveCourseTabId(tabId)
  }

  const handleGameTabChange = (tabId: string) => {
    setActiveGameTabId(tabId)
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
            {DUMMY_TEACHER_CLASSROOM_CARDS.length === 0 ? (
              <TeacherClassroomsEmpty />
            ) : (
              <ClassroomCardList items={DUMMY_TEACHER_CLASSROOM_CARDS} />
            )}
          </DashboardSection>
        </div>

        <div className="flex gap-8 w-full">
          <DashboardSection
            title="Schedule"
            classNameContainer="h-55.5"
            icon={Calendar}
            showExpandButton
          >
            <p className="text-sm text-muted-foreground">Schedule content placeholder.</p>
          </DashboardSection>
        </div>

        <div className="flex w-full min-w-0 gap-8">
          <div className="min-w-0 flex-1 basis-0">
            <DashboardSection
              title="Courses"
              showExpandButton
              classNameContainer="h-55.5 max-h-80 min-h-0"
              icon={BookOpen}
            >
              {DUMMY_TEACHER_COURSE_CARDS.length === 0 ? (
                <TeacherCoursesEmpty />
              ) : (
                <>
                  <SelectTabs
                    variant="compact"
                    tabs={COURSE_FILTER_TABS}
                    activeTabId={activeCourseTabId}
                    onTabChange={handleCourseTabChange}
                  />
                  {COURSE_FILTER_TABS.map((tab) => {
                    const courses =
                      tab.id === 'all'
                        ? coursesByFilterTab.all
                        : tab.id === 'published'
                          ? coursesByFilterTab.published
                          : coursesByFilterTab.drafts

                    return (
                      <SelectTabsContent
                        key={tab.id}
                        tabId={tab.id}
                        activeTabId={activeCourseTabId}
                        className="mt-2 min-h-0 px-0"
                      >
                        {courses.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No courses match this filter.
                          </p>
                        ) : (
                          <CourseCardList
                            variant="compact"
                            courses={courses}
                            onCourseView={handleCourseView}
                            className="gap-2"
                          />
                        )}
                      </SelectTabsContent>
                    )
                  })}
                </>
              )}
            </DashboardSection>
          </div>
          <div className="min-w-0 flex-1 basis-0">
            <DashboardSection
              title="Game Studio"
              classNameContainer="h-55.5 max-h-80 min-h-0"
              icon={SplinePointer}
              showExpandButton
            >
              {DUMMY_TEACHER_GAME_PROJECTS.length === 0 ? (
                <p className="text-sm text-muted-foreground">No games yet.</p>
              ) : (
                <>
                  <SelectTabs
                    variant="compact"
                    tabs={GAME_FILTER_TABS}
                    activeTabId={activeGameTabId}
                    onTabChange={handleGameTabChange}
                  />
                  {GAME_FILTER_TABS.map((tab) => {
                    const games =
                      tab.id === 'all'
                        ? gamesByFilterTab.all
                        : tab.id === 'published'
                          ? gamesByFilterTab.published
                          : gamesByFilterTab.drafts

                    return (
                      <SelectTabsContent
                        key={tab.id}
                        tabId={tab.id}
                        activeTabId={activeGameTabId}
                        className="mt-2 min-h-0 px-0"
                      >
                        {games.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No games match this filter.
                          </p>
                        ) : (
                          <GameProjectCardList
                            variant="compact"
                            projects={games}
                            onOpen={handleGameOpen}
                            className="gap-2"
                          />
                        )}
                      </SelectTabsContent>
                    )
                  })}
                </>
              )}
            </DashboardSection>
          </div>
        </div>
        <DashboardSection
          title="Tasks"
          showExpandButton
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
