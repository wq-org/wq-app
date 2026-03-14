import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { MAX_DESCRIPTION_LENGTH } from './constants'
import { constrainDescription } from './description'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

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
  placeholder,
  className,
}: FeedbackInputProps) {
  const { t } = useTranslation('features.games')
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...e, target: { ...e.target, value: constrainDescription(e.target.value) } })
  }

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <Text
            as="span"
            variant="small"
            className="text-xs text-muted-foreground"
          >
            {value.length}/{MAX_DESCRIPTION_LENGTH}
          </Text>
        </div>
      )}
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder || t('feedbackInput.placeholder')}
        maxLength={MAX_DESCRIPTION_LENGTH}
        className="min-h-16 text-sm w-full"
      />
    </div>
  )
}
