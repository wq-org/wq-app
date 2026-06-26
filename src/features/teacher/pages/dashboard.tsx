import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppShell } from '@/components/layout'
import { LoadingPage, SelectTabs, SelectTabsContent, type TabItem } from '@/components/shared'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import { Text } from '@/components/ui/text'
import {
  CourseCardList,
  toCourseCardProps,
  useCourses,
  type CourseCardProps,
} from '@/features/course'
import { DashboardSection, useDashboardGreetingPeriod } from '@/features/dashboard'
import { GameProjectCardList, useTeacherGameProjects } from '@/features/game-studio'
import { useUser } from '@/contexts/user'
import { useMyInstitutionFeatureFlags } from '@/features/entitlements'
import { TeacherClassroomsEmpty } from '../components/TeacherClassroomsEmpty'
import { TeacherCoursesEmpty } from '../components/TeacherCoursesEmpty'
import {
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  DraftingCompass,
  Joystick,
  LampDesk,
  LibraryBig,
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
  const greetingPeriod = useDashboardGreetingPeriod()
  const greetingName = profile?.display_name?.trim() || profile?.username?.trim()
  const greeting = greetingName
    ? t(`dashboard.greetings.${greetingPeriod}WithName`, { name: greetingName })
    : t(`dashboard.greetings.${greetingPeriod}`)

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

  const courseCards: CourseCardProps[] = useMemo(() => courses.map(toCourseCardProps), [courses])

  const coursesByFilterTab = useMemo(() => {
    const all = courseCards
    return {
      all: [...all],
      published: all.filter((c) => c.releaseStatus === 'live'),
      drafts: all.filter((c) => c.releaseStatus === 'draft'),
    } as const
  }, [courseCards])

  const {
    projects: gameProjects,
    loading: gameProjectsLoading,
    error: gameProjectsError,
    refetch: refetchGameProjects,
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
      <main className="container flex flex-col gap-11 pb-40">
        <section className="flex flex-col items-center gap-3 pt-10 text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {greeting}
          </Text>
          <QuoteOfTheDay />
        </section>

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
                            onCourseChanged={() => void fetchCourses()}
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
                            onCourseLinkChanged={() => void refetchGameProjects()}
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
      </main>
    </AppShell>
  )
}

export { Dashboard }
