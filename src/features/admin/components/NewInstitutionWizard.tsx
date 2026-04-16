import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
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
}

function NewInstitutionWizard({ onCreate, onCancel, onFinished }: NewInstitutionWizardProps) {
  const { t } = useTranslation('features.admin')
  const [step, setStep] = useState(1)
  const [inviteToken, setInviteToken] = useState<string | null>(null)

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
      createInitialStructure: false,
      facultyName: '',
      programmeName: '',
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
      setInviteToken(result.inviteToken)
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('institutions.toasts.unexpectedError'))
    }
  })

  function handleCloseSuccessDialog(open: boolean) {
    if (!open) {
      setInviteToken(null)
      onFinished()
    }
  }

  async function handleCopyInviteToken() {
    if (!inviteToken) return
    try {
      await navigator.clipboard.writeText(inviteToken)
      toast.success(t('wizard.success.tokenCopied'))
    } catch {
      toast.error(t('wizard.success.tokenCopyFailed'))
    }
  }

  return (
    <>
      <FieldCard className="w-full max-w-2xl rounded-xl border-border px-0 py-0 shadow-sm">
        <div className="space-y-2 border-b border-border px-6 py-6">
          <h2 className="leading-none font-semibold">{t('wizard.title')}</h2>
          <p className="max-w-prose text-sm text-muted-foreground text-pretty leading-relaxed">
            {t('wizard.subtitle')}
          </p>

          <div className="mt-4 w-full min-w-0 overflow-x-auto">
            <Stepper
              value={step}
              className="mx-auto flex w-max min-w-full max-w-full flex-nowrap items-center justify-between gap-1 px-0.5 sm:w-full sm:justify-center sm:gap-2"
              orientation="horizontal"
            >
              {[1, 2, 3].map((currentStep) => (
                <StepperItem
                  key={currentStep}
                  step={currentStep}
                  className="shrink-0"
                >
                  <StepperTrigger
                    disabled
                    className="flex-col gap-1 py-1 sm:flex-row sm:gap-2"
                  >
                    <StepperIndicator className="size-8 text-xs sm:size-10 sm:text-sm" />
                    <StepperTitle className="max-w-17 text-center text-[10px] font-medium leading-tight sm:max-w-none sm:inline sm:text-xs">
                      {t(
                        currentStep === 1
                          ? 'wizard.steps.identity'
                          : currentStep === 2
                            ? 'wizard.steps.billing'
                            : 'wizard.steps.review',
                      )}
                    </StepperTitle>
                    <StepperDescription className="sr-only">{currentStep}</StepperDescription>
                  </StepperTrigger>
                  {currentStep < 3 ? (
                    <StepperSeparator className="mx-0.5 min-h-px min-w-3 max-w-6 flex-1 self-center sm:mx-0 sm:min-w-6" />
                  ) : null}
                </StepperItem>
              ))}
            </Stepper>
          </div>
        </div>

        <div className="space-y-4 px-6 py-6">
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
            >
              {isSubmitting ? t('wizard.actions.creating') : t('wizard.actions.create')}
              {!isSubmitting ? <ChevronRight className="size-4" /> : null}
            </Button>
          )}
        </div>
      </FieldCard>

      <Dialog
        open={inviteToken !== null}
        onOpenChange={handleCloseSuccessDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('wizard.success.title')}</DialogTitle>
            <DialogDescription>
              {t('wizard.success.description', { email: getValues('adminEmail') })}
            </DialogDescription>
          </DialogHeader>

          {inviteToken ? (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs break-all">
              {inviteToken}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyInviteToken}
            >
              {t('wizard.success.copyToken')}
            </Button>
            <Button
              type="button"
              variant="darkblue"
              onClick={() => handleCloseSuccessDialog(false)}
            >
              {t('wizard.success.done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { NewInstitutionWizard }
