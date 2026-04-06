import { useTranslation } from 'react-i18next'
import type { NewInstitutionWizardValues } from '../types/institution.types'

type NewInstitutionWizardReviewStepProps = {
  values: NewInstitutionWizardValues
}

function NewInstitutionWizardReviewStep({ values }: NewInstitutionWizardReviewStepProps) {
  const { t } = useTranslation('features.admin')

  return (
    <dl className="space-y-3 text-sm">
      <Row
        label={t('wizard.identity.name')}
        value={values.name || '—'}
      />
      <Row
        label={t('wizard.identity.slug')}
        value={values.slug || '—'}
      />
      <Row
        label={t('wizard.identity.type')}
        value={values.type ? t(`form.types.${values.type}`) : '—'}
      />
      <Row
        label={t('wizard.identity.adminEmail')}
        value={values.adminEmail || '—'}
      />
      <Row
        label={t('wizard.billing.legalName')}
        value={values.legalName || '—'}
      />
      <Row
        label={t('wizard.billing.billingEmail')}
        value={values.billingEmail || '—'}
      />
      <Row
        label={t('wizard.billing.country')}
        value={values.country || '—'}
      />
    </dl>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-x-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all">{value}</dd>
    </div>
  )
}

export { NewInstitutionWizardReviewStep }
