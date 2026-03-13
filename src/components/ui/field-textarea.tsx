// components/ui/field-textarea.tsx
import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { CharacterCounter } from '@/components/ui/character-counter'
import { cn } from '@/lib/utils'

type FieldTextareaProps = {
  value: string
  onValueChange: (value: string) => void
  label: string
  placeholder?: string
  id?: string
  rows?: number
  maxLength?: number
  showCounter?: boolean
  className?: string
  onExceedLength?: (isExceeded: boolean, current: number, max: number) => void
}

export const FieldTextarea = ({
  value,
  onValueChange,
  label,
  placeholder = label,
  id,
  rows = 4,
  maxLength = 500,
  showCounter = true,
  className,
  onExceedLength,
}: FieldTextareaProps) => {
  const generatedId = useId()
  const resolvedId = id ?? generatedId
  const remaining = maxLength - value.length

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value
    onExceedLength?.(next.length > maxLength, next.length, maxLength)
    onValueChange(next)
  }

  return (
    <div className={cn('w-full', className)}>
      <Label
        htmlFor={resolvedId}
        className="sr-only"
      >
        {label}
      </Label>
      <textarea
        id={resolvedId}
        data-slot="textarea"
        className="placeholder:text-muted-foreground disabled:opacity-50 w-full my-4 outline-none resize-none py-2 min-h-16"
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
      />
      {showCounter && (
        <div className="flex justify-end mr-4">
          <CharacterCounter
            count={remaining}
            max={maxLength}
            size={20}
          />
        </div>
      )}
    </div>
  )
}
