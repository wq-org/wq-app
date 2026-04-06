import { useTranslation } from 'react-i18next'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import type { NewInstitutionWizardValues } from '../types/institution.types'

type NewInstitutionWizardBillingStepProps = {
  values: NewInstitutionWizardValues
  onChange: (patch: Partial<NewInstitutionWizardValues>) => void
}

function NewInstitutionWizardBillingStep({
  values,
  onChange,
}: NewInstitutionWizardBillingStepProps) {
  const { t } = useTranslation('features.admin')

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-inst-legal-name">{t('wizard.billing.legalName')}</Label>
        <FieldInput
          id="new-inst-legal-name"
          label={t('wizard.billing.legalName')}
          value={values.legalName}
          onValueChange={(legalName) => onChange({ legalName })}
          placeholder={t('form.legal.legalNamePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-inst-billing-email">{t('wizard.billing.billingEmail')}</Label>
        <FieldInput
          id="new-inst-billing-email"
          label={t('wizard.billing.billingEmail')}
          type="email"
          value={values.billingEmail}
          onValueChange={(billingEmail) => onChange({ billingEmail })}
          placeholder={t('form.billing.billingEmailPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-inst-country">{t('wizard.billing.country')}</Label>
        <FieldInput
          id="new-inst-country"
          label={t('wizard.billing.country')}
          value={values.country}
          onValueChange={(country) => onChange({ country })}
          placeholder={t('form.address.countryPlaceholder')}
        />
      </div>
    </div>
  )
}

export { NewInstitutionWizardBillingStep }
