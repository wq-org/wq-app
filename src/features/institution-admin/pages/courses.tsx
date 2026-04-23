import { useTranslation } from 'react-i18next'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const InstitutionCourses = () => {
  const { t } = useTranslation('features.institution-admin')
  return (
    <InstitutionAdminWorkspaceShell>
      <p>{t('nav.courses')}</p>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionCourses }
