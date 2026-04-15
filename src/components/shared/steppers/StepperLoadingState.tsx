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
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'
import {
  stepperIndicatorColorVariants,
  stepperSeparatorColorVariants,
  type StepperColorVariant,
} from './stepper-color-variants'

const defaultSteps = [1, 2, 3] as const

export type StepperLoadingStateProps = {
  steps?: readonly number[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  loadingStep?: number
  className?: string
  colorVariant?: StepperColorVariant
  renderContent?: (step: number) => React.ReactNode
}

export function StepperLoadingState({
  steps = defaultSteps,
  value,
  defaultValue = 2,
  onValueChange,
  loadingStep = 2,
  className,
  colorVariant = 'default',
  renderContent = (step) => `Step ${step} content`,
}: StepperLoadingStateProps) {
  return (
    <Stepper
      className={cn('w-full max-w-md', className)}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      indicators={{
        completed: <CheckIcon className="size-3.5" />,
        loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
      }}
    >
      <StepperNav className="mb-5">
        {steps.map((step) => (
          <StepperItem
            key={step}
            step={step}
            loading={step === loadingStep}
          >
            <StepperTrigger>
              <StepperIndicator
                className={cn(
                  'size-5 border-2 data-[state=inactive]:border-muted',
                  stepperIndicatorColorVariants({ colorVariant }),
                )}
              >
                <span className="hidden size-1.5 rounded-full bg-current group-data-[state=active]/step:block"></span>
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
