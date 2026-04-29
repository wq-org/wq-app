import { Check } from 'lucide-react'
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
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'

type Option = {
  id: string
  name: string
  disabled?: boolean
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
  onSuggestTitle: () => void | Promise<void>
  canSuggestTitle: boolean
  isSuggestingTitle: boolean
  syncDescriptionWithSelection: boolean
  onSyncDescriptionWithSelectionChange: (value: boolean) => void
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
  onSuggestTitle,
  canSuggestTitle,
  isSuggestingTitle,
  syncDescriptionWithSelection,
  onSyncDescriptionWithSelectionChange,
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
                    disabled={faculty.disabled}
                  >
                    {faculty.disabled
                      ? `${faculty.name} (${t('faculties.pages.classGroups.createDialog.facultyNoProgrammesSuffix')})`
                      : faculty.name}
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
                    disabled={programme.disabled}
                  >
                    {programme.disabled
                      ? `${programme.name} (${t('faculties.pages.classGroups.createDialog.programmeNoCohortsSuffix')})`
                      : programme.name}
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

          <div className="flex flex-col gap-2">
            <FieldInput
              label={t('faculties.pages.classGroups.createDialog.titleLabel')}
              placeholder={t('faculties.pages.classGroups.createDialog.titlePlaceholder')}
              value={name}
              onValueChange={onNameChange}
              required
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="teal"
                size="sm"
                disabled={!canSuggestTitle || isSuggestingTitle}
                title={
                  !canSuggestTitle
                    ? t('faculties.pages.classGroups.createDialog.noTitleSuggestionAvailable')
                    : undefined
                }
                onClick={() => void onSuggestTitle()}
              >
                {isSuggestingTitle ? (
                  <Spinner
                    variant="teal"
                    size="xs"
                    className="shrink-0"
                  />
                ) : null}
                {t('faculties.pages.classGroups.createDialog.suggestNextTitle')}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="class-group-sync-description"
                className="cursor-pointer text-sm font-normal leading-snug"
              >
                {t('faculties.pages.classGroups.createDialog.syncDescriptionLabel')}
              </Label>
              <Switch
                color="teal"
                id="class-group-sync-description"
                checked={syncDescriptionWithSelection}
                onCheckedChange={onSyncDescriptionWithSelectionChange}
                disabled={!facultyId || !programmeId || !cohortId}
              />
            </div>
          </div>
          <Text
            as="p"
            className="text-sm text-muted-foreground"
          >
            {t('faculties.pages.classGroups.createDialog.syncDescriptionHint')}
          </Text>

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
            aria-busy={isSubmitting}
            aria-label={
              isSubmitting
                ? t('faculties.pages.classGroups.createDialog.creating')
                : t('faculties.pages.classGroups.createDialog.create')
            }
          >
            {isSubmitting ? (
              <Spinner
                variant="darkblue"
                size="xs"
                className="shrink-0"
              />
            ) : (
              <>
                <Check />
                {t('faculties.pages.classGroups.createDialog.create')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
