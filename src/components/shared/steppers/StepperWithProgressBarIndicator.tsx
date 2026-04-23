'use client'

import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import { cn } from '@/lib/utils'
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'

const defaultSteps = [
  { title: 'User Details' },
  { title: 'Payment Info' },
  { title: 'Auth OTP' },
  { title: 'Preview Form' },
]

export type StepperWithProgressBarIndicatorItem = {
  title: string
}

export type StepperWithProgressBarIndicatorProps = {
  steps?: readonly StepperWithProgressBarIndicatorItem[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  renderContent?: (step: StepperWithProgressBarIndicatorItem, index: number) => React.ReactNode
}

export function StepperWithProgressBarIndicator({
  steps = defaultSteps,
  value,
  defaultValue = 2,
  onValueChange,
  className,
  renderContent = (step) => `${step.title} content`,
}: StepperWithProgressBarIndicatorProps) {
  return (
    <Stepper
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      indicators={{
        completed: <CheckIcon className="size-3.5" />,
        loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
      }}
      className={cn('w-full max-w-lg space-y-8', className)}
    >
      <StepperNav className="gap-3">
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="relative flex-1 items-start"
          >
            <StepperTrigger className="flex grow flex-col items-start justify-center gap-3">
              <StepperIndicator>{index + 1}</StepperIndicator>
              <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start font-semibold">
                {step.title}
              </StepperTitle>
            </StepperTrigger>
          </StepperItem>
        ))}
      </StepperNav>

      <StepperPanel className="text-sm">
        {steps.map((step, index) => (
          <StepperContent
            key={index}
            value={index + 1}
            className="flex items-center justify-center"
          >
            {renderContent(step, index)}
          </StepperContent>
        ))}
      </StepperPanel>
    </Stepper>
  )
}
