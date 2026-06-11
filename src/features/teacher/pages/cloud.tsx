import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/layout'
import { CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID } from '@/components/shared/card-instant-preview'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { GridPattern } from '@/components/ui/grid-pattern'
import { Text } from '@/components/ui/text'
import { CloudGallery, requestCloudGalleryRefetch } from '@/features/cloud'
import { requestOpenCommandUploadDialog } from '@/features/command-palette'

/** Matches `gap-5` on `CardInstantPreviewList`. */
const CLOUD_GALLERY_CARD_ROW_GAP_PX = 20
const CLOUD_GALLERY_VISIBLE_ROW_COUNT = 3.5

/** Height for exactly 3½ card rows before vertical scroll. */
export const CLOUD_GALLERY_SCROLL_HEIGHT_PX =
  CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID * CLOUD_GALLERY_VISIBLE_ROW_COUNT +
  CLOUD_GALLERY_CARD_ROW_GAP_PX * Math.floor(CLOUD_GALLERY_VISIBLE_ROW_COUNT)

export function TeacherCloudPage() {
  const { t } = useTranslation('features.cloud')
  const [searchQuery, setSearchQuery] = useState('')
  const refetchGalleryRef = useRef<() => void>(() => {})

  const handleRefetchReady = useCallback((refetch: () => void) => {
    refetchGalleryRef.current = refetch
  }, [])

  const handleFilesUploaded = useCallback(() => {
    requestCloudGalleryRefetch()
    void refetchGalleryRef.current()
  }, [])

  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
      onFilesUploaded={handleFilesUploaded}
    >
      <div className="container mx-auto w-full max-w-7xl py-6">
        <section className="relative isolate w-full">
          <GridPattern className="absolute inset-0 -z-10 h-full w-full opacity-75 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]" />

          <div className="relative flex flex-col gap-10 px-4 py-12 sm:px-8">
            <header className="flex flex-col gap-2">
              <Text
                as="h1"
                variant="h1"
                className="text-[clamp(3.5rem,12vw,9rem)] font-bold leading-[0.95] tracking-tight"
              >
                {t('heading.lineOne')}
                <br />
                {t('heading.lineTwo')}
              </Text>
            </header>

            <div className="flex w-full flex-col gap-4">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="darkblue"
                  size="lg"
                  onClick={requestOpenCommandUploadDialog}
                  className="w-fit gap-2"
                >
                  <Upload
                    className="size-4 shrink-0"
                    aria-hidden
                  />
                  {t('empty.uploadCta')}
                </Button>
              </div>
              <div className="w-full max-w-md">
                <FieldInput
                  label={t('search.label')}
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
              </div>
            </div>

            <CloudGallery
              searchQuery={searchQuery}
              galleryScrollHeight={CLOUD_GALLERY_SCROLL_HEIGHT_PX}
              onRefetchReady={handleRefetchReady}
            />
          </div>
        </section>
      </div>
    </AppShell>
  )
}
