import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ClipboardList, GraduationCap } from 'lucide-react'

import { AppShell } from '@/components/layout'
import { LoadingPage } from '@/components/shared'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { CourseCardList, buildStudentPublishedCourseRoute } from '@/features/course'
import { DashboardSection } from '@/features/dashboard'
import { useStudentCourseDeliveries } from '../hooks/useStudentCourseDeliveries'

export function Dashboard() {
  const { t } = useTranslation('features.student')
  const navigate = useNavigate()
  const { loading, profile } = useUser()
  const fetchEnabled = Boolean(profile?.user_id)
  const { courses, loading: coursesLoading } = useStudentCourseDeliveries(fetchEnabled)

  const greetingName = profile?.display_name?.trim() || profile?.username?.trim()
  const greeting = greetingName
    ? t('dashboard.greetingWithName', { name: greetingName })
    : t('dashboard.greeting')

  const teachers = useMemo(() => {
    const teacherById = new Map<string, NonNullable<(typeof courses)[number]['teacher']>>()

    for (const course of courses) {
      if (!course.teacher || teacherById.has(course.teacher.id)) continue
      teacherById.set(course.teacher.id, course.teacher)
    }

    return [...teacherById.values()]
  }, [courses])

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
            <p className="text-sm text-muted-foreground">{t('dashboard.sections.courses.empty')}</p>
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
          classNameContainer="h-55.5 max-h-80 min-h-0"
          showContainerBorder
        >
          <p className="text-sm text-muted-foreground">{t('dashboard.sections.tasks.empty')}</p>
        </DashboardSection>

        <DashboardSection
          title={t('dashboard.sections.teachers.title')}
          icon={GraduationCap}
          classNameContainer="min-h-42"
          showContainerBorder
        >
          {coursesLoading ? (
            <LoadingPage
              variant="embedded"
              message={t('dashboard.sections.teachers.loading')}
              size={72}
            />
          ) : teachers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('dashboard.sections.teachers.empty')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex w-28 min-w-0 flex-col items-center gap-2"
                >
                  <Avatar
                    size="xl"
                    className="shadow-sm"
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
                </div>
              ))}
            </div>
          )}
        </DashboardSection>
      </main>
    </AppShell>
  )
}
