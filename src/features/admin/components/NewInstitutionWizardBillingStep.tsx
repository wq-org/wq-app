import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
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
        <Input
          id="new-inst-legal-name"
          value={values.legalName}
          onChange={(e) => onChange({ legalName: e.target.value })}
          placeholder={t('form.legal.legalNamePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-inst-billing-email">{t('wizard.billing.billingEmail')}</Label>
        <Input
          id="new-inst-billing-email"
          type="email"
          value={values.billingEmail}
          onChange={(e) => onChange({ billingEmail: e.target.value })}
          placeholder={t('form.billing.billingEmailPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-inst-country">{t('wizard.billing.country')}</Label>
        <Input
          id="new-inst-country"
          value={values.country}
          onChange={(e) => onChange({ country: e.target.value })}
          placeholder={t('form.address.countryPlaceholder')}
        />
      </div>
    </div>
  )
}

export { NewInstitutionWizardBillingStep }
