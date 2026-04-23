import { useTranslation } from 'react-i18next'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const AdminFeatures = () => {
  const { t } = useTranslation('features.admin')
  return <AdminWorkspaceShell>{t('nav.featureDefinitions')}</AdminWorkspaceShell>
}

export { AdminFeatures }
