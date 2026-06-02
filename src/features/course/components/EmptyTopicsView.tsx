import { TextCursorInput } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useTranslation } from 'react-i18next'

export function EmptyTopicsView() {
  const { t } = useTranslation('features.course')

  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 border border-dashed border-border rounded-xl p-6">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-muted border border-border text-muted-foreground"
        >
          <TextCursorInput className="w-8 h-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-muted-foreground">
          {t('emptyTopics.title')}
        </EmptyTitle>
        <EmptyDescription className="text-xs text-muted-foreground/80">
          {t('emptyTopics.description')}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
