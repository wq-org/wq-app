import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type StepperOrientation = 'horizontal' | 'vertical'

interface StepperContextValue {
  currentStep: number
  orientation: StepperOrientation
}

interface StepperItemContextValue {
  step: number
  disabled: boolean
}

const StepperContext = React.createContext<StepperContextValue | null>(null)
const StepperItemContext = React.createContext<StepperItemContextValue | null>(null)

function useStepperContext() {
  const context = React.useContext(StepperContext)
  if (!context) {
    throw new Error('Stepper components must be used within a Stepper')
  }
  return context
}

function useStepperItemContext() {
  const context = React.useContext(StepperItemContext)
  if (!context) {
    throw new Error('StepperItem components must be used within a StepperItem')
  }
  return context
}

export interface StepperProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    'value' | 'defaultValue' | 'onValueChange' | 'orientation'
  > {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  orientation?: StepperOrientation
}

export function Stepper({
  value,
  defaultValue = 1,
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
  ...props
}: StepperProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<number>(value ?? defaultValue)

  React.useEffect(() => {
    if (isControlled && value !== undefined) {
      setInternalValue(value)
    }
  }, [isControlled, value])

  const currentStep = isControlled ? (value ?? internalValue) : internalValue

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      const parsed = Number.parseInt(nextValue, 10)
      if (Number.isNaN(parsed)) return
      if (!isControlled) {
        setInternalValue(parsed)
      }
      onValueChange?.(parsed)
    },
    [isControlled, onValueChange],
  )

  return (
    <StepperContext.Provider value={{ currentStep, orientation }}>
      <RadioGroupPrimitive.Root
        data-slot="stepper"
        data-orientation={orientation}
        orientation={orientation}
        value={String(currentStep)}
        onValueChange={handleValueChange}
        className={cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-row items-center justify-center',
          className,
        )}
        {...props}
      >
        {children}
      </RadioGroupPrimitive.Root>
    </StepperContext.Provider>
  )
}

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number
  disabled?: boolean
}

export function StepperItem({
  step,
  disabled = false,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { currentStep, orientation } = useStepperContext()
  const state = currentStep === step ? 'active' : currentStep > step ? 'completed' : 'inactive'

  return (
    <div
      data-slot="stepper-item"
      data-state={state}
      data-disabled={disabled ? '' : undefined}
      data-orientation={orientation}
      className={cn('group flex items-center gap-2', disabled && 'pointer-events-none', className)}
      {...props}
    >
      <StepperItemContext.Provider value={{ step, disabled }}>
        {children}
      </StepperItemContext.Provider>
    </div>
  )
}

export type StepperTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  'value'
>

export const StepperTrigger = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  StepperTriggerProps
>(({ className, children, disabled, ...props }, ref) => {
  const { step, disabled: itemDisabled } = useStepperItemContext()
  const isDisabled = disabled ?? itemDisabled

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      data-slot="stepper-trigger"
      value={String(step)}
      disabled={isDisabled}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl p-2 text-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  )
})
StepperTrigger.displayName = 'StepperTrigger'

export type StepperIndicatorProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: React.ReactNode | ((props: { step: number }) => React.ReactNode)
}

export const StepperIndicator = React.forwardRef<HTMLDivElement, StepperIndicatorProps>(
  ({ className, children, ...props }, ref) => {
    const { step } = useStepperItemContext()
    const content = typeof children === 'function' ? children({ step }) : (children ?? step)

    return (
      <div
        ref={ref}
        data-slot="stepper-indicator"
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-full border-2 border-border/70 bg-card text-muted-foreground/70 shadow-sm transition-colors',
          'group-data-disabled:opacity-50',
          'group-data-[state=active]:border-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground',
          'group-data-[state=completed]:border-accent group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground',
          className,
        )}
        {...props}
      >
        {content}
      </div>
    )
  },
)
StepperIndicator.displayName = 'StepperIndicator'

export type StepperTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export const StepperTitle = React.forwardRef<HTMLHeadingElement, StepperTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        data-slot="stepper-title"
        className={cn('whitespace-nowrap text-base font-semibold text-foreground', className)}
        {...props}
      >
        {children}
      </h3>
    )
  },
)
StepperTitle.displayName = 'StepperTitle'

export type StepperDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const StepperDescription = React.forwardRef<HTMLParagraphElement, StepperDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        data-slot="stepper-description"
        className={cn('text-xs text-muted-foreground', className)}
        {...props}
      >
        {children}
      </p>
    )
  },
)
StepperDescription.displayName = 'StepperDescription'

export type StepperSeparatorProps = Omit<
  React.ComponentPropsWithoutRef<typeof Separator>,
  'orientation'
>

export function StepperSeparator({
  className,
  decorative = true,
  ...props
}: StepperSeparatorProps) {
  const { orientation } = useStepperContext()

  return (
    <Separator
      data-slot="stepper-separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'flex-1 self-center bg-border/70',
        orientation === 'horizontal' ? 'h-px min-w-10' : 'min-h-10 w-px',
        'group-data-[state=completed]:bg-primary',
        className,
      )}
      {...props}
    />
  )
}
StepperSeparator.displayName = 'StepperSeparator'
