import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Calendar, type LucideIcon, Users } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'

import { AppShell } from '@/components/layout'
import { LoadingPage } from '@/components/shared'
import { DashboardSection } from '@/features/dashboard'
import { Text } from '@/components/ui/text'

import { useClassroomDetail } from '../hooks/useClassroomDetail'

type ClassroomLocationState = {
  name?: string
}

type SectionSpec = {
  icon: LucideIcon
  titleKey: string
  placeholderKey: string
  loadingKey: string
}

const CLASSROOM_SECTIONS: SectionSpec[] = [
  {
    icon: Users,
    titleKey: 'pages.classroomDetail.sections.studentsTitle',
    placeholderKey: 'pages.classroomDetail.sections.studentsPlaceholder',
    loadingKey: 'pages.classroomDetail.sections.studentsLoading',
  },
  {
    icon: Calendar,
    titleKey: 'pages.classroomDetail.sections.scheduleTitle',
    placeholderKey: 'pages.classroomDetail.sections.schedulePlaceholder',
    loadingKey: 'pages.classroomDetail.sections.scheduleLoading',
  },
  {
    icon: BookOpen,
    titleKey: 'pages.classroomDetail.sections.coursesTitle',
    placeholderKey: 'pages.classroomDetail.sections.coursesPlaceholder',
    loadingKey: 'pages.classroomDetail.sections.coursesLoading',
  },
]

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
        {error ? (
          <Text
            as="p"
            variant="body"
            className="mb-4 text-sm text-destructive"
          >
            {t('pages.classroomDetail.loadError')}
          </Text>
        ) : null}

        <div className="text-center">
          <Text
            as="h1"
            variant="h1"
          >
            {displayTitle}
          </Text>
        </div>

        <div className="mt-10 flex flex-col gap-10">
          {CLASSROOM_SECTIONS.map((spec) => (
            <DashboardSection
              key={spec.titleKey}
              title={t(spec.titleKey)}
              icon={spec.icon}
              classNameContainer="px-4 py-4"
              showContainerBorder
            >
              {loading ? (
                <LoadingPage
                  variant="embedded"
                  message={t(spec.loadingKey)}
                  size={72}
                />
              ) : (
                <Text
                  as="p"
                  variant="body"
                  className="text-sm text-muted-foreground"
                >
                  {t(spec.placeholderKey)}
                </Text>
              )}
            </DashboardSection>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
