import { useTranslation } from 'react-i18next'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const AdminLicenses = () => {
  const { t } = useTranslation('features.admin')
  return <AdminWorkspaceShell>{t('nav.licenses')}</AdminWorkspaceShell>
}

export { AdminLicenses }
