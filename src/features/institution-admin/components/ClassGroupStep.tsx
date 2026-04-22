import { useTranslation } from 'react-i18next'

import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import { HelpPopover } from './HelpPopover'

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

      <div className="flex justify-end">
        <HelpPopover
          title={t('faculties.wizard.help.classGroup.title')}
          sectionDefinitionLabel={t('faculties.wizard.help.sectionLabels.definition')}
          sectionExampleLabel={t('faculties.wizard.help.sectionLabels.example')}
          sectionExampleValuesLabel={t('faculties.wizard.help.sectionLabels.exampleValues')}
          sectionReasonLabel={t('faculties.wizard.help.sectionLabels.reason')}
          definition={t('faculties.wizard.help.classGroup.definition')}
          exampleTitle={t('faculties.wizard.help.classGroup.exampleTitle')}
          exampleValues={
            t('faculties.wizard.help.classGroup.exampleValues', {
              returnObjects: true,
            }) as string[]
          }
        />
      </div>

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
