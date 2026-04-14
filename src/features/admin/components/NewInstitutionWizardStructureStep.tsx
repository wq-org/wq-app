import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { NewInstitutionWizardValues } from '../types/institution.types'

type NewInstitutionWizardStructureStepProps = {
  values: NewInstitutionWizardValues
  onChange: (patch: Partial<NewInstitutionWizardValues>) => void
}

function NewInstitutionWizardStructureStep({
  values,
  onChange,
}: NewInstitutionWizardStructureStepProps) {
  const { t } = useTranslation('features.admin')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium leading-none">{t('wizard.structure.toggleLabel')}</p>
          <p className="text-xs text-muted-foreground">{t('wizard.structure.toggleHint')}</p>
        </div>
        <Switch
          checked={values.createInitialStructure}
          onCheckedChange={(checked) =>
            onChange({
              createInitialStructure: checked,
              ...(checked ? {} : { facultyName: '', programmeName: '' }),
            })
          }
          aria-label={t('wizard.structure.toggleLabel')}
        />
      </div>

      {values.createInitialStructure ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-inst-faculty-name">{t('wizard.structure.facultyName')}</Label>
            <Input
              id="new-inst-faculty-name"
              value={values.facultyName}
              onChange={(e) => onChange({ facultyName: e.target.value })}
              placeholder={t('wizard.structure.facultyPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-inst-programme-name">{t('wizard.structure.programmeName')}</Label>
            <Input
              id="new-inst-programme-name"
              value={values.programmeName}
              onChange={(e) => onChange({ programmeName: e.target.value })}
              placeholder={t('wizard.structure.programmePlaceholder')}
            />
            <p className="text-xs text-muted-foreground">{t('wizard.structure.programmeHint')}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { NewInstitutionWizardStructureStep }
