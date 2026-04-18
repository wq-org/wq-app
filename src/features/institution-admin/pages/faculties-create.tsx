import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { FieldCard } from '@/components/ui/field-card'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { StepperProgressBarTitles } from '@/components/shared'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

/** Bump when adding wizard steps (overview, programmes, …). */
const WIZARD_STEP_COUNT = 1

export function InstitutionFacultiesCreate() {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const [wizardStep, setWizardStep] = useState(1)
  const [nameField, setNameField] = useState('')
  const [descriptionField, setDescriptionField] = useState('')

  const wizardSteps = useMemo(() => [{ title: t('faculties.wizard.steps.details') }] as const, [t])

  const handleBackToFaculties = () => {
    navigate('/institution_admin/faculties')
  }

  function handleWizardPrevious() {
    setWizardStep((prev) => Math.max(1, prev - 1))
  }

  function handleWizardNext() {
    setWizardStep((prev) => Math.min(WIZARD_STEP_COUNT, prev + 1))
  }

  function handleFinish() {
    // Submit / API wiring can be added here
  }

  const renderWizardStep = () => {
    return (
      <div className="w-full ">
        <FieldCard className="">
          <FieldInput
            label={t('faculties.wizard.fields.nameLabel')}
            placeholder={t('faculties.wizard.fields.namePlaceholder')}
            value={nameField}
            onValueChange={setNameField}
          />

          <FieldTextarea
            label={t('faculties.wizard.fields.descriptionLabel')}
            placeholder={t('faculties.wizard.fields.descriptionPlaceholder')}
            value={descriptionField}
            onValueChange={setDescriptionField}
            rows={5}
          />
        </FieldCard>
      </div>
    )
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-2 pb-12 pt-4">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            type="button"
            className="w-fit gap-2 px-0"
            onClick={handleBackToFaculties}
          >
            <ArrowLeft className="size-4" />
            {t('faculties.wizard.backToList')}
          </Button>
          <div>
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-bold"
            >
              {t('faculties.create')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.createSubtitle')}
            </Text>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
          <StepperProgressBarTitles
            steps={wizardSteps}
            value={wizardStep}
            defaultValue={1}
            onValueChange={setWizardStep}
            className="mx-auto max-w-4xl space-y-8"
            renderContent={renderWizardStep}
          />

          <div
            className={
              WIZARD_STEP_COUNT > 1
                ? 'mx-auto flex w-full max-w-4xl flex-wrap justify-between gap-3 border-t border-border pt-6'
                : 'mx-auto flex w-full max-w-4xl justify-end gap-3 border-t border-border pt-6'
            }
          >
            {WIZARD_STEP_COUNT > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleWizardPrevious}
                disabled={wizardStep <= 1}
              >
                {t('faculties.wizard.actions.previous')}
              </Button>
            ) : null}

            {wizardStep < WIZARD_STEP_COUNT ? (
              <Button
                type="button"
                variant="darkblue"
                onClick={handleWizardNext}
              >
                {t('faculties.wizard.actions.next')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="darkblue"
                onClick={handleFinish}
              >
                {t('faculties.wizard.actions.finish')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
