import { useState } from 'react'
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTrigger,
} from '@/components/ui/stepper'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'

const defaultSteps = [1, 2, 3, 4] as const

export type StepperSegmentedProgressBarProps = {
  steps?: readonly number[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  renderContent?: (step: number) => React.ReactNode
}

export function StepperSegmentedProgressBar({
  steps = defaultSteps,
  value,
  defaultValue = 1,
  onValueChange,
  className,
  renderContent = (step) => `Step ${step} content`,
}: StepperSegmentedProgressBarProps) {
  const [internalStep, setInternalStep] = useState(defaultValue)
  const currentStep = value ?? internalStep

  const handleStepChange = (nextStep: number) => {
    if (value === undefined) {
      setInternalStep(nextStep)
    }
    onValueChange?.(nextStep)
  }

  return (
    <div className={cn('w-full max-w-md', className)}>
      <Stepper
        value={currentStep}
        onValueChange={handleStepChange}
      >
        <StepperNav>
          {steps.map((step) => (
            <StepperItem
              key={step}
              step={step}
              className="first:rounded-s-full last:rounded-e-full flex-1 overflow-hidden transition-all duration-300"
            >
              <StepperTrigger
                className="w-full flex-col items-start gap-2"
                asChild
              >
                <StepperIndicator className="bg-border h-2 w-full rounded-none!">
                  <span className="sr-only">{step}</span>
                </StepperIndicator>
              </StepperTrigger>
            </StepperItem>
          ))}
        </StepperNav>

        <div className="flex items-center justify-between gap-2.5 py-1">
          <Button
            variant="link"
            onClick={() => handleStepChange(currentStep - 1)}
            className={cn('px-0', currentStep === 1 && 'pointer-events-none opacity-0')}
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>

          <div className="text-sm font-medium">
            <span className="text-foreground">{currentStep}</span>{' '}
            <span className="text-muted-foreground/60">/ {steps.length}</span>
          </div>
        </div>

        <StepperPanel className="py-6 text-sm">
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

        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={() => handleStepChange(currentStep + 1)}
            disabled={currentStep === steps.length}
          >
            Next
          </Button>
        </div>
      </Stepper>
    </div>
  )
}
