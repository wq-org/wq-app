// components/ui/field-input.tsx
import { useId } from 'react'
import { ClearableInput } from '@/components/shared'
import { cn } from '@/lib/utils'

type FieldInputProps = {
  value: string
  onValueChange?: (value: string) => void
  label: string
  placeholder?: string
  id?: string
  name?: string
  type?: React.HTMLInputTypeAttribute
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  hideSeparator?: boolean
  showClearButton?: boolean
  inputClassName?: string
  className?: string
}

export const FieldInput = ({
  value,
  onValueChange,
  label,
  placeholder = label,
  id,
  name,
  type = 'text',
  autoComplete,
  required = false,
  disabled = false,
  maxLength,
  hideSeparator = false,
  showClearButton = true,
  inputClassName,
  className,
}: FieldInputProps) => {
  const generatedId = useId()
  const resolvedId = id ?? generatedId

  return (
    <div className={cn('w-full', className)}>
      <ClearableInput
        id={resolvedId}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        label={label}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        hideSeparator={hideSeparator}
        showClearButton={showClearButton}
        disabled={disabled}
        maxLength={maxLength}
        inputClassName={inputClassName}
      />
    </div>
  )
}
