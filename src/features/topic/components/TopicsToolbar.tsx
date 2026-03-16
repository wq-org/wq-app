import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ClearableInput } from '@/components/shared'

export interface TopicsToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
}

export function TopicsToolbar({ searchValue, onSearchChange, className }: TopicsToolbarProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className={cn('flex w-full min-w-0 justify-end', className)}>
      <ClearableInput
        showSearchIcon
        value={searchValue}
        onValueChange={onSearchChange}
        label={t('topic.toolbar.searchLabel', { defaultValue: 'Search topics' })}
        placeholder={t('topic.toolbar.searchPlaceholder', {
          defaultValue: 'Search topics',
        })}
        className="w-full max-w-md shrink-0 pb-0"
      />
    </div>
  )
}
