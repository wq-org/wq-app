import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import { cn } from '@/lib/utils'
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'
import {
  stepperIndicatorColorVariants,
  stepperSeparatorColorVariants,
  type StepperColorVariant,
} from './stepper-color-variants'

const defaultSteps = [
  { title: 'Step 1', description: 'Description' },
  { title: 'Step 2', description: 'Description' },
  { title: 'Step 3', description: 'Description' },
] as const

export type StepperContentEachStepItem = {
  title: string
  description: string
}

export type StepperContentEachStepProps = {
  steps?: readonly StepperContentEachStepItem[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  colorVariant?: StepperColorVariant
  renderContent?: (step: StepperContentEachStepItem, index: number) => React.ReactNode
}

export function StepperContentEachStep({
  steps = defaultSteps,
  value,
  defaultValue = 2,
  onValueChange,
  className,
  colorVariant = 'default',
  renderContent = (step) => `${step.title} content`,
}: StepperContentEachStepProps) {
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
      <StepperNav>
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="relative"
          >
            <StepperTrigger className="flex justify-start gap-1.5">
              <StepperIndicator className={stepperIndicatorColorVariants({ colorVariant })}>
                {index + 1}
              </StepperIndicator>
              <div className="flex flex-col items-start gap-0.5">
                <StepperTitle>{step.title}</StepperTitle>
                <StepperDescription>{step.description}</StepperDescription>
              </div>
            </StepperTrigger>

            {steps.length > index + 1 && (
              <StepperSeparator
                className={cn('md:mx-2.5', stepperSeparatorColorVariants({ colorVariant }))}
              />
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
    </Stepper>
  )
}
