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
import { stepperSeparatorColorVariants, type StepperColorVariant } from './stepper-color-variants'

const defaultSteps = [1, 2, 3, 4] as const

export type BasicStepperProps = {
  steps?: readonly number[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  colorVariant?: StepperColorVariant
  renderContent?: (step: number) => React.ReactNode
}

export function BasicStepper({
  steps = defaultSteps,
  value,
  defaultValue = 2,
  onValueChange,
  className,
  colorVariant = 'default',
  renderContent = (step) => `Step ${step} content`,
}: BasicStepperProps) {
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
              <StepperIndicator>{step}</StepperIndicator>
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
            key={step}
            value={step}
            className="flex items-center justify-center"
          >
            {renderContent(step)}
          </StepperContent>
        ))}
      </StepperPanel>
    </Stepper>
  )
}
