import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { Control, FieldErrors } from 'react-hook-form'
import type { NewInstitutionWizardFormValues } from '../schemas/institution.schema'

type NewInstitutionWizardStructureStepProps = {
  control: Control<NewInstitutionWizardFormValues>
  errors: FieldErrors<NewInstitutionWizardFormValues>
}

function NewInstitutionWizardStructureStep({
  control,
  errors,
}: NewInstitutionWizardStructureStepProps) {
  const { t } = useTranslation('features.admin')

  return (
    <Controller
      name="createInitialStructure"
      control={control}
      render={({ field: structureField }) => (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">
                {t('wizard.structure.toggleLabel')}
              </p>
              <p className="text-xs text-muted-foreground">{t('wizard.structure.toggleHint')}</p>
            </div>
            <Switch
              checked={structureField.value}
              onCheckedChange={structureField.onChange}
              aria-label={t('wizard.structure.toggleLabel')}
            />
          </div>

          {structureField.value ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-inst-faculty-name">{t('wizard.structure.facultyName')}</Label>
                <Controller
                  name="facultyName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="new-inst-faculty-name"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('wizard.structure.facultyPlaceholder')}
                    />
                  )}
                />
                {errors.facultyName ? (
                  <p
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.facultyName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-inst-programme-name">
                  {t('wizard.structure.programmeName')}
                </Label>
                <Controller
                  name="programmeName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="new-inst-programme-name"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('wizard.structure.programmePlaceholder')}
                    />
                  )}
                />
                {errors.programmeName ? (
                  <p
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.programmeName.message}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {t('wizard.structure.programmeHint')}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    />
  )
}

export { NewInstitutionWizardStructureStep }
