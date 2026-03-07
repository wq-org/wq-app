import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export interface LessonToolBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  sortValue?: string
  className?: string
}

export default function LessonToolBar({
  searchValue,
  onSearchChange,
  className,
}: LessonToolBarProps) {
  const { t } = useTranslation('features.lesson')

  return (
    <div className={cn('flex w-full justify-start', className)}>
      <Input
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t('toolbar.searchPlaceholder', {
          defaultValue: 'Search lessons by title or description...',
        })}
        className="pr-10 w-80"
      />
    </div>
  )
}
