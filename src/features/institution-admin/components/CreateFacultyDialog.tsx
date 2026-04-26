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
import { Text } from '@/components/ui/text'

type CreateFacultyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  validationError: string | null
  submitError: string | null
  isSubmitting: boolean
  onSubmit: () => void
}

export function CreateFacultyDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  validationError,
  submitError,
  isSubmitting,
  onSubmit,
}: CreateFacultyDialogProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.title')}</DialogTitle>
          <DialogDescription>{t('faculties.createSubtitle')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FieldInput
            label={t('faculties.wizard.fields.nameLabel')}
            placeholder={t('faculties.wizard.fields.namePlaceholder')}
            value={name}
            onValueChange={onNameChange}
            required
          />
          <FieldTextarea
            label={t('faculties.wizard.fields.descriptionLabel')}
            placeholder={t('faculties.wizard.fields.descriptionPlaceholder')}
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
            {t('classrooms.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={onSubmit}
            disabled={!!validationError || isSubmitting}
          >
            {isSubmitting ? t('faculties.wizard.actions.finishing') : t('faculties.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
