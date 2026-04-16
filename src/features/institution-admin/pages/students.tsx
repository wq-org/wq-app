import { useTranslation } from 'react-i18next'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const InstitutionStudents = () => {
  const { t } = useTranslation('features.institution-admin')
  return <InstitutionAdminWorkspaceShell>{t('nav.students')}</InstitutionAdminWorkspaceShell>
}

export { InstitutionStudents }
