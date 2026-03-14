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
  autoFocus?: boolean
  disabled?: boolean
  className?: string
  inputClassName?: string
  clearButtonLabel?: string
  hideSeparator?: boolean
  showSearchIcon?: boolean
}

export const ClearableInput = ({
  value,
  defaultValue = '',
  onValueChange,
  placeholder = 'Search',
  label = 'Input',
  id,
  name,
  autoFocus = false,
  disabled = false,
  className,
  inputClassName,
  clearButtonLabel = 'Clear input',
  hideSeparator = false,
  showSearchIcon = false,
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

      {hideSeparator && (
        <div className="absolute left-3 top-9 -translate-y-1/2 h-5 w-5 text-gray-200">
          <Search className="mr-3 h-4 w-4 text-gray-400" />
        </div>
      )}

      <input
        id={inputId}
        name={name}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className={cn(
          'placeholder:text-muted-foreground disabled:opacity-50 flex-1 outline-none bg-transparent h-12 w-full  py-2 min-h-16 pr-10',
          showSearchIcon && `px-10`,
          inputClassName,
        )}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {!hideSeparator ? <Separator /> : null}

      {!disabled && inputValue.trim() && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="p-1 rounded-full hover:bg-gray-100 absolute right-2 top-1/2 -translate-y-1/2"
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
