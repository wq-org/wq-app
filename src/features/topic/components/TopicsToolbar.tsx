import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ClearableInput } from '@/components/shared/inputs'

export interface TopicsToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
}

export function TopicsToolbar({ searchValue, onSearchChange, className }: TopicsToolbarProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className={cn('flex w-full justify-start', className)}>
      <ClearableInput
        showSearchIcon
        value={searchValue}
        onValueChange={onSearchChange}
        label={t('topic.toolbar.searchLabel', { defaultValue: 'Search topics' })}
        placeholder={t('topic.toolbar.searchPlaceholder', {
          defaultValue: 'Search topics by title or description...',
        })}
        className="w-90 pb-0"
      />
    </div>
  )
}
