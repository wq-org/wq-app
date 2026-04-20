import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FieldInput } from '@/components/ui/field-input'
import { CountryCombobox } from './CountryCombobox'
import { getCountryDisplayValue } from '../config/countryOptions'
import type { Control, FieldErrors } from 'react-hook-form'
import type { NewInstitutionWizardFormValues } from '../schemas/institution.schema'

type NewInstitutionWizardBillingStepProps = {
  control: Control<NewInstitutionWizardFormValues>
  errors: FieldErrors<NewInstitutionWizardFormValues>
}

function NewInstitutionWizardBillingStep({
  control,
  errors,
}: NewInstitutionWizardBillingStepProps) {
  const { t, i18n } = useTranslation('features.admin')

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Controller
          name="legalName"
          control={control}
          render={({ field }) => (
            <FieldInput
              id="new-inst-legal-name"
              label={t('wizard.billing.legalName')}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('form.legal.legalNamePlaceholder')}
            />
          )}
        />
        {errors.legalName ? (
          <p
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.legalName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Controller
          name="billingEmail"
          control={control}
          render={({ field }) => (
            <FieldInput
              id="new-inst-billing-email"
              label={t('wizard.billing.billingEmail')}
              type="email"
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('form.billing.billingEmailPlaceholder')}
            />
          )}
        />
        {errors.billingEmail ? (
          <p
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.billingEmail.message}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Controller
            name="street"
            control={control}
            render={({ field }) => (
              <FieldInput
                id="new-inst-street"
                label={t('wizard.billing.street')}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('wizard.billing.streetPlaceholder')}
              />
            )}
          />
        </div>

        <div className="space-y-2 sm:w-28">
          <Controller
            name="streetNumber"
            control={control}
            render={({ field }) => (
              <FieldInput
                id="new-inst-street-number"
                label={t('wizard.billing.streetNumber')}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('wizard.billing.streetNumberPlaceholder')}
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
        <div className="space-y-2 sm:w-32">
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <FieldInput
                id="new-inst-postal-code"
                label={t('wizard.billing.postalCode')}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('wizard.billing.postalCodePlaceholder')}
                maxLength={5}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <FieldInput
                id="new-inst-city"
                label={t('wizard.billing.city')}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('wizard.billing.cityPlaceholder')}
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <CountryCombobox
              value={field.value}
              onValueChange={(country) =>
                field.onChange(getCountryDisplayValue(country, i18n.language))
              }
              placeholder={t('form.address.countryPlaceholder')}
            />
          )}
        />
        {errors.country ? (
          <p
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.country.message}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export { NewInstitutionWizardBillingStep }
