import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InstitutionType, NewInstitutionWizardValues } from '../types/institution.types'

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
        <Input
          id="new-inst-name"
          value={values.name}
          onChange={(e) => {
            const name = e.target.value
            onChange({
              name,
              ...(isSlugTouched ? {} : { slug: slugify(name) }),
            })
          }}
          placeholder={t('form.fields.namePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-inst-slug">{t('wizard.identity.slug')}</Label>
        <Input
          id="new-inst-slug"
          value={values.slug}
          onChange={(e) => {
            setIsSlugTouched(true)
            onChange({ slug: e.target.value })
          }}
          placeholder={t('form.fields.slugPlaceholder')}
        />
      </div>

      <div className="space-y-2">
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
        <Input
          id="new-inst-admin-email"
          type="email"
          value={values.adminEmail}
          onChange={(e) => onChange({ adminEmail: e.target.value })}
          placeholder={t('wizard.identity.adminEmailPlaceholder')}
        />
        <p className="text-xs text-muted-foreground">{t('wizard.identity.adminEmailHint')}</p>
      </div>
    </div>
  )
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export { NewInstitutionWizardIdentityStep }
