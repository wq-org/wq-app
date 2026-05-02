import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Calendar, Users } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'

import { AppShell } from '@/components/layout'
import { DashboardSection } from '@/features/dashboard'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { useClassroomDetail } from '../hooks/useClassroomDetail'

type ClassroomLocationState = {
  name?: string
}

export function ClassroomDetailPage() {
  const { t } = useTranslation('features.teacher')
  const { classroomId } = useParams<{ classroomId: string }>()
  const location = useLocation()
  const { classroom, loading, error } = useClassroomDetail(classroomId)

  const stateName = (location.state as ClassroomLocationState | null | undefined)?.name

  const displayTitle = useMemo(() => {
    const fromApi = classroom?.title?.trim()
    if (fromApi) return fromApi
    const fromState = stateName?.trim()
    if (fromState) return fromState
    return t('pages.classroomDetail.titleFallback')
  }, [classroom?.title, stateName, t])

  if (!classroomId?.trim()) {
    return (
      <AppShell
        role="teacher"
        className="flex flex-col gap-6"
      >
        <div className="container py-10">
          <Text
            as="p"
            variant="body"
            muted
          >
            {t('pages.classroomDetail.invalidId')}
          </Text>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="container py-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner
              variant="gray"
              size="lg"
            />
          </div>
        ) : null}

        {error ? (
          <Text
            as="p"
            variant="body"
            className="mb-4 text-sm text-destructive"
          >
            {t('pages.classroomDetail.loadError')}
          </Text>
        ) : null}

        <Text
          as="h1"
          variant="h1"
          className="text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {displayTitle}
        </Text>

        <div className="mt-10 flex flex-col gap-10">
          <DashboardSection
            title={t('pages.classroomDetail.sections.studentsTitle')}
            icon={Users}
            classNameContainer="px-4 py-4"
            showContainerBorder
          >
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('pages.classroomDetail.sections.studentsPlaceholder')}
            </Text>
          </DashboardSection>

          <DashboardSection
            title={t('pages.classroomDetail.sections.scheduleTitle')}
            icon={Calendar}
            classNameContainer="px-4 py-4"
            showContainerBorder
          >
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('pages.classroomDetail.sections.schedulePlaceholder')}
            </Text>
          </DashboardSection>

          <DashboardSection
            title={t('pages.classroomDetail.sections.coursesTitle')}
            icon={BookOpen}
            classNameContainer="px-4 py-4"
            showContainerBorder
          >
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('pages.classroomDetail.sections.coursesPlaceholder')}
            </Text>
          </DashboardSection>
        </div>
      </div>
    </AppShell>
  )
}
