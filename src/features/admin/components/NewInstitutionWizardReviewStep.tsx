import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { NewInstitutionWizardValues } from '../types/institution.types'
import { getCountryDisplayValue } from '../config/countryOptions'
import { getInstitutionWizardStructureHintParts } from '../utils/institutionWizardStructureHint'

type NewInstitutionWizardReviewStepProps = {
  values: NewInstitutionWizardValues
}

function NewInstitutionWizardReviewStep({ values }: NewInstitutionWizardReviewStepProps) {
  const { t, i18n } = useTranslation('features.admin')

  const countryDisplay = getCountryDisplayValue(values.country, i18n.language)

  const structureHint = useMemo(
    () => getInstitutionWizardStructureHintParts(values.name),
    [values.name],
  )

  return (
    <>
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
          label={t('wizard.billing.address')}
          value={
            [
              [values.street, values.streetNumber].filter(Boolean).join(' '),
              [values.postalCode, values.city].filter(Boolean).join(' '),
              countryDisplay,
            ]
              .filter(Boolean)
              .join(', ') || '—'
          }
        />
      </dl>
      {structureHint ? (
        <p className="border-border mt-4 border-t pt-4 text-muted-foreground text-pretty text-sm leading-relaxed">
          {t('wizard.review.structureHint', {
            prefix: structureHint.prefix,
            exampleCode: structureHint.exampleCode,
          })}
        </p>
      ) : null}
    </>
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
