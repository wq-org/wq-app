import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { PlanFeaturesCard } from '@/components/shared'
import { useUser } from '@/contexts/user'
import { InstitutionSubscriptionDetails } from '../components/InstitutionSubscriptionDetails'
import { useInstitutionLicensing } from '../hooks/useInstitutionLicensing'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

export const InstitutionAdminLicense = () => {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const { features, planCode, subscription, isLoading, error } = useInstitutionLicensing()
  const institutionId = getUserInstitutionId()

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-6">
        <div>
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-bold"
          >
            {t('license.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('license.subtitle')}
          </Text>
        </div>

        {institutionId !== null ? (
          <InstitutionSubscriptionDetails subscription={subscription ?? null} />
        ) : (
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('license.noInstitution')}
          </Text>
        )}

        <PlanFeaturesCard
          features={features}
          planCode={planCode}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
