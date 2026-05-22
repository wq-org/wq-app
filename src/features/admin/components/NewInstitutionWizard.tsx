import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { Spinner } from '@/components/ui/spinner'
import { StepperProgressBarTitles, SuccessDialog } from '@/components/shared'
import { useState } from 'react'
import type {
  BootstrapInstitutionFromWizardResult,
  NewInstitutionWizardValues,
} from '../types/institution.types'
import {
  newInstitutionWizardSchema,
  type NewInstitutionWizardFormValues,
} from '../schemas/institution.schema'
import { NewInstitutionWizardBillingStep } from './NewInstitutionWizardBillingStep'
import { NewInstitutionWizardIdentityStep } from './NewInstitutionWizardIdentityStep'
import { NewInstitutionWizardReviewStep } from './NewInstitutionWizardReviewStep'
import { sendInstitutionAdminInviteEmail } from '../api/institutionApi'

const STEP_COUNT = 3

const STEP_FIELDS: Record<1 | 2, (keyof NewInstitutionWizardFormValues)[]> = {
  1: ['name', 'slug', 'type', 'adminEmail'],
  2: ['legalName', 'billingEmail', 'street', 'streetNumber', 'postalCode', 'city', 'country'],
}

type NewInstitutionWizardProps = {
  onCreate: (values: NewInstitutionWizardValues) => Promise<BootstrapInstitutionFromWizardResult>
  onCancel: () => void
  onFinished: () => void
  /** When set, success dialog primary action navigates here before closing. */
  successRedirectPath?: string
}

function NewInstitutionWizard({
  onCreate,
  onCancel,
  onFinished,
  successRedirectPath,
}: NewInstitutionWizardProps) {
  const { t } = useTranslation('features.admin')
  const [step, setStep] = useState(1)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successAdminEmail, setSuccessAdminEmail] = useState('')

  const {
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewInstitutionWizardFormValues>({
    resolver: zodResolver(newInstitutionWizardSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: '',
      adminEmail: '',
      legalName: '',
      billingEmail: '',
      street: '',
      streetNumber: '',
      postalCode: '',
      city: '',
      country: '',
    },
  })

  async function handleBack() {
    setStep((prev) => Math.max(1, prev - 1))
  }

  async function handleNext() {
    const fields = STEP_FIELDS[step as 1 | 2]
    if (fields) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    setStep((prev) => Math.min(STEP_COUNT, prev + 1))
  }

  const handleCreate = handleSubmit(async (values) => {
    try {
      const result = await onCreate(values as NewInstitutionWizardValues)
      try {
        await sendInstitutionAdminInviteEmail({
          inviteToken: result.inviteToken,
          adminEmail: values.adminEmail,
          institutionName: values.name,
        })
        toast.success(t('wizard.success.emailSentTitle'), {
          description: t('wizard.success.emailSentDescription', {
            email: values.adminEmail.trim(),
          }),
        })
      } catch (emailErr) {
        toast.warning(t('wizard.success.emailSendFailedTitle'), {
          description:
            emailErr instanceof Error ? emailErr.message : t('institutions.toasts.unexpectedError'),
        })
      }
      setSuccessAdminEmail(values.adminEmail.trim())
      setSuccessDialogOpen(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('institutions.toasts.unexpectedError'))
    }
  })

  function handleSuccessDialogOpenChange(open: boolean) {
    setSuccessDialogOpen(open)
    if (!open) {
      onFinished()
    }
  }

  const wizardSteps = [
    { title: t('wizard.steps.identity') },
    { title: t('wizard.steps.billing') },
    { title: t('wizard.steps.review') },
  ] as const

  return (
    <>
      <FieldCard className="w-full max-w-2xl animate-in fade-in-0 slide-in-from-bottom-4 rounded-xl border-border px-0 py-0 shadow-sm">
        <div className="space-y-2 border-b border-border px-6 py-6 animate-in fade-in-0 slide-in-from-left-4">
          <h2 className="leading-none font-semibold">{t('wizard.title')}</h2>
          <p className="max-w-prose text-sm text-muted-foreground text-pretty leading-relaxed">
            {t('wizard.subtitle')}
          </p>

          <div className="mt-4 w-full min-w-0">
            <StepperProgressBarTitles
              steps={wizardSteps}
              value={step}
              defaultValue={1}
              renderContent={() => null}
              className="mx-auto max-w-none space-y-0 **:data-[slot=stepper-panel]:hidden **:data-[slot=stepper-nav]:mb-0"
            />
          </div>
        </div>

        <div className="space-y-4 px-6 py-6 animate-in fade-in-0 slide-in-from-bottom-2">
          {step === 1 ? (
            <NewInstitutionWizardIdentityStep
              control={control}
              errors={errors}
              setValue={setValue}
            />
          ) : null}
          {step === 2 ? (
            <NewInstitutionWizardBillingStep
              control={control}
              errors={errors}
            />
          ) : null}
          {step === 3 ? (
            <NewInstitutionWizardReviewStep values={getValues() as NewInstitutionWizardValues} />
          ) : null}
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={step === 1 ? onCancel : handleBack}
            disabled={isSubmitting}
          >
            {step === 1 ? t('wizard.actions.cancel') : t('wizard.actions.back')}
          </Button>

          {step < STEP_COUNT ? (
            <Button
              type="button"
              variant="darkblue"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {t('wizard.actions.next')}
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="darkblue"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Spinner
                  variant="darkblue"
                  size="xs"
                />
              ) : (
                <ChevronRight className="size-4" />
              )}
              {t('wizard.actions.create')}
            </Button>
          )}
        </div>
      </FieldCard>

      <SuccessDialog
        open={successDialogOpen}
        onOpenChange={handleSuccessDialogOpenChange}
        title={t('wizard.success.title')}
        description={t('wizard.success.description', { email: successAdminEmail })}
        buttonDescription={t('wizard.success.done')}
        path={successRedirectPath}
        showConfetti
      />
    </>
  )
}

export { NewInstitutionWizard }
