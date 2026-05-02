import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppShell } from '@/components/layout'
import { LoadingPage, SelectTabs, SelectTabsContent, type TabItem } from '@/components/shared'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import { CourseCardList, useCourses, type CourseCardProps } from '@/features/course'
import { DashboardSection } from '@/features/dashboard'
import { GameProjectCardList, type GameProjectCardListProps } from '@/features/game-studio'
import { useUser } from '@/contexts/user'
import { TeacherClassroomsEmpty } from '../components/TeacherClassroomsEmpty'
import { TeacherCoursesEmpty } from '../components/TeacherCoursesEmpty'
import {
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  Calendar,
  Calendar1,
  CalendarDays,
  DraftingCompass,
  Joystick,
  LampDesk,
  LayoutList,
  LibraryBig,
  ListChecks,
  ListTodo,
  SplinePointer,
} from 'lucide-react'

import {
  ClassroomCardList,
  type ClassroomCardListItem,
  useTeacherClassrooms,
} from '@/features/classroom'

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

const TASK_FILTER_TABS = [
  { id: 'all', title: 'All', icon: ListTodo },
  { id: 'published', title: 'Published', icon: ListChecks },
  { id: 'drafts', title: 'Drafts', icon: LayoutList },
] as const satisfies readonly TabItem[]

/** Demo tasks until the teacher dashboard loads task rows from the API. */
const DUMMY_TEACHER_TASKS = [
  {
    id: '00000000-0000-4000-8000-000000000301',
    title: 'Review consent forms',
    status: 'draft' as const,
  },
  {
    id: '00000000-0000-4000-8000-000000000302',
    title: 'Grade midterm reflections',
    status: 'published' as const,
  },
  {
    id: '00000000-0000-4000-8000-000000000303',
    title: 'Prepare wellness check-in slides',
    status: 'draft' as const,
  },
]

const Dashboard = () => {
  const { t } = useTranslation('features.teacher')
  const navigate = useNavigate()
  const { profile } = useUser()
  const fetchEnabled = Boolean(profile?.user_id)

  const {
    rows: teacherClassrooms,
    loading: classroomsLoading,
    error: classroomsError,
  } = useTeacherClassrooms(fetchEnabled)
  const { courses, loading: coursesLoading, error: coursesError, fetchCourses } = useCourses()

  const [activeCourseTabId, setActiveCourseTabId] = useState<string>(COURSE_FILTER_TABS[0].id)
  const [activeGameTabId, setActiveGameTabId] = useState<string>(GAME_FILTER_TABS[0].id)
  const [activeScheduleTabId, setActiveScheduleTabId] = useState<string>('all')
  const [activeTaskTabId, setActiveTaskTabId] = useState<string>(TASK_FILTER_TABS[0].id)

  useEffect(() => {
    if (!profile?.user_id) return
    void fetchCourses()
  }, [profile?.user_id, fetchCourses])

  useEffect(() => {
    if (classroomsError) {
      toast.error(t('dashboard.classroomsLoadError'))
    }
  }, [classroomsError, t])

  useEffect(() => {
    if (coursesError) {
      toast.error(t('dashboard.coursesLoadError'))
    }
  }, [coursesError, t])

  const classroomTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const row of teacherClassrooms) {
      map.set(row.id, row.title)
    }
    return map
  }, [teacherClassrooms])

  const handleClassroomView = useCallback(
    (classroomId: string) => {
      navigate(`/teacher/dashboard/classroom/${classroomId}`, {
        state: { name: classroomTitleById.get(classroomId) },
      })
    },
    [navigate, classroomTitleById],
  )

  const classroomCardItems: readonly ClassroomCardListItem[] = useMemo(
    () =>
      teacherClassrooms.map((row) => ({
        id: row.id,
        name: row.title,
        studentCount: row.studentCount,
        icon: LampDesk,
      })),
    [teacherClassrooms],
  )

  const scheduleScopeTabs: TabItem[] = useMemo(() => {
    const allTab: TabItem = {
      id: 'all',
      title: t('dashboard.scheduleTabs.all'),
      icon: CalendarDays,
    }
    const perClassroom: TabItem[] = teacherClassrooms.map((row) => ({
      id: row.id,
      title: row.title,
      icon: Calendar1,
    }))
    return [allTab, ...perClassroom]
  }, [teacherClassrooms, t])

  useEffect(() => {
    if (activeScheduleTabId === 'all') return
    const stillPresent = teacherClassrooms.some((row) => row.id === activeScheduleTabId)
    if (!stillPresent) {
      setActiveScheduleTabId('all')
    }
  }, [teacherClassrooms, activeScheduleTabId])

  const courseCards: CourseCardProps[] = useMemo(
    () =>
      courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        is_published: c.is_published,
        themeId: c.theme_id,
      })),
    [courses],
  )

  const coursesByFilterTab = useMemo(() => {
    const all = courseCards
    return {
      all: [...all],
      published: all.filter((c) => c.is_published),
      drafts: all.filter((c) => !c.is_published),
    } as const
  }, [courseCards])

  const gamesByFilterTab = useMemo(() => {
    const all = DUMMY_TEACHER_GAME_PROJECTS
    return {
      all: [...all],
      published: all.filter((g) => g.status === 'published'),
      drafts: all.filter((g) => g.status === 'draft'),
    } as const
  }, [])

  const tasksByFilter = useMemo(() => {
    const all = DUMMY_TEACHER_TASKS
    return {
      all: [...all],
      published: all.filter((task) => task.status === 'published'),
      drafts: all.filter((task) => task.status === 'draft'),
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

  const handleScheduleTabChange = (tabId: string) => {
    setActiveScheduleTabId(tabId)
  }

  const handleTaskTabChange = (tabId: string) => {
    setActiveTaskTabId(tabId)
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
            classNameContainer="p-0"
          >
            {fetchEnabled && classroomsLoading ? (
              <LoadingPage
                variant="embedded"
                message={t('dashboard.loadingClassrooms')}
                size={72}
              />
            ) : classroomCardItems.length === 0 ? (
              <TeacherClassroomsEmpty />
            ) : (
              <ClassroomCardList
                items={classroomCardItems}
                onClassroomView={handleClassroomView}
              />
            )}
          </DashboardSection>
        </div>

        <div className="flex gap-8 w-full">
          <DashboardSection
            title="Schedule"
            classNameContainer="h-55.5 max-h-80 min-h-0"
            icon={Calendar}
            showExpandButton
            expandTo="/teacher/schedule"
            showContainerBorder
          >
            {fetchEnabled && classroomsLoading ? (
              <LoadingPage
                variant="embedded"
                message={t('dashboard.loadingSchedule')}
                size={72}
              />
            ) : (
              <>
                <SelectTabs
                  variant="compact"
                  tabs={scheduleScopeTabs}
                  activeTabId={activeScheduleTabId}
                  onTabChange={handleScheduleTabChange}
                />
                {scheduleScopeTabs.map((tab) => (
                  <SelectTabsContent
                    key={tab.id}
                    tabId={tab.id}
                    activeTabId={activeScheduleTabId}
                    className="mt-2 min-h-0 px-0"
                  >
                    <p className="text-sm text-muted-foreground">
                      {tab.id === 'all'
                        ? t('dashboard.scheduleTabs.placeholderAll')
                        : t('dashboard.scheduleTabs.placeholderClassroom', {
                            name: tab.title,
                          })}
                    </p>
                  </SelectTabsContent>
                ))}
              </>
            )}
          </DashboardSection>
        </div>

        <div className="flex w-full min-w-0 flex-wrap gap-8">
          <div className="min-w-0 w-full basis-full md:basis-[calc(50%-1rem)] md:max-w-[calc(50%-1rem)] md:flex-1 md:grow">
            <DashboardSection
              title="Courses"
              showExpandButton
              expandTo="/teacher/courses"
              classNameContainer="h-55.5 max-h-80 min-h-0"
              icon={BookOpen}
              showContainerBorder
            >
              {coursesLoading ? (
                <LoadingPage
                  variant="embedded"
                  message={t('dashboard.loadingCourses')}
                  size={72}
                />
              ) : courseCards.length === 0 ? (
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
                    const tabCourses =
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
                        {tabCourses.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No courses match this filter.
                          </p>
                        ) : (
                          <CourseCardList
                            variant="compact"
                            courses={tabCourses}
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
          <div className="min-w-0 w-full basis-full md:basis-[calc(50%-1rem)] md:max-w-[calc(50%-1rem)] md:flex-1 md:grow">
            <DashboardSection
              title="Game Studio"
              classNameContainer="h-55.5 max-h-80 min-h-0"
              icon={SplinePointer}
              showExpandButton
              expandTo="/teacher/game-studio"
              showContainerBorder
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

        <div className="flex w-full min-w-0">
          <DashboardSection
            title="Tasks"
            classNameContainer="h-55.5 max-h-80 min-h-0"
            icon={ListTodo}
            showExpandButton
            expandTo="/teacher/tasks"
            showContainerBorder
          >
            <>
              <SelectTabs
                variant="compact"
                tabs={TASK_FILTER_TABS}
                activeTabId={activeTaskTabId}
                onTabChange={handleTaskTabChange}
              />
              {TASK_FILTER_TABS.map((tab) => {
                const tabTasks =
                  tab.id === 'all'
                    ? tasksByFilter.all
                    : tab.id === 'published'
                      ? tasksByFilter.published
                      : tasksByFilter.drafts

                return (
                  <SelectTabsContent
                    key={tab.id}
                    tabId={tab.id}
                    activeTabId={activeTaskTabId}
                    className="mt-2 min-h-0 px-0"
                  >
                    {tabTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('dashboard.tasks.empty')}</p>
                    ) : (
                      <ul className="space-y-2">
                        {tabTasks.map((task) => (
                          <li
                            key={task.id}
                            className="truncate text-sm text-foreground"
                          >
                            {task.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </SelectTabsContent>
                )
              })}
            </>
          </DashboardSection>
        </div>
      </main>
    </AppShell>
  )
}

export { Dashboard }
