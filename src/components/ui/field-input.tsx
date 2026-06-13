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
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  hideSeparator?: boolean
  showClearButton?: boolean
  showSearchIcon?: boolean
  /** Defaults to `visible` so list-page search fields show a label (match cloud). Use `sr-only` for compact in-panel filters. */
  labelVisibility?: 'sr-only' | 'visible'
  size?: 'default' | 'compact'
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
  inputMode,
  autoComplete,
  required = false,
  disabled = false,
  maxLength,
  hideSeparator = false,
  showClearButton = true,
  showSearchIcon = false,
  labelVisibility,
  size = 'default',
  inputClassName,
  className,
}: FieldInputProps) => {
  const generatedId = useId()
  const resolvedId = id ?? generatedId
  const resolvedLabelVisibility = labelVisibility ?? 'visible'

  return (
    <div className={cn('w-full', className)}>
      <ClearableInput
        id={resolvedId}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        label={label}
        labelVisibility={resolvedLabelVisibility}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        hideSeparator={hideSeparator}
        showClearButton={showClearButton}
        showSearchIcon={showSearchIcon}
        size={size}
        disabled={disabled}
        maxLength={maxLength}
        inputClassName={inputClassName}
      />
    </div>
  )
}
