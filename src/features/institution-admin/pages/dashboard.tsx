import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StatsLinks, type StatsLinksItem } from '@/components/shared'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useInstitutionDashboardStats } from '../hooks/useInstitutionDashboardStats'

const InstitutionDashboard = () => {
  const { t } = useTranslation('features.institution-admin')
  const { profile, getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()

  const {
    studentCount,
    teacherCount,
    classroomCount,
    isLoading,
    error: statsError,
  } = useInstitutionDashboardStats(institutionId)

  const greetingName = profile?.display_name?.trim() || profile?.username?.trim()

  const stats = useMemo((): readonly StatsLinksItem[] => {
    return [
      {
        name: t('dashboard.stats.students.label'),
        value: String(studentCount),
        to: '/institution_admin/users?role=student',
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
      {
        name: t('dashboard.stats.teachers.label'),
        value: String(teacherCount),
        to: '/institution_admin/users?role=teacher',
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
      {
        name: t('dashboard.stats.classrooms.label'),
        value: String(classroomCount),
        to: '/institution_admin/classrooms',
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
      {
        name: t('dashboard.stats.storage.label'),
        value: '2.4 GB',
        change: '+180 MB',
        changeType: 'neutral',
        to: '/institution_admin/cloud-storage',
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
    ]
  }, [t, studentCount, teacherCount, classroomCount])

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300">
        <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-bottom-3 motion-safe:duration-300">
          <h1 className="text-3xl font-bold tracking-tight">
            {greetingName
              ? t('dashboard.greeting', { name: greetingName })
              : t('dashboard.greetingAnonymous')}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
          {statsError && !isLoading ? (
            <p
              className="mt-1 text-sm text-destructive"
              role="alert"
            >
              {statsError}
            </p>
          ) : null}
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300">
          {isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Spinner
                variant="gray"
                size="sm"
                speed={1750}
              />
            </div>
          ) : statsError ? null : (
            <StatsLinks items={stats} />
          )}
        </div>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionDashboard }
