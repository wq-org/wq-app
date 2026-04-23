'use client'

import { useState } from 'react'
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

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  stepperIndicatorColorVariants,
  stepperSeparatorColorVariants,
  type StepperColorVariant,
} from './stepper-color-variants'

const defaultSteps = [1, 2, 3, 4] as const

export type ControlledStepperProps = {
  steps?: readonly number[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  colorVariant?: StepperColorVariant
  renderContent?: (step: number) => React.ReactNode
}

export function ControlledStepper({
  steps = defaultSteps,
  value,
  defaultValue = 2,
  onValueChange,
  className,
  colorVariant = 'default',
  renderContent = (step) => `Step ${step} content`,
}: ControlledStepperProps) {
  const [internalStep, setInternalStep] = useState(defaultValue)
  const currentStep = value ?? internalStep

  const handleStepChange = (nextStep: number) => {
    if (value === undefined) {
      setInternalStep(nextStep)
    }
    onValueChange?.(nextStep)
  }

  return (
    <Stepper
      value={currentStep}
      onValueChange={handleStepChange}
      className={cn('w-full max-w-md space-y-8', className)}
    >
      <StepperNav>
        {steps.map((step) => (
          <StepperItem
            key={step}
            step={step}
          >
            <StepperTrigger asChild>
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

      {/* Buttons */}
      <div className="flex items-center justify-between gap-2.5">
        <Button
          variant="outline"
          onClick={() => handleStepChange(currentStep - 1)}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => handleStepChange(currentStep + 1)}
          disabled={currentStep === steps.length}
        >
          Next
        </Button>
      </div>
    </Stepper>
  )
}
