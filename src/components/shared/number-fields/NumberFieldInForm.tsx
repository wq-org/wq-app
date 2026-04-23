'use client'

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { CircleAlertIcon } from 'lucide-react'

type NumberFieldInFormProps = {
  label?: string
  defaultAmount?: number
  inputMin?: number
  inputMax?: number
  validationMin?: number
  validationMax?: number
  submitToastTitle?: string
  submitToastDescription?: string | ((amount: number) => string)
}

function buildFormSchema(validationMin: number, validationMax: number) {
  return z.object({
    amount: z
      .number({
        message: 'Amount must be a number.',
      })
      .min(validationMin, {
        message: `Amount must be at least ${validationMin}.`,
      })
      .max(validationMax, {
        message: `Amount must be at most ${validationMax}.`,
      }),
  })
}

export function NumberFieldInForm({
  label = 'Amount',
  defaultAmount = 5,
  inputMin = 0,
  inputMax = 100,
  validationMin = 10,
  validationMax = 100,
  submitToastTitle = 'Form submitted',
  submitToastDescription = (amount: number) =>
    `Your form has successfully submitted with amount: ${amount}`,
}: NumberFieldInFormProps) {
  const formSchema = buildFormSchema(validationMin, validationMax)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: defaultAmount,
    },
    mode: 'onChange',
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    const descriptionText =
      typeof submitToastDescription === 'function'
        ? submitToastDescription(data.amount)
        : submitToastDescription

    toast.success(submitToastTitle, {
      description: (
        <Alert variant="default">
          <CircleAlertIcon />
          <AlertDescription>{descriptionText}</AlertDescription>
        </Alert>
      ),
    })

    form.reset()
  }

  return (
    <div className="w-full max-w-68">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="number-field-amount">{label}</FieldLabel>
                    <NumberField
                      id="number-field-amount"
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      min={inputMin}
                      max={inputMax}
                    >
                      <NumberFieldGroup
                        className="rounded-lg"
                        aria-invalid={!!form.formState.errors.amount}
                      >
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldGroup>
                    </NumberField>
                    <FieldDescription>
                      Enter an amount between {validationMin} and {validationMax}.
                    </FieldDescription>
                    {fieldState.error && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Submit
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
