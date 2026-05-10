import { useTranslation } from 'react-i18next'
import { ClearableInput } from '@/components/shared'
import { cn } from '@/lib/utils'

export type LessonFilterProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
}

export function LessonFilter({ searchValue, onSearchChange, className }: LessonFilterProps) {
  const { t } = useTranslation('features.lesson')

  return (
    <div className={cn('flex w-full min-w-0 justify-start', className)}>
      <ClearableInput
        value={searchValue}
        showSearchIcon
        onValueChange={onSearchChange}
        label={t('filter.searchLabel', { defaultValue: 'Search lessons' })}
        placeholder={t('filter.searchPlaceholder', {
          defaultValue: 'Search lessons',
        })}
        className="w-full max-w-md shrink-0"
      />
    </div>
  )
}
