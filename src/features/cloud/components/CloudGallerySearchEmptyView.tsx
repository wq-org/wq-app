import { CloudLightning } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function CloudGallerySearchEmptyView() {
  const { t } = useTranslation('features.cloud')

  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 md:p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-12 border border-border bg-muted/50 text-muted-foreground"
        >
          <CloudLightning className="size-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-muted-foreground">
          {t('empty.searchEmpty.title')}
        </EmptyTitle>
        <EmptyDescription className="text-xs">
          {t('empty.searchEmpty.description')}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
