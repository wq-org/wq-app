import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import type { FacultySummary } from '../types/faculty.types'

type FacultySettingsProps = {
  isLoading: boolean
  isSaving: boolean
  loadError: string | null
  selectedFaculty: FacultySummary | null
  draftFacultyName: string
  draftFacultyDescription: string
  hasUnsavedSettingsChanges: boolean
  validationError: string | null
  saveError: string | null
  onFacultyNameChange: (value: string) => void
  onFacultyDescriptionChange: (value: string) => void
  onSaveChanges: () => void
}

export function FacultySettings({
  isLoading,
  isSaving,
  loadError,
  selectedFaculty,
  draftFacultyName,
  draftFacultyDescription,
  hasUnsavedSettingsChanges,
  validationError,
  saveError,
  onFacultyNameChange,
  onFacultyDescriptionChange,
  onSaveChanges,
}: FacultySettingsProps) {
  const { t } = useTranslation('features.institution-admin')

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner
          variant="gray"
          size="sm"
          speed={1750}
        />
      </div>
    )
  }

  if (loadError) {
    return (
      <Text
        as="p"
        variant="small"
        color="danger"
      >
        {loadError}
      </Text>
    )
  }

  if (!selectedFaculty) {
    return (
      <Text
        as="p"
        variant="body"
        color="muted"
      >
        {t('faculties.pages.facultyProgrammes.facultyNotFound')}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl border bg-card p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col gap-4">
        <FieldInput
          label={t('faculties.pages.facultyProgrammes.settings.fields.nameLabel')}
          value={draftFacultyName}
          onValueChange={onFacultyNameChange}
          placeholder={t('faculties.pages.facultyProgrammes.settings.fields.namePlaceholder')}
        />
        <FieldTextarea
          label={t('faculties.pages.facultyProgrammes.settings.fields.descriptionLabel')}
          value={draftFacultyDescription}
          onValueChange={onFacultyDescriptionChange}
          placeholder={t(
            'faculties.pages.facultyProgrammes.settings.fields.descriptionPlaceholder',
          )}
          rows={4}
        />
      </div>

      {validationError ? (
        <Text
          as="p"
          variant="small"
          color="danger"
        >
          {validationError}
        </Text>
      ) : null}

      {saveError ? (
        <Text
          as="p"
          variant="small"
          color="danger"
        >
          {saveError}
        </Text>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="darkblue"
          onClick={onSaveChanges}
          disabled={!hasUnsavedSettingsChanges || isSaving}
        >
          {isSaving
            ? t('faculties.pages.facultyProgrammes.settings.saving')
            : t('faculties.pages.facultyProgrammes.settings.saveChanges')}
        </Button>
      </div>
    </div>
  )
}
