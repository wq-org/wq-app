import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ClearableInput } from '@/components/shared'

export interface LessonToolBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  sortValue?: string
  className?: string
}

export function LessonToolBar({ searchValue, onSearchChange, className }: LessonToolBarProps) {
  const { t } = useTranslation('features.lesson')

  return (
    <div className={cn('flex w-full justify-start', className)}>
      <ClearableInput
        value={searchValue}
        showSearchIcon
        onValueChange={onSearchChange}
        label={t('toolbar.searchLabel', { defaultValue: 'Search lessons' })}
        placeholder={t('toolbar.searchPlaceholder', {
          defaultValue: 'Search lessons by title or description...',
        })}
        className="w-90 pb-0"
      />
    </div>
  )
}
