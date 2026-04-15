'use client'

import { createContext, type ReactNode, useContext, useId } from 'react'
import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field'
import { type VariantProps } from 'class-variance-authority'
import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { numberFieldGroupVariants } from './number-field-group-variants'
import { numberFieldInputVariants } from './number-field-input-variant'
import { numberFieldButtonVariants } from './number-filed-button-variants'

const NumberFieldContext = createContext<{
  fieldId: string
  size: 'sm' | 'default' | 'lg'
} | null>(null)

function NumberField({
  id,
  className,
  size = 'default',
  ...props
}: NumberFieldPrimitive.Root.Props & VariantProps<typeof numberFieldGroupVariants>) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const sizeValue = size ?? 'default'

  return (
    <NumberFieldContext.Provider value={{ fieldId, size: sizeValue }}>
      <NumberFieldPrimitive.Root
        className={cn('flex w-full flex-col items-start gap-2', className)}
        data-size={sizeValue}
        data-slot="number-field"
        id={fieldId}
        {...props}
      />
    </NumberFieldContext.Provider>
  )
}

function NumberFieldGroup({
  className,
  size: sizeProp,
  ...props
}: NumberFieldPrimitive.Group.Props & Partial<VariantProps<typeof numberFieldGroupVariants>>) {
  const context = useContext(NumberFieldContext)
  if (!context) {
    throw new Error('NumberFieldGroup must be used within a NumberField component.')
  }
  const size = sizeProp ?? context.size

  return (
    <NumberFieldPrimitive.Group
      className={cn(numberFieldGroupVariants({ size }), className)}
      data-slot="number-field-group"
      {...props}
    />
  )
}

function NumberFieldDecrement({
  className,
  size: sizeProp,
  children,
  ...props
}: NumberFieldPrimitive.Decrement.Props &
  Partial<VariantProps<typeof numberFieldButtonVariants>> & {
    children?: React.ReactNode
  }) {
  const context = useContext(NumberFieldContext)
  if (!context) {
    throw new Error('NumberFieldDecrement must be used within a NumberField component.')
  }
  const size = sizeProp ?? context.size

  return (
    <NumberFieldPrimitive.Decrement
      className={cn(
        numberFieldButtonVariants({ size }),
        'style-vega:rounded-s-lg style-maia:rounded-s-lg style-nova:rounded-s-lg style-lyra:rounded-s-lg style-mira:rounded-s-lg hover:rounded-full data-pressed:rounded-full focus-visible:rounded-full border-e-0',
        className,
      )}
      data-slot="number-field-decrement"
      {...props}
    >
      {children ?? <Minus />}
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({
  className,
  size: sizeProp,
  children,
  ...props
}: NumberFieldPrimitive.Increment.Props &
  Partial<VariantProps<typeof numberFieldButtonVariants>> & {
    children?: ReactNode
  }) {
  const context = useContext(NumberFieldContext)
  if (!context) {
    throw new Error('NumberFieldIncrement must be used within a NumberField component.')
  }
  const size = sizeProp ?? context.size

  return (
    <NumberFieldPrimitive.Increment
      className={cn(
        numberFieldButtonVariants({ size }),
        'style-vega:rounded-e-lg style-maia:rounded-e-lg style-nova:rounded-e-lg style-lyra:rounded-e-lg style-mira:rounded-e-lg hover:rounded-full data-pressed:rounded-full focus-visible:rounded-full border-s-0',
        className,
      )}
      data-slot="number-field-increment"
      {...props}
    >
      {children ?? <Plus />}
    </NumberFieldPrimitive.Increment>
  )
}

function NumberFieldInput({
  className,
  size: sizeProp,
  ...props
}: NumberFieldPrimitive.Input.Props & Partial<VariantProps<typeof numberFieldInputVariants>>) {
  const context = useContext(NumberFieldContext)
  if (!context) {
    throw new Error('NumberFieldInput must be used within a NumberField component.')
  }
  const size = sizeProp ?? context.size

  return (
    <NumberFieldPrimitive.Input
      className={cn(numberFieldInputVariants({ size }), className)}
      data-slot="number-field-input"
      {...props}
    />
  )
}

function NumberFieldScrubArea({
  className,
  label,
  ...props
}: NumberFieldPrimitive.ScrubArea.Props & {
  label: string
}) {
  const context = useContext(NumberFieldContext)
  if (!context) {
    throw new Error(
      'NumberFieldScrubArea must be used within a NumberField component for accessibility.',
    )
  }

  return (
    <NumberFieldPrimitive.ScrubArea
      className={cn('flex cursor-ew-resize', className)}
      data-slot="number-field-scrub-area"
      {...props}
    >
      <Label
        className="cursor-ew-resize"
        htmlFor={context.fieldId}
      >
        {label}
      </Label>
      <NumberFieldPrimitive.ScrubAreaCursor className="drop-shadow-[0_1px_1px_#0008] filter">
        <CursorGrowIcon />
      </NumberFieldPrimitive.ScrubAreaCursor>
    </NumberFieldPrimitive.ScrubArea>
  )
}

function CursorGrowIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="black"
      height="14"
      stroke="white"
      viewBox="0 0 24 14"
      width="26"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  )
}

export {
  NumberField,
  NumberFieldScrubArea,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldGroup,
  NumberFieldInput,
}
