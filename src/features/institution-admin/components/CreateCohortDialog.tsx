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

type Option = {
  id: string
  name: string
}

type CreateCohortDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  facultyOptions: readonly Option[]
  programmeOptions: readonly Option[]
  facultyId: string
  onFacultyIdChange: (value: string) => void
  programmeId: string
  onProgrammeIdChange: (value: string) => void
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  academicYear: string
  onAcademicYearChange: (value: string) => void
  validationError: string | null
  submitError: string | null
  isSubmitting: boolean
  onSubmit: () => void
}

export function CreateCohortDialog({
  open,
  onOpenChange,
  facultyOptions,
  programmeOptions,
  facultyId,
  onFacultyIdChange,
  programmeId,
  onProgrammeIdChange,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  academicYear,
  onAcademicYearChange,
  validationError,
  submitError,
  isSubmitting,
  onSubmit,
}: CreateCohortDialogProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.pages.cohorts.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.cohorts.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>{t('faculties.pages.cohorts.createDialog.facultyLabel')}</Label>
            <Select
              value={facultyId}
              onValueChange={onFacultyIdChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t('faculties.pages.cohorts.createDialog.facultyPlaceholder')}
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
          </div>
          <div className="grid gap-2">
            <Label>{t('faculties.pages.cohorts.createDialog.programmeLabel')}</Label>
            <Select
              value={programmeId}
              onValueChange={onProgrammeIdChange}
              disabled={!facultyId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t('faculties.pages.cohorts.createDialog.programmePlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {programmeOptions.map((programme) => (
                  <SelectItem
                    key={programme.id}
                    value={programme.id}
                  >
                    {programme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FieldInput
            label={t('faculties.pages.cohorts.createDialog.titleLabel')}
            placeholder={t('faculties.pages.cohorts.createDialog.titlePlaceholder')}
            value={name}
            onValueChange={onNameChange}
            required
          />
          <FieldTextarea
            label={t('faculties.pages.cohorts.createDialog.descriptionLabel')}
            placeholder={t('faculties.pages.cohorts.createDialog.descriptionPlaceholder')}
            value={description}
            onValueChange={onDescriptionChange}
            rows={3}
          />
          <FieldInput
            label={t('faculties.pages.cohorts.createDialog.academicYearLabel')}
            placeholder={t('faculties.pages.cohorts.createDialog.academicYearPlaceholder')}
            value={academicYear}
            onValueChange={onAcademicYearChange}
            required
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
            {t('faculties.pages.cohorts.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={onSubmit}
            disabled={!!validationError || isSubmitting}
          >
            {isSubmitting
              ? t('faculties.pages.cohorts.createDialog.creating')
              : t('faculties.pages.cohorts.createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
