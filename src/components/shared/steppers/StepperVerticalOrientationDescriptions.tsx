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
  { title: 'Account', description: 'Create your account' },
  { title: 'Profile', description: 'Set up your profile' },
  { title: 'Review', description: 'Confirm your details' },
]

export type StepperVerticalOrientationDescriptionsItem = {
  title: string
  description: string
}

export type StepperVerticalOrientationDescriptionsProps = {
  steps?: readonly StepperVerticalOrientationDescriptionsItem[]
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
  colorVariant?: StepperColorVariant
  renderContent?: (
    step: StepperVerticalOrientationDescriptionsItem,
    index: number,
  ) => React.ReactNode
}

export function StepperVerticalOrientationDescriptions({
  steps = defaultSteps,
  value,
  defaultValue = 2,
  onValueChange,
  className,
  colorVariant = 'default',
  renderContent = (step) => `${step.title} content`,
}: StepperVerticalOrientationDescriptionsProps) {
  return (
    <div className="flex items-center justify-center">
      <Stepper
        className={cn('flex flex-col items-center justify-center gap-10', className)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        orientation="vertical"
        indicators={{
          completed: <CheckIcon className="size-3.5" />,
          loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
        }}
      >
        <StepperNav>
          {steps.map((step, index) => (
            <StepperItem
              key={index}
              step={index + 1}
              className="relative items-start not-last:flex-1"
            >
              <StepperTrigger className="items-start gap-2.5 pb-12 last:pb-0">
                <StepperIndicator className={stepperIndicatorColorVariants({ colorVariant })}>
                  {index + 1}
                </StepperIndicator>
                <div className="mt-0.5 text-left">
                  <StepperTitle>{step.title}</StepperTitle>
                  <StepperDescription>{step.description}</StepperDescription>
                </div>
              </StepperTrigger>
              {index < steps.length - 1 && (
                <StepperSeparator
                  className={cn(
                    'absolute inset-y-0 top-7 left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)]',
                    stepperSeparatorColorVariants({ colorVariant }),
                  )}
                />
              )}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel className="w-56 text-center text-sm">
          {steps.map((step, index) => (
            <StepperContent
              key={index}
              value={index + 1}
            >
              {renderContent(step, index)}
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
    </div>
  )
}
