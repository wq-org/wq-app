import type { ReactNode, SVGProps } from 'react'

import { Field, FieldLabel, FieldTitle } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'

const VisaIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      d="M9.5 8L7 16H5L3 8H5L6.25 13.5L8 8H9.5ZM11 8H12.5V16H11V8ZM16.5 10.5C16.5 9.7 15.8 9.2 14.8 9.2C14 9.2 13.3 9.5 12.8 10L12 9C12.8 8.3 13.8 8 15 8C16.8 8 18 9 18 10.5C18 13.5 14 12.5 14 14.2C14 14.8 14.5 15 15.2 15C16 15 16.7 14.7 17.2 14.2L18 15.2C17.2 15.9 16.2 16.2 15 16.2C13.5 16.2 12.5 15.3 12.5 14C12.5 11.2 16.5 12 16.5 10.5ZM21 16H19.5L22 8H23.5L21 16Z"
      fill="#1A1F71"
    />
  </svg>
)

const MastercardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <circle
      cx="9"
      cy="12"
      r="5"
      fill="#EB001B"
    />
    <circle
      cx="15"
      cy="12"
      r="5"
      fill="#F79E1B"
    />
    <path
      d="M12 15.5C13.2 14.5 14 13.3 14 12C14 10.7 13.2 9.5 12 8.5C10.8 9.5 10 10.7 10 12C10 13.3 10.8 14.5 12 15.5Z"
      fill="#FF5F00"
    />
  </svg>
)

export type PaymentMethodRadioCardOption = {
  value: string
  id: string
  title: string
  description?: string
  icon?: ReactNode
}

export type PaymentMethodRadioCardsProps = {
  options?: readonly PaymentMethodRadioCardOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  addNewValue?: string
  addNewId?: string
  addNewLabel?: string
  showAddNewOption?: boolean
  className?: string
}

const defaultOptions: readonly PaymentMethodRadioCardOption[] = [
  {
    value: 'visa',
    id: 'pay-visa',
    title: 'Visa ending in 4242',
    description: 'Expires 12/26',
    icon: <VisaIcon className="size-full" />,
  },
  {
    value: 'mastercard',
    id: 'pay-mc',
    title: 'Mastercard ending in 8888',
    description: 'Expires 09/25',
    icon: <MastercardIcon className="size-full" />,
  },
] as const

export function PaymentMethodRadioCards({
  options = defaultOptions,
  value,
  defaultValue,
  onValueChange,
  addNewValue = 'new',
  addNewId = 'pay-new',
  addNewLabel = 'Add new payment method',
  showAddNewOption = true,
  className,
}: PaymentMethodRadioCardsProps) {
  const resolvedDefaultValue = defaultValue ?? options[0]?.value

  return (
    <div className={cn('mx-auto w-full max-w-xs', className)}>
      <RadioGroup
        value={value}
        defaultValue={resolvedDefaultValue}
        onValueChange={onValueChange}
        className="flex flex-col gap-3"
      >
        {options.map((option) => (
          <FieldLabel
            key={option.id}
            htmlFor={option.id}
            className="relative p-0!"
          >
            <Field orientation="horizontal">
              <div className="absolute top-3 right-3">
                <RadioGroupItem
                  value={option.value}
                  id={option.id}
                />
              </div>
              <FieldTitle className="flex flex-col items-start gap-4!">
                {option.icon ? (
                  <div className="bg-background border-border flex size-10 items-center justify-center rounded-lg border p-1.5 shadow-xs shadow-black/5">
                    {option.icon}
                  </div>
                ) : null}
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-medium">{option.title}</span>
                  {option.description ? (
                    <span className="text-muted-foreground text-xs">{option.description}</span>
                  ) : null}
                </div>
              </FieldTitle>
            </Field>
          </FieldLabel>
        ))}
        {showAddNewOption ? (
          <FieldLabel
            htmlFor={addNewId}
            className="relative p-0!"
          >
            <Field
              orientation="horizontal"
              className="justify-center"
            >
              <RadioGroupItem
                value={addNewValue}
                id={addNewId}
                className="absolute top-3 right-3"
              />
              <FieldTitle className="flex items-center gap-2">
                <PlusIcon
                  aria-hidden="true"
                  className="size-4 opacity-60"
                />
                {addNewLabel}
              </FieldTitle>
            </Field>
          </FieldLabel>
        ) : null}
      </RadioGroup>
    </div>
  )
}
