import * as React from 'react'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { getSoftToneRadioItemClasses, type RadioTone } from './radio-tone'

export interface SoftToneRadioOption {
  value: string
  label: string
  id?: string
  disabled?: boolean
}

interface SoftToneRadioGroupProps
  extends Omit<React.ComponentProps<typeof RadioGroup>, 'children'> {
  options: SoftToneRadioOption[]
  tone?: RadioTone
  itemClassName?: string
  labelClassName?: string
}

export function SoftToneRadioGroup({
  options,
  tone = 'blue',
  className,
  itemClassName,
  labelClassName,
  ...props
}: SoftToneRadioGroupProps) {
  return (
    <RadioGroup
      className={cn('flex items-center gap-3', className)}
      {...props}
    >
      {options.map((option) => {
        const inputId = option.id ?? `soft-tone-radio-${option.value}`

        return (
          <div
            key={option.value}
            className="flex items-center space-x-2"
          >
            <RadioGroupItem
              id={inputId}
              value={option.value}
              disabled={option.disabled}
              className={cn(getSoftToneRadioItemClasses(tone), itemClassName)}
            />
            <Label
              htmlFor={inputId}
              className={cn(option.disabled && 'opacity-50', labelClassName)}
            >
              {option.label}
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}
