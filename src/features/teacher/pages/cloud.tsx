import { useCallback, useRef } from 'react'

import { AppShell } from '@/components/layout'
import { CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID } from '@/components/shared/card-instant-preview'
import { CloudGallery, requestCloudGalleryRefetch } from '@/features/cloud'

/** Matches `gap-5` on `CardInstantPreviewList`. */
const CLOUD_GALLERY_CARD_ROW_GAP_PX = 20
const CLOUD_GALLERY_VISIBLE_ROW_COUNT = 3.5

/** Height for exactly 3½ card rows before vertical scroll. */
export const CLOUD_GALLERY_SCROLL_HEIGHT_PX =
  CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID * CLOUD_GALLERY_VISIBLE_ROW_COUNT +
  CLOUD_GALLERY_CARD_ROW_GAP_PX * Math.floor(CLOUD_GALLERY_VISIBLE_ROW_COUNT)

export function TeacherCloudPage() {
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
        <CloudGallery
          galleryScrollHeight={CLOUD_GALLERY_SCROLL_HEIGHT_PX}
          onRefetchReady={handleRefetchReady}
        />
      </div>
    </AppShell>
  )
}
