import { useId, useState, type ChangeEvent } from 'react'
import { X, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ClearableInputProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  label?: string
  id?: string
  name?: string
  type?: React.HTMLInputTypeAttribute
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoFocus?: boolean
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  className?: string
  inputClassName?: string
  clearButtonLabel?: string
  hideSeparator?: boolean
  showSearchIcon?: boolean
  showClearButton?: boolean
  /** Use `visible` for form fields (matches `FieldTextarea`). Search bars keep `sr-only`. */
  labelVisibility?: 'sr-only' | 'visible'
  size?: 'default' | 'compact'
}

const rootSizeClassName = {
  default: 'pb-2',
  compact: 'pb-0',
} as const

const labelOffsetClassName = {
  default: 'mt-4',
  compact: 'mt-2',
} as const

const inputSizeClassName = {
  default: 'h-12 min-h-16 py-2 pr-10',
  compact: 'h-9 min-h-0 py-1.5 pr-9 text-sm',
} as const

const searchIconSizeClassName = {
  default: 'left-3 size-4',
  compact: 'left-2.5 size-3.5',
} as const

const clearButtonSizeClassName = {
  default: 'size-9',
  compact: 'size-8',
} as const

export const ClearableInput = ({
  value,
  defaultValue = '',
  onValueChange,
  placeholder = 'Search',
  label = 'Input',
  id,
  name,
  type = 'text',
  inputMode,
  autoFocus = false,
  autoComplete,
  required = false,
  disabled = false,
  maxLength,
  className,
  inputClassName,
  clearButtonLabel = 'Clear input',
  hideSeparator = false,
  showSearchIcon = false,
  showClearButton = true,
  labelVisibility = 'sr-only',
  size = 'default',
}: ClearableInputProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [isInputHovered, setIsInputHovered] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = value !== undefined
  const inputValue = isControlled ? value : internalValue

  const handleValueChange = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleValueChange(event.target.value)
  }

  const handleClear = () => {
    handleValueChange('')
  }

  const separatorClassName = cn(
    'transition-colors duration-200',
    isInputFocused ? 'bg-black' : isInputHovered ? 'bg-gray-300' : undefined,
  )

  return (
    <div className={cn('relative', rootSizeClassName[size], className)}>
      <Label
        htmlFor={inputId}
        className={cn(labelVisibility === 'sr-only' && 'sr-only')}
      >
        {label}
      </Label>

      <div
        className={cn(
          'relative w-full',
          labelVisibility === 'visible' && labelOffsetClassName[size],
        )}
      >
        {showSearchIcon ? (
          <Search
            className={cn(
              'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
              searchIconSizeClassName[size],
            )}
            aria-hidden
          />
        ) : null}

        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={cn(
            'placeholder:text-muted-foreground disabled:opacity-50 flex-1 outline-none bg-transparent w-full',
            inputSizeClassName[size],
            showSearchIcon && (size === 'compact' ? 'pl-9 pr-9' : 'px-10'),
            inputClassName,
          )}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          inputMode={inputMode}
          onMouseEnter={() => setIsInputHovered(true)}
          onMouseLeave={() => setIsInputHovered(false)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />

        {showClearButton && !disabled && inputValue.trim() && type !== 'password' && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              'absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-accent',
              clearButtonSizeClassName[size],
            )}
            onClick={handleClear}
            aria-label={clearButtonLabel}
            disabled={disabled || inputValue.length === 0}
          >
            <X className={cn(size === 'compact' ? 'size-3.5' : 'size-4')} />
          </Button>
        )}
      </div>

      {!hideSeparator ? (
        <Separator className={cn(size === 'compact' ? 'mt-1' : 'mt-2', separatorClassName)} />
      ) : null}
    </div>
  )
}
