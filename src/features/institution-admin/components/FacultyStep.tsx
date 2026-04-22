import { useTranslation } from 'react-i18next'

import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { HelpPopover } from './HelpPopover'

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
        <div className="mb-2 flex justify-end">
          <HelpPopover
            title={t('faculties.wizard.help.faculty.title')}
            sectionDefinitionLabel={t('faculties.wizard.help.sectionLabels.definition')}
            sectionExampleLabel={t('faculties.wizard.help.sectionLabels.example')}
            sectionExampleValuesLabel={t('faculties.wizard.help.sectionLabels.exampleValues')}
            sectionReasonLabel={t('faculties.wizard.help.sectionLabels.reason')}
            definition={t('faculties.wizard.help.faculty.definition')}
            exampleTitle={t('faculties.wizard.help.faculty.exampleTitle')}
            exampleValues={
              t('faculties.wizard.help.faculty.exampleValues', {
                returnObjects: true,
              }) as string[]
            }
          />
        </div>
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
