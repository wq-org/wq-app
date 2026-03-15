import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface PointsInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  className?: string
}

export function PointsInput({ value, onChange, onBlur, className }: PointsInputProps) {
  const { t } = useTranslation('features.games')

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={t('pointsInput.placeholder')}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={cn('w-16 h-8 text-xs', className)}
    />
  )
}
