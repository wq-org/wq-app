import { useTranslation } from 'react-i18next'

import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'

type FacultyStepProps = {
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
}

export function FacultyStep({
  name,
  onNameChange,
  description,
  onDescriptionChange,
}: FacultyStepProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <div className="w-full">
      <FieldCard>
        <FieldInput
          label={t('faculties.wizard.fields.nameLabel')}
          placeholder={t('faculties.wizard.fields.namePlaceholder')}
          value={name}
          onValueChange={onNameChange}
        />
        <FieldTextarea
          label={t('faculties.wizard.fields.descriptionLabel')}
          placeholder={t('faculties.wizard.fields.descriptionPlaceholder')}
          value={description}
          onValueChange={onDescriptionChange}
          rows={3}
        />
      </FieldCard>
    </div>
  )
}
