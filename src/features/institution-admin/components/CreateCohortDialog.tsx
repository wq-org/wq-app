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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { AcademicYearCombobox } from './AcademicYearCombobox'

type Option = {
  id: string
  name: string
  disabled?: boolean
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
  academicYear: number
  onAcademicYearChange: (value: number) => void
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  syncTitleWithProgramme: boolean
  onSyncTitleWithProgrammeChange: (value: boolean) => void
  descriptiveTitle: boolean
  onDescriptiveTitleChange: (value: boolean) => void
  syncDescriptionWithProgramme: boolean
  onSyncDescriptionWithProgrammeChange: (value: boolean) => void
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
  academicYear,
  onAcademicYearChange,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  syncTitleWithProgramme,
  onSyncTitleWithProgrammeChange,
  descriptiveTitle,
  onDescriptiveTitleChange,
  syncDescriptionWithProgramme,
  onSyncDescriptionWithProgrammeChange,
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
      <DialogContent className="flex h-[80vh] max-h-[80vh] flex-col gap-4 overflow-hidden sm:max-w-xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('faculties.pages.cohorts.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('faculties.pages.cohorts.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1 pr-3">
          <div className="grid gap-4 pb-1">
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
                      disabled={faculty.disabled}
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

            <div className="grid gap-2">
              <Label>{t('faculties.pages.cohorts.createDialog.academicYearLabel')}</Label>
              <AcademicYearCombobox
                value={academicYear}
                onValueChange={onAcademicYearChange}
                placeholder={t('faculties.pages.cohorts.createDialog.academicYearPlaceholder')}
                className="w-full max-w-full"
              />
              <Text
                as="p"
                className="text-sm text-muted-foreground"
              >
                {t('faculties.pages.cohorts.createDialog.academicYearHint')}
              </Text>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="cohort-sync-title"
                  className="cursor-pointer text-sm font-normal leading-snug"
                >
                  {t('faculties.pages.cohorts.createDialog.syncTitleLabel')}
                </Label>
                <Switch
                  color="teal"
                  id="cohort-sync-title"
                  checked={syncTitleWithProgramme}
                  onCheckedChange={onSyncTitleWithProgrammeChange}
                  disabled={!programmeId}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="cohort-descriptive-title"
                  className="cursor-pointer text-sm font-normal leading-snug"
                >
                  {t('faculties.pages.cohorts.createDialog.descriptiveTitleLabel')}
                </Label>
                <Switch
                  color="teal"
                  id="cohort-descriptive-title"
                  checked={descriptiveTitle}
                  onCheckedChange={onDescriptiveTitleChange}
                  disabled={!programmeId || !syncTitleWithProgramme}
                />
              </div>
            </div>

            <FieldInput
              label={t('faculties.pages.cohorts.createDialog.titleLabel')}
              placeholder={t('faculties.pages.cohorts.createDialog.titlePlaceholder')}
              value={name}
              onValueChange={onNameChange}
              required
            />

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
              <Label
                htmlFor="cohort-sync-description"
                className="cursor-pointer text-sm font-normal leading-snug"
              >
                {t('faculties.pages.cohorts.createDialog.syncDescriptionLabel')}
              </Label>
              <Switch
                color="teal"
                id="cohort-sync-description"
                checked={syncDescriptionWithProgramme}
                onCheckedChange={onSyncDescriptionWithProgrammeChange}
                disabled={!facultyId || !programmeId}
              />
            </div>
            <Text
              as="p"
              className="text-sm text-muted-foreground"
            >
              {t('faculties.pages.cohorts.createDialog.syncDescriptionHint')}
            </Text>

            <FieldTextarea
              label={t('faculties.pages.cohorts.createDialog.descriptionLabel')}
              placeholder={t('faculties.pages.cohorts.createDialog.descriptionPlaceholder')}
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
        </ScrollArea>
        <DialogFooter className="shrink-0">
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
