import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export interface TopicsToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
}

export default function TopicsToolbar({
  searchValue,
  onSearchChange,
  className,
}: TopicsToolbarProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className={cn('flex w-full justify-start', className)}>
      <Input
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t('topic.toolbar.searchPlaceholder')}
        className="pr-10 w-80"
      />
    </div>
  )
}
