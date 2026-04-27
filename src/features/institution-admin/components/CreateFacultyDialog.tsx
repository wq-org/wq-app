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
  isSubmitting,
  onSubmit,
}: CreateFacultyDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const canSubmit = name.trim().length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('faculties.createDialog.title')}</DialogTitle>
          <DialogDescription>{t('faculties.createDialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FieldInput
            label={t('faculties.createDialog.fields.nameLabel')}
            placeholder={t('faculties.createDialog.fields.namePlaceholder')}
            value={name}
            onValueChange={onNameChange}
            required
          />
          <FieldTextarea
            label={t('faculties.createDialog.fields.descriptionLabel')}
            placeholder={t('faculties.createDialog.fields.descriptionPlaceholder')}
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
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('faculties.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting
              ? t('faculties.createDialog.creating')
              : t('faculties.createDialog.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
