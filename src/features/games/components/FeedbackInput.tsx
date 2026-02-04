import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { MAX_DESCRIPTION_LENGTH } from '@/lib/constants'
import { constrainDescription } from '@/lib/validations'

interface FeedbackInputProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
}

export default function FeedbackInput({
  label,
  value,
  onChange,
  placeholder = 'Optional feedback shown after Check',
  className,
}: FeedbackInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...e, target: { ...e.target, value: constrainDescription(e.target.value) } })
  }

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <span className="text-xs text-muted-foreground">
            {value.length}/{MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
      )}
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={MAX_DESCRIPTION_LENGTH}
        className="min-h-16 text-sm w-full"
      />
    </div>
  )
}
