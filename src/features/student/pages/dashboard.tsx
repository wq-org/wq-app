import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ClipboardList, GraduationCap } from 'lucide-react'

import { AppShell } from '@/components/layout'
import { LoadingPage } from '@/components/shared'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { CourseCardList, buildStudentPublishedCourseRoute } from '@/features/course'
import { DashboardSection, useDashboardGreetingPeriod } from '@/features/dashboard'
import { useStudentCourseDeliveries } from '../hooks/useStudentCourseDeliveries'
import type { StudentTeacherSummary } from '../api/studentCourseDeliveriesApi'
import { TeacherProfileDialog } from '../components/TeacherProfileDialog'

export function Dashboard() {
  const { t } = useTranslation('features.student')
  const navigate = useNavigate()
  const { loading, profile } = useUser()
  const fetchEnabled = Boolean(profile?.user_id)
  const { courses, loading: coursesLoading } = useStudentCourseDeliveries(fetchEnabled)
  const greetingPeriod = useDashboardGreetingPeriod()

  const greetingName = profile?.display_name?.trim() || profile?.username?.trim()
  const greeting = greetingName
    ? t(`dashboard.greetings.${greetingPeriod}WithName`, { name: greetingName })
    : t(`dashboard.greetings.${greetingPeriod}`)

  const teachers = useMemo(() => {
    const teacherById = new Map<string, NonNullable<(typeof courses)[number]['teacher']>>()

    for (const course of courses) {
      if (!course.teacher || teacherById.has(course.teacher.id)) continue
      teacherById.set(course.teacher.id, course.teacher)
    }

    return [...teacherById.values()]
  }, [courses])

  const [selectedTeacher, setSelectedTeacher] = useState<StudentTeacherSummary | null>(null)
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)

  const handleTeacherClick = (teacher: StudentTeacherSummary) => {
    setSelectedTeacher(teacher)
    setTeacherDialogOpen(true)
  }

  const handleCourseView = (courseId: string) => {
    const course = courses.find((item) => item.id === courseId)
    if (!course) return

    navigate(buildStudentPublishedCourseRoute(course.classroomId, course.id))
  }

  if (loading) {
    return (
      <AppShell role="student">
        <LoadingPage
          variant="fullPage"
          message={t('dashboard.loading')}
        />
      </AppShell>
    )
  }

  return (
    <AppShell
      role="student"
      className="flex flex-col gap-8"
    >
      <main className="container flex flex-col gap-11 pb-40 pt-10">
        <section className="flex flex-col items-center gap-3 text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {greeting}
          </Text>
          <QuoteOfTheDay />
        </section>

        <DashboardSection
          title={t('dashboard.sections.courses.title')}
          icon={BookOpen}
          classNameContainer="h-55.5 max-h-80 min-h-0"
          showContainerBorder
        >
          {coursesLoading ? (
            <LoadingPage
              variant="embedded"
              message={t('dashboard.sections.courses.loading')}
              size={72}
            />
          ) : courses.length === 0 ? (
            <Empty className="border-none p-2 md:p-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen className="size-5" />
                </EmptyMedia>
                <EmptyTitle className="text-sm font-medium">
                  {t('dashboard.sections.courses.emptyTitle')}
                </EmptyTitle>
                <EmptyDescription>
                  {t('dashboard.sections.courses.emptyDescription')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <CourseCardList
              variant="compact"
              courses={courses}
              onCourseView={handleCourseView}
              className="gap-2"
            />
          )}
        </DashboardSection>

        <DashboardSection
          title={t('dashboard.sections.tasks.title')}
          icon={ClipboardList}
          classNameContainer="min-h-16"
          showContainerBorder
        >
          <Empty className="border-none p-2 md:p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList className="size-5" />
              </EmptyMedia>
              <EmptyTitle className="text-sm font-medium">
                {t('dashboard.sections.tasks.emptyTitle')}
              </EmptyTitle>
              <EmptyDescription>{t('dashboard.sections.tasks.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </DashboardSection>

        <DashboardSection
          title={t('dashboard.sections.teachers.title')}
          icon={GraduationCap}
          classNameContainer="min-h-32"
          showContainerBorder
        >
          {coursesLoading ? (
            <LoadingPage
              variant="embedded"
              message={t('dashboard.sections.teachers.loading')}
              size={72}
            />
          ) : teachers.length === 0 ? (
            <Empty className="border-none p-2 md:p-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <GraduationCap className="size-5" />
                </EmptyMedia>
                <EmptyTitle className="text-sm font-medium">
                  {t('dashboard.sections.teachers.emptyTitle')}
                </EmptyTitle>
                <EmptyDescription>
                  {t('dashboard.sections.teachers.emptyDescription')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-wrap gap-4">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleTeacherClick(teacher)}
                  className="group flex w-24 min-w-0 flex-col items-center gap-2 rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar
                    size="lg"
                    className="shadow-sm ring-ring ring-offset-background transition-shadow group-hover:ring-2 group-hover:ring-offset-2"
                  >
                    <AvatarImage
                      src={teacher.avatarUrl ?? undefined}
                      alt={teacher.name}
                    />
                    <AvatarFallback>{teacher.initials}</AvatarFallback>
                  </Avatar>
                  <Text
                    as="p"
                    variant="small"
                    bold
                    title={teacher.name}
                    className="w-full truncate text-center"
                  >
                    {teacher.name}
                  </Text>
                </button>
              ))}
            </div>
          )}
        </DashboardSection>
      </main>

      <TeacherProfileDialog
        teacher={selectedTeacher}
        open={teacherDialogOpen}
        onOpenChange={setTeacherDialogOpen}
      />
    </AppShell>
  )
}
