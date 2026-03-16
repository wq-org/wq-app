import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ClearableInput } from '@/components/shared'

export interface CourseToolBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function CourseToolBar({ searchValue, onSearchChange, className }: CourseToolBarProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className={cn('flex w-full min-w-0 justify-end', className)}>
      <ClearableInput
        showSearchIcon
        value={searchValue}
        onValueChange={onSearchChange}
        label={t('course.toolbar.searchLabel', { defaultValue: 'Search courses' })}
        placeholder={t('course.toolbar.searchPlaceholder', {
          defaultValue: 'Search courses',
        })}
        className="w-full max-w-md shrink-0 pb-0"
      />
    </div>
  )
}
