import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppShell } from '@/components/layout'
import { LoadingPage, SelectTabs, SelectTabsContent, type TabItem } from '@/components/shared'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import {
  CourseCardList,
  toCourseCardProps,
  useCourses,
  type CourseCardProps,
} from '@/features/course'
import { DashboardSection } from '@/features/dashboard'
import { GameProjectCardList, useTeacherGameProjects } from '@/features/game-studio'
import { useUser } from '@/contexts/user'
import { useMyInstitutionFeatureFlags } from '@/features/entitlements'
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
import { TeacherGameProjectsEmpty } from '../components/TeacherGameProjectsEmpty'

const DEFAULT_FILTER_TAB_ID = 'all'

const Dashboard = () => {
  const { t } = useTranslation('features.teacher')
  const navigate = useNavigate()
  const { profile } = useUser()
  const fetchEnabled = Boolean(profile?.user_id)

  const courseFilterTabs: TabItem[] = useMemo(
    () => [
      { id: 'all', title: t('dashboard.filterTabs.all'), icon: LibraryBig },
      { id: 'published', title: t('dashboard.filterTabs.published'), icon: BookOpenCheck },
      { id: 'drafts', title: t('dashboard.filterTabs.drafts'), icon: BookOpenText },
    ],
    [t],
  )

  const gameFilterTabs: TabItem[] = useMemo(
    () => [
      { id: 'all', title: t('dashboard.filterTabs.all'), icon: SplinePointer },
      { id: 'published', title: t('dashboard.filterTabs.published'), icon: Joystick },
      { id: 'drafts', title: t('dashboard.filterTabs.drafts'), icon: DraftingCompass },
    ],
    [t],
  )

  const taskFilterTabs: TabItem[] = useMemo(
    () => [
      { id: 'all', title: t('dashboard.filterTabs.all'), icon: ListTodo },
      { id: 'published', title: t('dashboard.filterTabs.published'), icon: ListChecks },
      { id: 'drafts', title: t('dashboard.filterTabs.drafts'), icon: LayoutList },
    ],
    [t],
  )

  const {
    rows: teacherClassrooms,
    loading: classroomsLoading,
    error: classroomsError,
  } = useTeacherClassrooms(fetchEnabled)

  const {
    features: institutionFeatureFlags,
    planCode: institutionPlanCode,
    isLoading: institutionFlagsLoading,
  } = useMyInstitutionFeatureFlags(fetchEnabled)

  useEffect(() => {
    if (institutionFlagsLoading) return
  }, [institutionFlagsLoading, institutionPlanCode, institutionFeatureFlags])
  const { courses, loading: coursesLoading, error: coursesError, fetchCourses } = useCourses()

  const [activeCourseTabId, setActiveCourseTabId] = useState<string>(DEFAULT_FILTER_TAB_ID)
  const [activeGameTabId, setActiveGameTabId] = useState<string>(DEFAULT_FILTER_TAB_ID)
  const [activeScheduleTabId, setActiveScheduleTabId] = useState<string>('all')
  const [activeTaskTabId, setActiveTaskTabId] = useState<string>(DEFAULT_FILTER_TAB_ID)

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

  const courseCards: CourseCardProps[] = useMemo(() => courses.map(toCourseCardProps), [courses])

  const coursesByFilterTab = useMemo(() => {
    const all = courseCards
    return {
      all: [...all],
      published: all.filter((c) => c.is_published),
      drafts: all.filter((c) => !c.is_published),
    } as const
  }, [courseCards])

  const {
    projects: gameProjects,
    loading: gameProjectsLoading,
    error: gameProjectsError,
  } = useTeacherGameProjects(profile?.user_id)

  const gamesByFilterTab = useMemo(() => {
    const all = gameProjects
    return {
      all: [...all],
      published: all.filter((g) => g.status === 'published'),
      drafts: all.filter((g) => g.status === 'draft'),
    } as const
  }, [gameProjects])

  useEffect(() => {
    if (gameProjectsError) {
      toast.error(t('dashboard.gamesLoadError'))
    }
  }, [gameProjectsError, t])

  const tasksByFilter = useMemo(() => {
    const all: { id: string; title: string; status: 'draft' | 'published' }[] = []
    return {
      all,
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
                <TeacherCoursesEmpty hideIcon />
              ) : (
                <>
                  <SelectTabs
                    variant="compact"
                    tabs={courseFilterTabs}
                    activeTabId={activeCourseTabId}
                    onTabChange={handleCourseTabChange}
                  />
                  {courseFilterTabs.map((tab) => {
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
              {gameProjectsLoading ? (
                <LoadingPage
                  variant="embedded"
                  message={t('dashboard.loadingGames')}
                  size={72}
                />
              ) : gamesByFilterTab.all.length === 0 ? (
                <TeacherGameProjectsEmpty hideIcon />
              ) : (
                <>
                  <SelectTabs
                    variant="compact"
                    tabs={gameFilterTabs}
                    activeTabId={activeGameTabId}
                    onTabChange={handleGameTabChange}
                  />
                  {gameFilterTabs.map((tab) => {
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
                            {t('dashboard.gamesFilterNoMatches')}
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
                tabs={taskFilterTabs}
                activeTabId={activeTaskTabId}
                onTabChange={handleTaskTabChange}
              />
              {taskFilterTabs.map((tab) => {
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
