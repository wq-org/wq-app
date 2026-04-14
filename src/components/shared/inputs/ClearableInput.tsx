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
}

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
}: ClearableInputProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId

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

  return (
    <div className={cn('relative pb-2', className)}>
      <Label
        htmlFor={inputId}
        className="sr-only"
      >
        {label}
      </Label>

      {showSearchIcon ? (
        <Search
          className="pointer-events-none absolute top-6 left-3 size-4 -translate-y-1/2 text-muted-foreground"
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
          'placeholder:text-muted-foreground disabled:opacity-50 flex-1 outline-none bg-transparent h-12 w-full  py-2 min-h-16 pr-10',
          showSearchIcon && `px-10`,
          inputClassName,
        )}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        inputMode={inputMode}
      />
      {!hideSeparator ? <Separator /> : null}

      {showClearButton && !disabled && inputValue.trim() && type !== 'password' && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 rounded-full p-1 -translate-y-1/2 hover:bg-accent"
          onClick={handleClear}
          aria-label={clearButtonLabel}
          disabled={disabled || inputValue.length === 0}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
