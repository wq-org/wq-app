// components/ui/field-input.tsx
import { useId } from 'react'
import { ClearableInput } from '@/components/shared/inputs'
import { cn } from '@/lib/utils'

type FieldInputProps = {
  value: string
  onValueChange: (value: string) => void
  label: string
  placeholder?: string
  id?: string
  showSeparator?: boolean
  inputClassName?: string
  className?: string
}

export const FieldInput = ({
  value,
  onValueChange,
  label,
  placeholder = label,
  id,
  showSeparator = false,
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
        showSeparator={showSeparator}
        inputClassName={inputClassName}
      />
    </div>
  )
}
