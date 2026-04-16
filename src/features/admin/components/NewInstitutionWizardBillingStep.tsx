import { useTranslation } from 'react-i18next'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import type { NewInstitutionWizardValues } from '../types/institution.types'
import { getCountryDisplayValue } from '../config/countryOptions'
import { CountryCombobox } from './CountryCombobox'

type NewInstitutionWizardBillingStepProps = {
  values: NewInstitutionWizardValues
  onChange: (patch: Partial<NewInstitutionWizardValues>) => void
}

function NewInstitutionWizardBillingStep({
  values,
  onChange,
}: NewInstitutionWizardBillingStepProps) {
  const { t, i18n } = useTranslation('features.admin')

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="new-inst-street">{t('wizard.billing.street')}</Label>
          <FieldInput
            id="new-inst-street"
            label={t('wizard.billing.street')}
            value={values.street}
            onValueChange={(street) => onChange({ street })}
            placeholder={t('wizard.billing.streetPlaceholder')}
          />
        </div>

        <div className="space-y-2 sm:w-28">
          <Label htmlFor="new-inst-street-number">{t('wizard.billing.streetNumber')}</Label>
          <FieldInput
            id="new-inst-street-number"
            label={t('wizard.billing.streetNumber')}
            value={values.streetNumber}
            onValueChange={(streetNumber) => onChange({ streetNumber })}
            placeholder={t('wizard.billing.streetNumberPlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
        <div className="space-y-2 sm:w-32">
          <Label htmlFor="new-inst-postal-code">{t('wizard.billing.postalCode')}</Label>
          <FieldInput
            id="new-inst-postal-code"
            label={t('wizard.billing.postalCode')}
            value={values.postalCode}
            onValueChange={(postalCode) => onChange({ postalCode })}
            placeholder={t('wizard.billing.postalCodePlaceholder')}
            maxLength={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-inst-city">{t('wizard.billing.city')}</Label>
          <FieldInput
            id="new-inst-city"
            label={t('wizard.billing.city')}
            value={values.city}
            onValueChange={(city) => onChange({ city })}
            placeholder={t('wizard.billing.cityPlaceholder')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-inst-country">{t('wizard.billing.country')}</Label>
        <CountryCombobox
          value={values.country}
          onValueChange={(country) =>
            onChange({ country: getCountryDisplayValue(country, i18n.language) })
          }
          placeholder={t('form.address.countryPlaceholder')}
        />
      </div>
    </div>
  )
}

export { NewInstitutionWizardBillingStep }
