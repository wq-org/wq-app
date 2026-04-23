import { useTranslation } from 'react-i18next'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const AdminAnalytics = () => {
  const { t } = useTranslation('features.admin')
  return <AdminWorkspaceShell>{t('nav.analytics')}</AdminWorkspaceShell>
}

export { AdminAnalytics }
