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

type CreateClassGroupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  facultyOptions: readonly Option[]
  programmeOptions: readonly Option[]
  cohortOptions: readonly Option[]
  facultyId: string
  onFacultyIdChange: (value: string) => void
  programmeId: string
  onProgrammeIdChange: (value: string) => void
  cohortId: string
  onCohortIdChange: (value: string) => void
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  validationError: string | null
  submitError: string | null
  isSubmitting: boolean
  onSubmit: () => void
}

export function CreateClassGroupDialog({
  open,
  onOpenChange,
  facultyOptions,
  programmeOptions,
  cohortOptions,
  facultyId,
  onFacultyIdChange,
  programmeId,
  onProgrammeIdChange,
  cohortId,
  onCohortIdChange,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  validationError,
  submitError,
  isSubmitting,
  onSubmit,
}: CreateClassGroupDialogProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.pages.classGroups.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.classGroups.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>{t('faculties.pages.classGroups.createDialog.facultyLabel')}</Label>
            <Select
              value={facultyId}
              onValueChange={onFacultyIdChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t('faculties.pages.classGroups.createDialog.facultyPlaceholder')}
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
            <Label>{t('faculties.pages.classGroups.createDialog.programmeLabel')}</Label>
            <Select
              value={programmeId}
              onValueChange={onProgrammeIdChange}
              disabled={!facultyId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t('faculties.pages.classGroups.createDialog.programmePlaceholder')}
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
          <div className="grid gap-2">
            <Label>{t('faculties.pages.classGroups.createDialog.cohortLabel')}</Label>
            <Select
              value={cohortId}
              onValueChange={onCohortIdChange}
              disabled={!programmeId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t('faculties.pages.classGroups.createDialog.cohortPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {cohortOptions.map((cohort) => (
                  <SelectItem
                    key={cohort.id}
                    value={cohort.id}
                  >
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FieldInput
            label={t('faculties.pages.classGroups.createDialog.titleLabel')}
            placeholder={t('faculties.pages.classGroups.createDialog.titlePlaceholder')}
            value={name}
            onValueChange={onNameChange}
            required
          />
          <FieldTextarea
            label={t('faculties.pages.classGroups.createDialog.descriptionLabel')}
            placeholder={t('faculties.pages.classGroups.createDialog.descriptionPlaceholder')}
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
            {t('faculties.pages.classGroups.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={onSubmit}
            disabled={!!validationError || isSubmitting}
          >
            {isSubmitting
              ? t('faculties.pages.classGroups.createDialog.creating')
              : t('faculties.pages.classGroups.createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
