import { useTranslation } from 'react-i18next'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const InstitutionTeachers = () => {
  const { t } = useTranslation('features.institution-admin')
  return (
    <InstitutionAdminWorkspaceShell>
      <p>{t('nav.teachers')}</p>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionTeachers }
