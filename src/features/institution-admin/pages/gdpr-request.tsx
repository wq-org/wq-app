import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const InstitutionGDPRRequest = () => {
  const { t } = useTranslation('features.institution-admin')
  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-4">
        <div>
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-bold"
          >
            {t('gdprRequest.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('gdprRequest.subtitle')}
          </Text>
        </div>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionGDPRRequest }
