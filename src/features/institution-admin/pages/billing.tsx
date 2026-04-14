import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { InstitutionSubscriptionDetails } from '@/features/institution/components/InstitutionSubscriptionDetails'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

function EmptyStateCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-1">
      <Text
        as="h2"
        variant="h2"
        className="text-lg font-semibold"
      >
        {title}
      </Text>
      <Text
        as="p"
        variant="body"
        color="muted"
      >
        {description}
      </Text>
    </div>
  )
}

const AdminBilling = () => {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
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
            {t('billing.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('billing.subtitle')}
          </Text>
        </div>

        {institutionId ? (
          <InstitutionSubscriptionDetails institutionId={institutionId} />
        ) : (
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('billing.noInstitution')}
          </Text>
        )}

        <EmptyStateCard
          title={t('billing.invoices.title')}
          description={t('billing.invoices.empty')}
        />

        <EmptyStateCard
          title={t('billing.paymentMethod.title')}
          description={t('billing.paymentMethod.empty')}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { AdminBilling }
