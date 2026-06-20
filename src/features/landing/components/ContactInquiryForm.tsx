import { useMemo, useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DatePickerInput } from '@/components/shared/date-time/DatePickerInput'
import { QuantityStepper } from '@/components/shared/inputs/QuantityStepper'

import { StepperProgressBarTitles } from '@/components/shared/steppers/StepperProgressBarTitles'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { CONTACT_INQUIRY_STEP_FIELDS } from '@/features/landing/constants/contact-inquiry-steps'
import {
  EXISTING_SYSTEM_KEYS,
  EXISTING_SYSTEM_OTHER_KEY,
  INSTITUTION_TYPE_KEYS,
  type ExistingSystemKey,
} from '@/features/landing/constants/contact-inquiry-options'
import { useContactInquiryForm } from '@/features/landing/hooks/useContactInquiryForm'

type ContactInquiryFormProps = {
  onInquirySuccess?: () => void
  onInquiryError?: (message: string) => void
}

export function ContactInquiryForm({ onInquirySuccess, onInquiryError }: ContactInquiryFormProps) {
  const { t } = useTranslation('navigation')
  const [currentStep, setCurrentStep] = useState(1)
  const {
    control,
    watch,
    trigger,
    setValue,
    onSubmit,
    formState: { errors, isSubmitting },
  } = useContactInquiryForm({
    onSuccess: () => setCurrentStep(1),
    onSubmitSuccess: onInquirySuccess,
    onSubmitError: onInquiryError,
  })

  const selectedSystems = watch('existingSystems')

  const steps = useMemo(
    () => [
      { title: t('landing.contact.form.steps.institution.title') },
      { title: t('landing.contact.form.steps.contact.title') },
      { title: t('landing.contact.form.steps.scope.title') },
      { title: t('landing.contact.form.steps.systems.title') },
    ],
    [t],
  )

  const handleBeforeStepChange = async (fromStep: number, toStep: number) => {
    if (toStep < fromStep) return true
    return trigger(CONTACT_INQUIRY_STEP_FIELDS[fromStep - 1], { shouldFocus: true })
  }

  return (
    <form
      className="w-full"
      onSubmit={onSubmit}
      noValidate
    >
      <StepperProgressBarTitles
        className="max-w-none space-y-6"
        defaultValue={1}
        onBeforeStepChange={handleBeforeStepChange}
        onValueChange={setCurrentStep}
        renderContent={(_, index) => (
          <div className="w-full">
            {index === 0 ? (
              <InstitutionStep
                control={control}
                errors={errors}
              />
            ) : null}
            {index === 1 ? (
              <ContactPersonStep
                control={control}
                errors={errors}
              />
            ) : null}
            {index === 2 ? (
              <ScopeStep
                control={control}
                errors={errors}
              />
            ) : null}
            {index === 3 ? (
              <ExistingSystemsStep
                control={control}
                errors={errors}
                selectedSystems={selectedSystems}
                setValue={setValue}
              />
            ) : null}
          </div>
        )}
        renderFooter={({ goToPrevious, goToNext, isFirst, isLast }) => (
          <div className="flex items-center justify-between gap-2.5">
            <Button
              disabled={isFirst || isSubmitting}
              onClick={goToPrevious}
              type="button"
              variant="outline"
            >
              {t('landing.contact.form.previous')}
            </Button>
            {isLast ? (
              <Button
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner
                      size="xs"
                      speed={1400}
                    />
                    {t('landing.contact.form.submitting')}
                  </span>
                ) : (
                  t('landing.contact.form.submit')
                )}
              </Button>
            ) : (
              <Button
                disabled={isSubmitting}
                onClick={() => void goToNext()}
                type="button"
                variant="outline"
              >
                {t('landing.contact.form.next')}
              </Button>
            )}
          </div>
        )}
        steps={steps}
        value={currentStep}
      />
    </form>
  )
}

type StepControl = ReturnType<typeof useContactInquiryForm>['control']
type StepErrors = ReturnType<typeof useContactInquiryForm>['formState']['errors']

function InstitutionStep({ control, errors }: { control: StepControl; errors: StepErrors }) {
  const { t } = useTranslation('navigation')
  const isPublicInstitution = useWatch({ control, name: 'isPublicInstitution' }) === 'yes'

  return (
    <div className="flex flex-col gap-4">
      <Controller
        name="institutionName"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <FieldInput
              autoComplete="organization"
              label={t('landing.contact.form.fields.institutionName')}
              onValueChange={field.onChange}
              placeholder={t('landing.contact.form.placeholders.institutionName')}
              required
              showClearButton={false}
              value={field.value}
            />
            <FieldError errors={[fieldState.error ?? errors.institutionName]} />
          </div>
        )}
      />

      <Controller
        name="cityState"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <FieldInput
              autoComplete="address-level2"
              label={t('landing.contact.form.fields.cityState')}
              onValueChange={field.onChange}
              placeholder={t('landing.contact.form.placeholders.cityState')}
              required
              showClearButton={false}
              value={field.value}
            />
            <FieldError errors={[fieldState.error ?? errors.cityState]} />
          </div>
        )}
      />

      <Field data-invalid={!!errors.institutionType}>
        <FieldLabel htmlFor="institution-type">
          {t('landing.contact.form.fields.institutionType')}
        </FieldLabel>
        <Controller
          name="institutionType"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger
                className="w-full"
                id="institution-type"
              >
                <SelectValue placeholder={t('landing.contact.form.placeholders.institutionType')} />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTION_TYPE_KEYS.map((key) => (
                  <SelectItem
                    key={key}
                    value={key}
                  >
                    {t(`landing.contact.form.institutionTypes.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[errors.institutionType]} />
      </Field>

      <Field data-invalid={!!errors.isPublicInstitution}>
        <div className="flex items-center justify-between gap-4">
          <FieldLabel htmlFor="is-public-institution">
            {isPublicInstitution
              ? t('landing.contact.form.fields.publicInstitution')
              : t('landing.contact.form.fields.privateInstitution')}
          </FieldLabel>
          <Controller
            name="isPublicInstitution"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value === 'yes'}
                id="is-public-institution"
                onCheckedChange={(checked) => field.onChange(checked ? 'yes' : 'no')}
              />
            )}
          />
        </div>
        <FieldError errors={[errors.isPublicInstitution]} />
      </Field>
    </div>
  )
}

function ContactPersonStep({ control, errors }: { control: StepControl; errors: StepErrors }) {
  const { t } = useTranslation('navigation')

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Controller
        name="contactName"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <FieldInput
              autoComplete="name"
              label={t('landing.contact.form.fields.contactName')}
              onValueChange={field.onChange}
              placeholder={t('landing.contact.form.placeholders.contactName')}
              required
              showClearButton={false}
              value={field.value}
            />
            <FieldError errors={[fieldState.error ?? errors.contactName]} />
          </div>
        )}
      />

      <Controller
        name="contactRole"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <FieldInput
              autoComplete="organization-title"
              label={t('landing.contact.form.fields.contactRole')}
              onValueChange={field.onChange}
              placeholder={t('landing.contact.form.placeholders.contactRole')}
              required
              showClearButton={false}
              value={field.value}
            />
            <FieldError errors={[fieldState.error ?? errors.contactRole]} />
          </div>
        )}
      />

      <Controller
        name="contactEmail"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <FieldInput
              autoComplete="email"
              label={t('landing.contact.form.fields.contactEmail')}
              onValueChange={field.onChange}
              placeholder={t('landing.contact.form.placeholders.contactEmail')}
              required
              showClearButton={false}
              type="email"
              value={field.value}
            />
            <FieldError errors={[fieldState.error ?? errors.contactEmail]} />
          </div>
        )}
      />

      <Controller
        name="contactPhone"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <FieldInput
              autoComplete="tel"
              label={t('landing.contact.form.fields.contactPhone')}
              onValueChange={field.onChange}
              placeholder={t('landing.contact.form.placeholders.contactPhone')}
              required
              showClearButton={false}
              type="tel"
              value={field.value}
            />
            <FieldError errors={[fieldState.error ?? errors.contactPhone]} />
          </div>
        )}
      />
    </div>
  )
}

function ScopeStep({ control, errors }: { control: StepControl; errors: StepErrors }) {
  const { t } = useTranslation('navigation')

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          name="estimatedLearners"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <FieldLabel>{t('landing.contact.form.fields.estimatedLearners')}</FieldLabel>
              <QuantityStepper
                className="w-full"
                label={t('landing.contact.form.fields.estimatedLearners')}
                min={0}
                onChange={field.onChange}
                value={field.value}
              />
              <FieldError errors={[fieldState.error ?? errors.estimatedLearners]} />
            </div>
          )}
        />

        <Controller
          name="estimatedTeachers"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <FieldLabel>{t('landing.contact.form.fields.estimatedTeachers')}</FieldLabel>
              <QuantityStepper
                className="w-full"
                label={t('landing.contact.form.fields.estimatedTeachers')}
                min={0}
                onChange={field.onChange}
                value={field.value}
              />
              <FieldError errors={[fieldState.error ?? errors.estimatedTeachers]} />
            </div>
          )}
        />
      </div>

      <Controller
        name="desiredStartDate"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <DatePickerInput
              label={t('landing.contact.form.fields.desiredStartDate')}
              onChange={field.onChange}
              placeholder={t('landing.contact.form.placeholders.desiredStartDate')}
              value={field.value}
            />
            <FieldError errors={[fieldState.error ?? errors.desiredStartDate]} />
          </div>
        )}
      />

      <Controller
        name="useCaseDescription"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel htmlFor="use-case-description">
              {t('landing.contact.form.fields.useCaseDescription')}
            </FieldLabel>
            <FieldTextarea
              id="use-case-description"
              onValueChange={field.onChange}
              placeholder={t('landing.contact.form.placeholders.useCaseDescription')}
              rows={4}
              showCounter={false}
              value={field.value}
            />
            <FieldError errors={[fieldState.error ?? errors.useCaseDescription]} />
          </div>
        )}
      />
    </div>
  )
}

function ExistingSystemsStep({
  control,
  errors,
  selectedSystems,
  setValue,
}: {
  control: StepControl
  errors: StepErrors
  selectedSystems: ExistingSystemKey[]
  setValue: ReturnType<typeof useContactInquiryForm>['setValue']
}) {
  const { t } = useTranslation('navigation')
  const showOtherNote = selectedSystems.includes(EXISTING_SYSTEM_OTHER_KEY)

  return (
    <div className="flex flex-col gap-4">
      <Controller
        name="existingSystems"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {EXISTING_SYSTEM_KEYS.map((systemKey) => {
              const isSelected = field.value.includes(systemKey)
              return (
                <Button
                  key={systemKey}
                  onClick={() => {
                    const next = isSelected
                      ? field.value.filter((value) => value !== systemKey)
                      : [...field.value, systemKey]
                    field.onChange(next)
                    if (systemKey === EXISTING_SYSTEM_OTHER_KEY && isSelected) {
                      setValue('existingSystemsOtherNote', '', { shouldValidate: true })
                    }
                  }}
                  size="sm"
                  type="button"
                  variant={isSelected ? 'default' : 'ghost'}
                >
                  {t(`landing.contact.form.existingSystems.${systemKey}`)}
                </Button>
              )
            })}
          </div>
        )}
      />

      {showOtherNote ? (
        <Controller
          name="existingSystemsOtherNote"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <FieldLabel htmlFor="existing-systems-other">
                {t('landing.contact.form.fields.existingSystemsOther')}
              </FieldLabel>
              <FieldTextarea
                id="existing-systems-other"
                onValueChange={field.onChange}
                placeholder={t('landing.contact.form.placeholders.otherSystem')}
                rows={3}
                showCounter={false}
                value={field.value ?? ''}
              />
              <FieldError errors={[fieldState.error ?? errors.existingSystemsOtherNote]} />
            </div>
          )}
        />
      ) : null}

      <FieldError errors={[errors.existingSystems]} />
    </div>
  )
}
