import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/layout'
import { PlanFeaturesCard } from '@/components/shared'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { useMyInstitutionFeatureFlags } from '@/features/entitlements'

export function TeacherLicensePage() {
  const { t } = useTranslation('features.teacher')
  const { profile } = useUser()
  const fetchEnabled = Boolean(profile?.user_id)
  const institutionId = profile?.userInstitutionId ?? null
  const { features, planCode, isLoading, error } = useMyInstitutionFeatureFlags(fetchEnabled)

  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="container py-6">
        <div className="max-w-3xl flex flex-col space-y-2">
          <Text variant="h1">{t('pages.license.title')}</Text>
          <Text
            variant="body"
            color="muted"
          >
            {t('pages.license.subtitle')}
          </Text>
        </div>

        {institutionId === null ? (
          <Text
            as="p"
            variant="small"
            color="muted"
            className="mt-6"
          >
            {t('pages.license.noInstitution')}
          </Text>
        ) : null}

        <div className="mt-8">
          <PlanFeaturesCard
            features={features}
            planCode={planCode}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </AppShell>
  )
}
