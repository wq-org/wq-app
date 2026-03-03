import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleCheck, CpuIcon, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  getRadioToneClasses,
  type RadioTone as RadioCardsTone,
  type RadioToneVariant as RadioCardsVariant,
} from './radio-tone'

export interface RadioCardOption {
  value: string
  label: string
  description?: string
  icon?: LucideIcon
  disabled?: boolean
}

interface RadioCardsProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, 'children'> {
  options: RadioCardOption[]
  tone?: RadioCardsTone
  variant?: RadioCardsVariant
  columns?: 1 | 2 | 3 | 4
  itemClassName?: string
}

const gridClasses: Record<NonNullable<RadioCardsProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

export function RadioCards({
  options,
  tone = 'blue',
  variant = 'default',
  columns = 3,
  className,
  itemClassName,
  ...props
}: RadioCardsProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-cards"
      className={cn('grid w-full gap-4', gridClasses[columns], className)}
      {...props}
    >
      {options.map((option) => {
        const Icon = option.icon ?? CpuIcon

        return (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            data-slot="radio-card-item"
            className={cn(
              'group relative rounded-xl px-3 py-3 text-left ring-1 ring-border transition-[box-shadow,color,background,ring-width] duration-200 outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'data-[state=checked]:ring-2',
              getRadioToneClasses(tone, variant),
              itemClassName,
            )}
          >
            <CircleCheck className="check-icon absolute top-0 right-0 size-6 translate-x-1/3 -translate-y-1/3 stroke-white text-primary group-data-[state=unchecked]:hidden" />

            <Icon className="mb-2.5 size-4 text-muted-foreground transition-colors group-data-[state=checked]:text-current" />
            <span className="block font-semibold tracking-tight">{option.label}</span>
            {option.description ? (
              <p className="mt-1 text-xs text-muted-foreground group-data-[state=checked]:text-current/80">
                {option.description}
              </p>
            ) : null}
          </RadioGroupPrimitive.Item>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}

export type {
  RadioTone as RadioCardsTone,
  RadioToneVariant as RadioCardsVariant,
} from './radio-tone'
