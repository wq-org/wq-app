import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/layout'
import { LoadingPage } from '@/components/shared'
import { useUser } from '@/contexts/user'

export function Dashboard() {
  const { t } = useTranslation('features.student')
  const { loading } = useUser()

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
    <AppShell role="student">
      <main className="container py-10" />
    </AppShell>
  )
}
