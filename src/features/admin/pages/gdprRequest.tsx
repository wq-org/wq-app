import { useTranslation } from 'react-i18next'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const AdminGdprRequest = () => {
  const { t } = useTranslation('features.admin')
  return <AdminWorkspaceShell>{t('nav.gdprRequest')}</AdminWorkspaceShell>
}

export { AdminGdprRequest }
