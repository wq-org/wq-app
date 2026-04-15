'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BookUserIcon, CheckIcon, CreditCardIcon, LoaderCircleIcon, LockIcon } from 'lucide-react'

const defaultSteps = [
  {
    title: 'User Details',
    icon: <BookUserIcon className="size-4" />,
  },
  {
    title: 'Payment Info',
    icon: <CreditCardIcon className="size-4" />,
  },
  {
    title: 'Auth OTP',
    icon: <LockIcon className="size-4" />,
  },
]

export type StepperIconsBadgesItem = {
  title: string
  icon: React.ReactNode
}

export type StepperIconsBadgesProps = {
  steps?: readonly StepperIconsBadgesItem[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  renderContent?: (step: StepperIconsBadgesItem, index: number) => React.ReactNode
}

export function StepperIconsBadges({
  steps = defaultSteps,
  value,
  defaultValue = 2,
  onValueChange,
  className,
  renderContent = (step) => `${step.title} content`,
}: StepperIconsBadgesProps) {
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
      indicators={{
        completed: <CheckIcon className="size-3.5" />,
        loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
      }}
      className={cn('w-full max-w-xl space-y-8', className)}
    >
      <StepperNav className="gap-3">
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="relative flex-1 items-start"
          >
            <StepperTrigger
              className="flex grow flex-col items-start justify-center gap-2.5"
              asChild
            >
              <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=completed]:bg-success size-8 border-2 data-[state=completed]:text-white data-[state=inactive]:bg-transparent">
                {step.icon}
              </StepperIndicator>
              <div className="flex flex-col items-start gap-1">
                <div className="text-muted-foreground text-[10px] font-semibold uppercase">
                  Step {index + 1}
                </div>
                <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start text-base font-semibold">
                  {step.title}
                </StepperTitle>
                <div>
                  <Badge
                    size="sm"
                    variant="primary-light"
                    className="hidden group-data-[state=active]/step:inline-flex"
                  >
                    In Progress
                  </Badge>
                  <Badge
                    variant="success-light"
                    size="sm"
                    className="hidden group-data-[state=completed]/step:inline-flex"
                  >
                    Completed
                  </Badge>
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="text-muted-foreground hidden group-data-[state=inactive]/step:inline-flex"
                  >
                    Pending
                  </Badge>
                </div>
              </div>
            </StepperTrigger>

            {steps.length > index + 1 && (
              <StepperSeparator className="group-data-[state=completed]/step:bg-success absolute inset-x-0 start-9 top-4 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
            )}
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
