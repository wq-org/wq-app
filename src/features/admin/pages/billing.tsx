import { useTranslation } from 'react-i18next'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const AdminBilling = () => {
  const { t } = useTranslation('features.admin')
  return <AdminWorkspaceShell>{t('nav.billing')}</AdminWorkspaceShell>
}

export { AdminBilling }
