import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Stats05, type Stats05Item } from '@/components/shared'
import { useUser } from '@/contexts/user'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const AdminDashboard = () => {
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const role = getRole()

  const statsItems = useMemo((): Stats05Item[] => {
    if (!role) return []
    const prefix = `/${role}`
    return [
      {
        name: t('dashboard.stats.institutions'),
        value: '12',
        change: '+2',
        changeType: 'positive',
        to: `${prefix}/institution`,
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
      {
        name: t('dashboard.stats.users'),
        value: '1,847',
        change: '+128',
        changeType: 'positive',
        to: `${prefix}/users`,
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
      {
        name: t('dashboard.stats.requests'),
        value: '34',
        to: `${prefix}/gdpr-request`,
        viewMoreLabel: t('dashboard.stats.viewMore'),
      },
    ]
  }, [role, t])

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6">
        <Stats05
          items={statsItems}
          className="p-0 py-2"
        />
      </div>
    </AdminWorkspaceShell>
  )
}

export { AdminDashboard }
