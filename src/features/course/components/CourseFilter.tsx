import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ClearableInput } from '@/components/shared'

export interface CourseFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
}

export function CourseFilter({ searchValue, onSearchChange, className }: CourseFilterProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className={cn('flex w-full min-w-0 justify-end', className)}>
      <ClearableInput
        showSearchIcon
        value={searchValue}
        onValueChange={onSearchChange}
        label={t('course.filter.searchLabel', { defaultValue: 'Search courses' })}
        placeholder={t('course.filter.searchPlaceholder', {
          defaultValue: 'Search courses',
        })}
        className="w-full max-w-md shrink-0 pb-0"
      />
    </div>
  )
}
