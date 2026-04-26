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
import { YearSelectPopover } from './YearSelectPopover'

type FacultyOption = {
  id: string
  name: string
}

type CreateProgrammDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  facultyOptions: readonly FacultyOption[]
  facultyId: string
  onFacultyIdChange: (value: string) => void
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  durationYears: number
  onDurationYearsChange: (value: number) => void
  validationError: string | null
  submitError: string | null
  isSubmitting: boolean
  onSubmit: () => void
}

export function CreateProgrammDialog({
  open,
  onOpenChange,
  facultyOptions,
  facultyId,
  onFacultyIdChange,
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
}: CreateProgrammDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const durationOptions = [1, 2, 3, 4, 5, 6] as const

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
          <div className="grid gap-2">
            <Label>{t('faculties.pages.programmes.createDialog.durationYearsLabel')}</Label>
            <YearSelectPopover
              label={t('faculties.pages.programmes.createDialog.durationYearsLabel')}
              value={durationYears}
              years={durationOptions}
              onChange={onDurationYearsChange}
              className="w-full sm:w-48"
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
            disabled={!!validationError || isSubmitting}
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
