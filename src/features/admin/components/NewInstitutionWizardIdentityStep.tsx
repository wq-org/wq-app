import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FieldInput } from '@/components/ui/field-input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Text } from '@/components/ui/text'
import type { Control, FieldErrors, UseFormSetValue } from 'react-hook-form'
import type { NewInstitutionWizardFormValues } from '../schemas/institution.schema'
import { slugifyInstitutionName } from '../utils/institutionSlug'

const INSTITUTION_TYPES = [
  'school',
  'university',
  'college',
  'organization',
  'hospital',
  'other',
] as const

type NewInstitutionWizardIdentityStepProps = {
  control: Control<NewInstitutionWizardFormValues>
  errors: FieldErrors<NewInstitutionWizardFormValues>
  setValue: UseFormSetValue<NewInstitutionWizardFormValues>
}

function NewInstitutionWizardIdentityStep({
  control,
  errors,
  setValue,
}: NewInstitutionWizardIdentityStepProps) {
  const { t } = useTranslation('features.admin')
  const [isSlugTouched, setIsSlugTouched] = useState(false)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FieldInput
              id="new-inst-name"
              label={t('wizard.identity.name')}
              value={field.value}
              onValueChange={(name) => {
                field.onChange(name)
                if (!isSlugTouched) {
                  setValue('slug', slugifyInstitutionName(name))
                }
              }}
              placeholder={t('form.fields.namePlaceholder')}
            />
          )}
        />
        {errors.name ? (
          <p
            id="new-inst-name-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <FieldInput
              id="new-inst-slug"
              label={t('wizard.identity.slug')}
              value={field.value}
              onValueChange={(slug) => {
                setIsSlugTouched(true)
                field.onChange(slug)
              }}
              placeholder={t('form.fields.slugPlaceholder')}
            />
          )}
        />
        {errors.slug ? (
          <p
            id="new-inst-slug-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.slug.message}
          </p>
        ) : null}
      </div>

      <div className="my-5 space-y-3">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('form.fields.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTION_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                  >
                    {t(`form.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type ? (
          <p
            id="new-inst-type-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.type.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Controller
          name="adminEmail"
          control={control}
          render={({ field }) => (
            <FieldInput
              id="new-inst-admin-email"
              label={t('wizard.identity.adminEmail')}
              type="email"
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('wizard.identity.adminEmailPlaceholder')}
            />
          )}
        />
        {errors.adminEmail ? (
          <p
            id="new-inst-admin-email-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.adminEmail.message}
          </p>
        ) : null}
        <Text
          className="text-muted-foreground"
          size="xxs"
        >
          {t('wizard.identity.adminEmailHint')}
        </Text>
      </div>
    </div>
  )
}

export { NewInstitutionWizardIdentityStep }
