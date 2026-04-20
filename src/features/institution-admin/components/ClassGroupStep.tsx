import { useTranslation } from 'react-i18next'

import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'

type ClassGroupStepProps = {
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
}

export function ClassGroupStep({
  name,
  onNameChange,
  description,
  onDescriptionChange,
}: ClassGroupStepProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <div className="flex w-full flex-col gap-4">
      <Text
        as="p"
        variant="small"
        color="muted"
      >
        {t('faculties.wizard.classGroup.intro')}
      </Text>

      <FieldCard className="flex flex-col gap-6">
        <FieldInput
          label={t('faculties.wizard.classGroup.nameLabel')}
          placeholder={t('faculties.wizard.classGroup.namePlaceholder')}
          value={name}
          onValueChange={onNameChange}
        />
        <FieldTextarea
          label={t('faculties.wizard.classGroup.descriptionLabel')}
          placeholder={t('faculties.wizard.classGroup.descriptionPlaceholder')}
          value={description}
          onValueChange={onDescriptionChange}
          rows={3}
        />
      </FieldCard>
    </div>
  )
}
