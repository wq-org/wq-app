import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Text } from '@/components/ui/text'
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
        <FieldInput
          id="new-inst-name"
          label={t('wizard.identity.name')}
          value={values.name}
          onValueChange={(name) => {
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
        <p className="text-xs text-muted-foreground">{t('wizard.identity.adminEmailHint')}</p>
      </div>

      <Alert>
        <Mail className="size-4" />
        <AlertTitle>
          <Text
            as="span"
            variant="small"
            className="font-medium"
          >
            {t('wizard.identity.inviteAlertTitle')}
          </Text>
        </AlertTitle>
        <AlertDescription>
          <Text
            as="span"
            variant="small"
            color="muted"
          >
            {t('wizard.identity.inviteAlertDescription')}
          </Text>
        </AlertDescription>
      </Alert>
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
