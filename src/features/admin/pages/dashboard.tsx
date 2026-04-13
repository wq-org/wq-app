import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StatsLinks, type StatsLinksItem } from '@/components/shared'
import { useUser } from '@/contexts/user'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { useInstitutions } from '../hooks/useInstitutions'
import { useAdminUsers } from '../hooks/useAdminUsers'

const AdminDashboard = () => {
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const role = getRole()
  const { institutions } = useInstitutions()
  const { users } = useAdminUsers()

  const statsItems = useMemo((): StatsLinksItem[] => {
    if (!role) return []
    const prefix = `/${role}`
    return [
      {
        name: t('dashboard.stats.institutions'),
        value: String(institutions.length),
        to: `${prefix}/institution`,
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
      {
        name: t('dashboard.stats.users'),
        value: String(users.length),
        to: `${prefix}/users`,
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
      {
        name: t('dashboard.stats.requests'),
        value: '0',
        to: `${prefix}/gdpr-request`,
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
    ]
  }, [role, t, institutions.length, users.length])

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6">
        <StatsLinks
          items={statsItems}
          className="p-0 py-2"
        />
      </div>
    </AdminWorkspaceShell>
  )
}

export { AdminDashboard }
