import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

export function InstitutionFacultiesClassGroups() {
  const { t } = useTranslation('features.institution-admin')

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-2 pb-12 pt-4">
        <div>
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-bold"
          >
            {t('faculties.pages.classGroups.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('faculties.pages.classGroups.subtitle')}
          </Text>
        </div>
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('faculties.pages.classGroups.empty')}
        </Text>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
