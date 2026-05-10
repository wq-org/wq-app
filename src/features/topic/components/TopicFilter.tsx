import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ClearableInput } from '@/components/shared'

export interface TopicFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
}

export function TopicFilter({ searchValue, onSearchChange, className }: TopicFilterProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className={cn('flex w-full min-w-0 justify-start', className)}>
      <ClearableInput
        showSearchIcon
        value={searchValue}
        onValueChange={onSearchChange}
        label={t('topic.filter.searchLabel', { defaultValue: 'Search topics' })}
        placeholder={t('topic.filter.searchPlaceholder', {
          defaultValue: 'Search topics',
        })}
        className="w-full max-w-md shrink-0"
      />
    </div>
  )
}
