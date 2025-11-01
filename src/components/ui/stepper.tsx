import * as React from 'react';
import { cn } from '@/lib/utils';

// Context for Stepper state
interface StepperContextValue {
  currentStep: number;
  totalSteps: number;
  orientation?: 'horizontal' | 'vertical';
  onStepChange?: (step: number) => void;
}

const StepperContext = React.createContext<StepperContextValue | undefined>(undefined);

function useStepperContext() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error('Stepper components must be used within a Stepper');
  }
  return context;
}

// Stepper Root
export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
}

export function Stepper({
  value = 1,
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
  ...props
}: StepperProps) {
  const [currentStep, setCurrentStep] = React.useState(value);

  React.useEffect(() => {
    setCurrentStep(value);
  }, [value]);

  const handleStepChange = React.useCallback(
    (step: number) => {
      setCurrentStep(step);
      onValueChange?.(step);
    },
    [onValueChange]
  );

  // Count total steps
  const totalSteps = React.Children.count(children);

  const contextValue = React.useMemo(
    () => ({
      currentStep,
      totalSteps,
      orientation,
      onStepChange: handleStepChange,
    }),
    [currentStep, totalSteps, orientation, handleStepChange]
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        data-orientation={orientation}
        className={cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

// Stepper Item
export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  disabled?: boolean;
}

export function StepperItem({
  step,
  disabled = false,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { currentStep, orientation } = useStepperContext();

  const state =
    currentStep === step
      ? 'active'
      : currentStep > step
      ? 'completed'
      : 'inactive';

  return (
    <div
      data-state={state}
      data-disabled={disabled ? '' : undefined}
      data-orientation={orientation}
      className={cn(
        'flex items-center gap-2 group',
        disabled && 'pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Stepper Trigger
export interface StepperTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const StepperTrigger = React.forwardRef<
  HTMLButtonElement,
  StepperTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'p-2 flex flex-col items-center text-center gap-2 rounded-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
StepperTrigger.displayName = 'StepperTrigger';

// Stepper Indicator
export interface StepperIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  StepperIndicatorProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full text-muted-foreground/50 w-10 h-10 border-2 border-muted',
        'group-data-[disabled]:text-muted-foreground group-data-[disabled]:opacity-50',
        'group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground group-data-[state=active]:border-primary',
        'group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground group-data-[state=completed]:border-accent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
StepperIndicator.displayName = 'StepperIndicator';

// Stepper Title
export interface StepperTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const StepperTitle = React.forwardRef<
  HTMLHeadingElement,
  StepperTitleProps
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('text-md font-semibold whitespace-nowrap', className)}
      {...props}
    >
      {children}
    </h3>
  );
});
StepperTitle.displayName = 'StepperTitle';

// Stepper Description
export interface StepperDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const StepperDescription = React.forwardRef<
  HTMLParagraphElement,
  StepperDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
});
StepperDescription.displayName = 'StepperDescription';

// Stepper Separator
export interface StepperSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  StepperSeparatorProps
>(({ className, ...props }, ref) => {
  const { orientation } = useStepperContext();

  return (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cn(
        'bg-muted flex-1',
        orientation === 'horizontal' ? 'h-[2px] min-w-[40px]' : 'w-[2px] min-h-[40px]',
        'group-data-[state=completed]:bg-accent',
        className
      )}
      {...props}
    />
  );
});
StepperSeparator.displayName = 'StepperSeparator';

