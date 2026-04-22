import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { YearSelectPopover } from './YearSelectPopover'
import { yearRangeInclusive } from '../utils/termCode'

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
  const academicYears = useMemo(() => yearRangeInclusive(1990, 2060), [])

  return (
    <div className="flex w-full flex-col gap-4">
      <Text
        as="p"
        variant="small"
        color="muted"
      >
        {t('faculties.wizard.cohort.intro')}
      </Text>

      <FieldCard className="flex flex-col gap-6">
        <FieldInput
          label={t('faculties.wizard.cohort.nameLabel')}
          placeholder={t('faculties.wizard.cohort.namePlaceholder')}
          value={name}
          onValueChange={onNameChange}
        />

        <div className="flex flex-col gap-2">
          <Label>{t('faculties.wizard.cohort.academicYearLabel')}</Label>

          <YearSelectPopover
            label={t('faculties.wizard.cohort.academicYearLabel')}
            value={academicYear}
            years={academicYears}
            onChange={onAcademicYearChange}
            className="w-full sm:w-48"
          />
        </div>
      </FieldCard>
    </div>
  )
}
