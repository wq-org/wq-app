import { useTranslation } from 'react-i18next'
import { ClearableInput } from '@/components/shared'
import { cn } from '@/lib/utils'

export type LessonSearchBarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
}

export function LessonSearchBar({ searchValue, onSearchChange, className }: LessonSearchBarProps) {
  const { t } = useTranslation('features.lesson')

  return (
    <div className={cn('flex w-full min-w-0 justify-end', className)}>
      <ClearableInput
        value={searchValue}
        showSearchIcon
        onValueChange={onSearchChange}
        label={t('toolbar.searchLabel', { defaultValue: 'Search lessons' })}
        placeholder={t('toolbar.searchPlaceholder', {
          defaultValue: 'Search lessons',
        })}
        className="w-full max-w-md shrink-0 pb-0"
      />
    </div>
  )
}
