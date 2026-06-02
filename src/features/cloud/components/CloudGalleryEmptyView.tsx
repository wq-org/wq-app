import { CloudAlert, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { requestOpenCommandUploadDialog } from '@/features/command-palette'

export function CloudGalleryEmptyView() {
  const { t } = useTranslation('features.cloud')

  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 md:p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-12 border border-border bg-muted/50 text-muted-foreground"
        >
          <CloudAlert className="size-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-muted-foreground">
          {t('empty.title')}
        </EmptyTitle>
        <EmptyDescription className="text-xs">{t('empty.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={requestOpenCommandUploadDialog}
          className="gap-2 active:animate-in active:zoom-in-95"
        >
          <Upload className="size-4" />
          {t('empty.uploadCta')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
