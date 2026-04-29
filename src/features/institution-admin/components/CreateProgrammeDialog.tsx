import { useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Text } from '@/components/ui/text'
import { buildSuggestedProgrammeDescription } from '../utils/programmeDescription'
import { PROGRAMME_DURATION_YEAR_OPTIONS } from '../utils/programmeDurationYears'
import { YearSelectPopover } from './YearSelectPopover'

type FacultyOption = {
  id: string
  name: string
}

export type CreateProgrammeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  facultyOptions: readonly FacultyOption[]
  facultyId: string
  onFacultyIdChange: (value: string) => void
  /** When true, faculty is fixed (e.g. faculty programmes page); shows read-only label instead of Select. */
  facultyReadOnly?: boolean
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  durationYears: number | null
  onDurationYearsChange: (value: number) => void
  validationError: string | null
  submitError: string | null
  isSubmitting: boolean
  onSubmit: () => void
}

export function CreateProgrammeDialog({
  open,
  onOpenChange,
  facultyOptions,
  facultyId,
  onFacultyIdChange,
  facultyReadOnly = false,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  durationYears,
  onDurationYearsChange,
  validationError,
  submitError,
  isSubmitting,
  onSubmit,
}: CreateProgrammeDialogProps) {
  const { t, i18n } = useTranslation('features.institution-admin')
  const resolvedFacultyName =
    facultyOptions.find((option) => option.id === facultyId)?.name ??
    t('faculties.pages.programmes.createDialog.facultyPlaceholder')
  const canSubmit = name.trim().length > 0 && facultyId.length > 0

  useEffect(() => {
    const trimmedName = name.trim()
    if (!trimmedName || !facultyId) return

    const timeoutId = window.setTimeout(() => {
      onDescriptionChange(
        buildSuggestedProgrammeDescription({
          language: i18n.language,
          programmeName: trimmedName,
          facultyName: resolvedFacultyName,
          durationYears,
        }),
      )
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [name, durationYears, resolvedFacultyName, i18n.language, onDescriptionChange])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.pages.programmes.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.programmes.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>{t('faculties.pages.programmes.createDialog.facultyLabel')}</Label>
            {facultyReadOnly ? (
              <Text
                as="p"
                variant="body"
                className="rounded-md border border-border bg-muted/40 px-3 py-2"
              >
                {resolvedFacultyName}
              </Text>
            ) : (
              <Select
                value={facultyId}
                onValueChange={onFacultyIdChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t('faculties.pages.programmes.createDialog.facultyPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {facultyOptions.map((faculty) => (
                    <SelectItem
                      key={faculty.id}
                      value={faculty.id}
                    >
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid gap-2">
            <Label>{t('faculties.pages.programmes.createDialog.durationYearsLabel')}</Label>
            <YearSelectPopover
              label={t('faculties.pages.programmes.createDialog.durationYearsLabel')}
              placeholder={t('faculties.pages.programmes.createDialog.durationYearsPlaceholder')}
              value={durationYears}
              years={PROGRAMME_DURATION_YEAR_OPTIONS}
              onChange={onDurationYearsChange}
              className="w-full sm:w-48"
            />
          </div>
          <FieldInput
            label={t('faculties.pages.programmes.createDialog.titleLabel')}
            placeholder={t('faculties.pages.programmes.createDialog.titlePlaceholder')}
            value={name}
            onValueChange={onNameChange}
            required
          />
          <FieldTextarea
            label={t('faculties.pages.programmes.createDialog.descriptionLabel')}
            placeholder={t('faculties.pages.programmes.createDialog.descriptionPlaceholder')}
            value={description}
            onValueChange={onDescriptionChange}
            rows={3}
          />
          {validationError ? (
            <Text
              as="p"
              variant="small"
              color="danger"
            >
              {validationError}
            </Text>
          ) : null}
          {submitError ? (
            <Text
              as="p"
              variant="small"
              color="danger"
            >
              {submitError}
            </Text>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('faculties.pages.programmes.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={onSubmit}
            disabled={!canSubmit || !!validationError || isSubmitting}
          >
            {isSubmitting
              ? t('faculties.pages.programmes.createDialog.creating')
              : t('faculties.pages.programmes.createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
