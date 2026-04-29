import { useTranslation } from 'react-i18next'

import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { AcademicYearCombobox } from './AcademicYearCombobox'
import { HelpPopover } from './HelpPopover'

type CohortStepProps = {
  name: string
  onNameChange: (value: string) => void
  academicYear: number
  onAcademicYearChange: (value: number) => void
}

export function CohortStep({
  name,
  onNameChange,
  academicYear,
  onAcademicYearChange,
}: CohortStepProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <div className="flex w-full flex-col gap-4">
      <Text
        as="p"
        variant="small"
        color="muted"
      >
        {t('faculties.wizard.cohort.intro')}
      </Text>

      <div className="flex justify-end">
        <HelpPopover
          title={t('faculties.wizard.help.cohort.title')}
          sectionDefinitionLabel={t('faculties.wizard.help.sectionLabels.definition')}
          sectionExampleLabel={t('faculties.wizard.help.sectionLabels.example')}
          sectionExampleValuesLabel={t('faculties.wizard.help.sectionLabels.exampleValues')}
          sectionReasonLabel={t('faculties.wizard.help.sectionLabels.reason')}
          definition={t('faculties.wizard.help.cohort.definition')}
          exampleTitle={t('faculties.wizard.help.cohort.exampleTitle')}
          exampleValues={
            t('faculties.wizard.help.cohort.exampleValues', {
              returnObjects: true,
            }) as string[]
          }
        />
      </div>

      <FieldCard className="flex flex-col gap-6">
        <FieldInput
          label={t('faculties.wizard.cohort.nameLabel')}
          placeholder={t('faculties.wizard.cohort.namePlaceholder')}
          value={name}
          onValueChange={onNameChange}
        />

        <div className="flex flex-col gap-2">
          <Label>{t('faculties.wizard.cohort.academicYearLabel')}</Label>

          <AcademicYearCombobox
            value={academicYear}
            onValueChange={onAcademicYearChange}
            placeholder={t('faculties.wizard.cohort.academicYearPlaceholder')}
            className="sm:w-48"
          />
        </div>
      </FieldCard>
    </div>
  )
}
