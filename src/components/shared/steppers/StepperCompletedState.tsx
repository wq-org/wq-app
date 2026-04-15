'use client'

import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTrigger,
} from '@/components/ui/stepper'
import { cn } from '@/lib/utils'
import {
  stepperIndicatorColorVariants,
  stepperSeparatorColorVariants,
  type StepperColorVariant,
} from './stepper-color-variants'

const defaultSteps = [1, 2, 3, 4] as const

export type StepperCompletedStateProps = {
  steps?: readonly number[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  colorVariant?: StepperColorVariant
  renderContent?: (step: number) => React.ReactNode
}

export function StepperCompletedState({
  steps = defaultSteps,
  value,
  defaultValue = 2,
  onValueChange,
  className,
  colorVariant = 'default',
  renderContent = (step) => `Step ${step} content`,
}: StepperCompletedStateProps) {
  return (
    <Stepper
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={cn('w-full max-w-md space-y-8', className)}
    >
      <StepperNav>
        {steps.map((step) => (
          <StepperItem
            key={step}
            step={step}
          >
            <StepperTrigger>
              <StepperIndicator className={stepperIndicatorColorVariants({ colorVariant })}>
                {step}
              </StepperIndicator>
            </StepperTrigger>
            {steps.length > step && (
              <StepperSeparator className={stepperSeparatorColorVariants({ colorVariant })} />
            )}
          </StepperItem>
        ))}
      </StepperNav>
      <StepperPanel className="text-sm">
        {steps.map((step) => (
          <StepperContent
            className="flex w-full items-center justify-center"
            key={step}
            value={step}
          >
            {renderContent(step)}
          </StepperContent>
        ))}
      </StepperPanel>
    </Stepper>
  )
}
