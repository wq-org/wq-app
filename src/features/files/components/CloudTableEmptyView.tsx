import { Files, Upload } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useTranslation } from 'react-i18next'

export function CloudTableEmptyView() {
  const { t } = useTranslation('features.files')

  return (
    <Empty className="w-full rounded-xl border border-dashed border-border p-12 animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="border border-border bg-muted text-muted-foreground"
        >
          <Files className="h-8 w-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-muted-foreground">
          {t('empty.title')}
        </EmptyTitle>
        <EmptyDescription className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            {t('empty.description')}
            <Upload className="h-4 w-4 text-muted-foreground" />
          </span>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
