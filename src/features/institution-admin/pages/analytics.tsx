import { useTranslation } from 'react-i18next'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const AdminAnalytics = () => {
  const { t } = useTranslation('features.institution-admin')
  return <InstitutionAdminWorkspaceShell>{t('nav.analytics')}</InstitutionAdminWorkspaceShell>
}

export { AdminAnalytics }
