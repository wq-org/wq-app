import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
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
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
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
        'p-2 flex flex-col items-center text-center gap-2 rounded-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
          'inline-flex items-center justify-center rounded-full text-muted-foreground/50 w-10 h-10 border-2 border-muted',
          'group-data-disabled:text-muted-foreground group-data-disabled:opacity-50',
          'group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground group-data-[state=active]:border-primary',
          'group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground group-data-[state=completed]:border-accent',
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
        className={cn('text-md font-semibold whitespace-nowrap', className)}
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
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
  'orientation'
>

export const StepperSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  StepperSeparatorProps
>(({ className, decorative = true, ...props }, ref) => {
  const { orientation } = useStepperContext()

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="stepper-separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-muted flex-1',
        orientation === 'horizontal' ? 'h-0.5 min-w-10' : 'w-0.5 min-h-10',
        'group-data-[state=completed]:bg-primary',
        className,
      )}
      {...props}
    />
  )
})
StepperSeparator.displayName = 'StepperSeparator'
