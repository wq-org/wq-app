import { useState } from 'react'
import { Archive } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
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
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)

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

      <div className="flex w-full flex-wrap items-center justify-end gap-3">
        <HoldToDeleteButton
          variant="orange"
          className="inline-flex h-9 max-w-full shrink-0 self-center"
          icon={
            <Archive
              className="size-5 shrink-0"
              aria-hidden
            />
          }
          disabled={isSaving}
          onDelete={() => setArchiveDialogOpen(true)}
        >
          {t('faculties.pages.facultyProgrammes.settings.archiveHoldLabel')}
        </HoldToDeleteButton>
        <Button
          type="button"
          variant="darkblue"
          className="h-9 shrink-0 self-center"
          onClick={onSaveChanges}
          disabled={!hasUnsavedSettingsChanges || isSaving}
        >
          {isSaving
            ? t('faculties.pages.facultyProgrammes.settings.saving')
            : t('faculties.pages.facultyProgrammes.settings.saveChanges')}
        </Button>
      </div>

      <Dialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>
              {t('faculties.pages.facultyProgrammes.settings.archiveDialogTitle')}
            </DialogTitle>
            <DialogDescription className="text-pretty whitespace-pre-line">
              {t('faculties.pages.facultyProgrammes.settings.archiveDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setArchiveDialogOpen(false)}
            >
              {t('faculties.pages.facultyProgrammes.settings.archiveDialogCancel')}
            </Button>
            <Button
              type="button"
              variant="orange"
              onClick={() => setArchiveDialogOpen(false)}
            >
              {t('faculties.pages.facultyProgrammes.settings.archiveDialogConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
