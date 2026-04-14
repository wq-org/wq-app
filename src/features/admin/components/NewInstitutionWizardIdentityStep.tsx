import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InstitutionType, NewInstitutionWizardValues } from '../types/institution.types'
import { slugifyInstitutionName } from '../utils/institutionSlug'
import { Text } from '@/components/ui/text'

const INSTITUTION_TYPES: InstitutionType[] = [
  'school',
  'university',
  'college',
  'organization',
  'hospital',
  'other',
]

type NewInstitutionWizardIdentityStepProps = {
  values: NewInstitutionWizardValues
  onChange: (patch: Partial<NewInstitutionWizardValues>) => void
}

function NewInstitutionWizardIdentityStep({
  values,
  onChange,
}: NewInstitutionWizardIdentityStepProps) {
  const { t } = useTranslation('features.admin')
  const [isSlugTouched, setIsSlugTouched] = useState(false)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-inst-name">{t('wizard.identity.name')}</Label>
        <FieldInput
          id="new-inst-name"
          label={t('wizard.identity.name')}
          value={values.name}
          onValueChange={(name) => {
            onChange({
              name,
              ...(isSlugTouched ? {} : { slug: slugifyInstitutionName(name) }),
            })
          }}
          placeholder={t('form.fields.namePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-inst-slug">{t('wizard.identity.slug')}</Label>
        <FieldInput
          id="new-inst-slug"
          label={t('wizard.identity.slug')}
          value={values.slug}
          onValueChange={(slug) => {
            setIsSlugTouched(true)
            onChange({ slug })
          }}
          placeholder={t('form.fields.slugPlaceholder')}
        />
      </div>

      <div className="my-5 space-y-3">
        <Label>{t('wizard.identity.type')}</Label>
        <Select
          value={values.type || undefined}
          onValueChange={(type) => onChange({ type: type as InstitutionType })}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-inst-admin-email">{t('wizard.identity.adminEmail')}</Label>
        <FieldInput
          id="new-inst-admin-email"
          label={t('wizard.identity.adminEmail')}
          type="email"
          value={values.adminEmail}
          onValueChange={(adminEmail) => onChange({ adminEmail })}
          placeholder={t('wizard.identity.adminEmailPlaceholder')}
        />
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
