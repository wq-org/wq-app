import { useTranslation } from 'react-i18next'

import { StatsLinks, type StatsLinksItem } from '@/components/shared'
import { useUser } from '@/contexts/user'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const InstitutionDashboard = () => {
  const { t } = useTranslation('features.institution-admin')
  const { profile } = useUser()

  const greetingName = profile?.display_name?.trim() || profile?.username?.trim()

  // Mock data — replace with actual data from API
  const stats: readonly StatsLinksItem[] = [
    {
      name: t('dashboard.stats.students.label'),
      value: '245',
      change: '+12',
      changeType: 'positive',
      to: '/institution_admin/users?role=student',
      viewMoreLabel: t('dashboard.stats.viewMore'),
    },
    {
      name: t('dashboard.stats.teachers.label'),
      value: '18',
      change: '+2',
      changeType: 'positive',
      to: '/institution_admin/users?role=teacher',
      viewMoreLabel: t('dashboard.stats.viewMore'),
    },
    {
      name: t('dashboard.stats.classrooms.label'),
      value: '8',
      change: '+1',
      changeType: 'positive',
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
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300">
          <StatsLinks items={stats} />
        </div>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionDashboard }
