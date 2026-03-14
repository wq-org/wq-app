'use client'

/**
 * QuantityStepper.tsx
 * Plain horizontal stepper: [ChevronDown] | value | [ChevronUp]
 * No colors, no rings — ghost buttons + separators only.
 */

import * as React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuantityStepperProps {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onChange?: (value: number) => void
  className?: string
  name?: string
  label?: string
}

export function QuantityStepper({
  value: controlledValue,
  defaultValue = 100,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  onChange,
  className,
  name,
  label = 'Quantity',
}: QuantityStepperProps) {
  const inputId = React.useId()
  const isControlled = controlledValue !== undefined

  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = isControlled ? controlledValue : internalValue
  const [inputValue, setInputValue] = React.useState(String(currentValue))
  const [animatedValue, setAnimatedValue] = React.useState<number | null>(null)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const lastValidValueRef = React.useRef(currentValue)
  const animationTimerRef = React.useRef<number | null>(null)

  const clampValue = React.useCallback(
    (next: number) => Math.min(max, Math.max(min, next)),
    [min, max],
  )

  const triggerValueAnimation = React.useCallback((nextValue: number) => {
    if (animationTimerRef.current) {
      window.clearTimeout(animationTimerRef.current)
    }

    setAnimatedValue(nextValue)
    setIsAnimating(true)
    animationTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }, [])

  const commitValue = React.useCallback(
    (next: number) => {
      const clamped = clampValue(next)
      if (!isControlled) {
        setInternalValue(clamped)
      }
      setInputValue(String(clamped))
      lastValidValueRef.current = clamped
      onChange?.(clamped)
      triggerValueAnimation(clamped)
      return clamped
    },
    [clampValue, isControlled, onChange, triggerValueAnimation],
  )

  React.useEffect(() => {
    const safeValue = clampValue(currentValue)
    lastValidValueRef.current = safeValue
    setInputValue(String(safeValue))
  }, [currentValue, clampValue])

  React.useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        window.clearTimeout(animationTimerRef.current)
      }
    }
  }, [])

  const applyStep = (next: number) => {
    commitValue(next)
  }

  const commitInputValue = React.useCallback(() => {
    if (inputValue.trim() === '') {
      commitValue(lastValidValueRef.current)
      return
    }

    const parsed = Number.parseInt(inputValue, 10)
    if (Number.isNaN(parsed)) {
      commitValue(lastValidValueRef.current)
      return
    }

    commitValue(parsed)
  }, [inputValue, commitValue])

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value
    const numericText = rawValue.replace(/\D+/g, '')

    if (rawValue === '') {
      setInputValue('')
      return
    }

    setInputValue(numericText)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commitInputValue()
      event.currentTarget.blur()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      applyStep(currentValue + step)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      applyStep(currentValue - step)
    }
  }

  const ariaMax = Number.isFinite(max) ? max : undefined

  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    applyStep(clamped)
  }

  return (
    <div
      className={cn(
        'relative flex h-12 items-center rounded-xl border-border bg-background',
        className,
      )}
    >
      {/* Decrement */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => set(currentValue - step)}
        disabled={disabled || currentValue <= min}
        aria-label="Decrease"
        className="rounded-full  "
      >
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Input */}
      <label
        htmlFor={inputId}
        className="sr-only"
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInput}
        onBlur={commitInputValue}
        onKeyDown={handleInputKeyDown}
        disabled={disabled}
        aria-label={label}
        aria-valuenow={currentValue}
        aria-valuemin={min}
        aria-valuemax={ariaMax}
        className={cn(
          'placeholder:text-muted-foreground disabled:opacity-50 border-b-2',
          'flex-1 outline-none bg-transparent h-12 w-full px-3 py-2 transition-opacity duration-500',
          'text-center text-base tabular-nums',
          isAnimating && 'opacity-70',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 left-12 right-12 flex items-center justify-center text-base tabular-nums transition-opacity duration-500',
          isAnimating ? 'opacity-100' : 'opacity-0',
        )}
      >
        {animatedValue}
      </span>

      {/* Increment */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => set(currentValue + step)}
        disabled={disabled || currentValue >= max}
        aria-label="Increase"
        className="rounded-full  "
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
    </div>
  )
}
