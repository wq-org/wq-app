import { useState, type ReactNode } from 'react'
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
import {
  stepperProgressBarIndicatorColorVariants,
  type StepperColorVariant,
} from './stepper-color-variants'

const defaultSteps = [
  { title: 'User Details' },
  { title: 'Payment Info' },
  { title: 'Auth OTP' },
  { title: 'Preview Form' },
]

export type StepperProgressBarTitlesItem = {
  title: string
}

export type StepperProgressBarTitlesFooterState = {
  currentStep: number
  totalSteps: number
  goToPrevious: () => void
  goToNext: () => void | Promise<void>
  isFirst: boolean
  isLast: boolean
}

export type StepperProgressBarTitlesProps = {
  steps?: readonly StepperProgressBarTitlesItem[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  colorVariant?: StepperColorVariant
  renderContent?: (step: StepperProgressBarTitlesItem, index: number) => ReactNode
  onBeforeStepChange?: (fromStep: number, toStep: number) => boolean | Promise<boolean>
  renderFooter?: (state: StepperProgressBarTitlesFooterState) => ReactNode
}

export function StepperProgressBarTitles({
  steps = defaultSteps,
  value,
  defaultValue = 1,
  onValueChange,
  className,
  colorVariant = 'default',
  renderContent = (step) => `${step.title} content`,
  onBeforeStepChange,
  renderFooter,
}: StepperProgressBarTitlesProps) {
  const [internalStep, setInternalStep] = useState(defaultValue)
  const currentStep = value ?? internalStep

  const handleStepChange = async (nextStep: number) => {
    if (nextStep !== currentStep && onBeforeStepChange) {
      const allowed = await onBeforeStepChange(currentStep, nextStep)
      if (!allowed) return
    }

    if (value === undefined) {
      setInternalStep(nextStep)
    }
    onValueChange?.(nextStep)
  }

  const goToPrevious = () => {
    void handleStepChange(currentStep - 1)
  }

  const goToNext = () => handleStepChange(currentStep + 1)

  return (
    <Stepper
      value={currentStep}
      onValueChange={handleStepChange}
      className={cn('w-full max-w-lg space-y-8', className)}
    >
      <StepperNav className="mb-10 gap-5">
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="relative flex-1 items-start"
          >
            <StepperTrigger className="flex grow flex-col items-start justify-center gap-3.5">
              <StepperIndicator
                className={cn(
                  'h-1 w-full rounded-full bg-border',
                  stepperProgressBarIndicatorColorVariants({ colorVariant }),
                )}
              >
                <span className="sr-only">{index + 1}</span>
              </StepperIndicator>
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

      {renderFooter
        ? renderFooter({
            currentStep,
            totalSteps: steps.length,
            goToPrevious,
            goToNext,
            isFirst: currentStep === 1,
            isLast: currentStep === steps.length,
          })
        : null}
    </Stepper>
  )
}
