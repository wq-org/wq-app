import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CardInstantPreview, InfiniteScrollSentinel } from '@/components/shared'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { cn } from '@/lib/utils'

import { CLOUD_GALLERY_PAGE_SIZE } from '../api/filesApi'
import { CLOUD_GALLERY_REFETCH_EVENT } from '../constants/cloudGalleryEvents'
import { useTeacherCloudFiles } from '../hooks/useTeacherCloudFiles'
import type { FileItem } from '../types/files.types'
import { buildCloudGalleryItems, isGalleryFile } from '../utils/buildCloudGalleryItems'
import { CloudFileCardContent } from './CloudFileCardContent'
import { CloudGalleryEmptyView } from './CloudGalleryEmptyView'
import { CloudGallerySearchEmptyView } from './CloudGallerySearchEmptyView'

const SEARCH_FIELDS = ['filename', 'type'] as const satisfies readonly (keyof FileItem)[]
/** Prefetch distance (px) for sentinel observer and scroll-fill checks. */
const INFINITE_SCROLL_PREFETCH_PX = 400
const INFINITE_SCROLL_ROOT_MARGIN = `${INFINITE_SCROLL_PREFETCH_PX}px`

export type CloudGalleryProps = {
  className?: string
  searchQuery: string
  /** Fixed viewport height (px) for the card grid; content scrolls vertically when taller. */
  galleryScrollHeight?: number
  /** Registers the gallery refetch fn (e.g. wire to command-palette upload success). */
  onRefetchReady?: (refetch: () => void) => void
}

export function CloudGallery({
  className,
  searchQuery,
  galleryScrollHeight,
  onRefetchReady,
}: CloudGalleryProps) {
  const { t } = useTranslation('features.cloud')
  const {
    fileItems,
    loading,
    error,
    refetch,
    renameFileItem,
    hasMore,
    isLoadingMore,
    autoPrefetchBlocked,
    loadMore,
  } = useTeacherCloudFiles()
  const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    onRefetchReady?.(() => {
      void refetch()
    })
  }, [onRefetchReady, refetch])

  useEffect(() => {
    const handleGalleryRefetch = () => {
      void refetch()
    }

    window.addEventListener(CLOUD_GALLERY_REFETCH_EVENT, handleGalleryRefetch)
    return () => window.removeEventListener(CLOUD_GALLERY_REFETCH_EVENT, handleGalleryRefetch)
  }, [refetch])

  useEffect(() => {
    if (error) {
      toast.error(t('loadError'))
    }
  }, [error, t])

  const galleryFiles = useMemo(() => fileItems.filter(isGalleryFile), [fileItems])
  const filtered = useSearchFilter(galleryFiles, searchQuery, SEARCH_FIELDS)

  const handleDeleted = useCallback(() => {
    void refetch()
  }, [refetch])

  const handleLoadMore = useCallback(() => {
    void loadMore()
  }, [loadMore])

  const handleItemTitleChange = useCallback(
    async (id: string, nextTitle: string) => {
      const file = galleryFiles.find((item) => (item.storagePath ?? String(item.id)) === id)
      if (!file?.storagePath) return

      const trimmed = nextTitle.trim()
      if (!trimmed || trimmed === file.filename) return

      const result = await renameFileItem(file.storagePath, trimmed)
      if (!result.success) {
        toast.error(t('rename.errorToast'))
        return
      }

      toast.success(t('rename.successToast'))
    },
    [galleryFiles, renameFileItem, t],
  )

  const subtitleLabels = useMemo(
    () => ({
      pdf: t('card.subtitle.pdf'),
      image: t('card.subtitle.image'),
      video: t('card.subtitle.video'),
    }),
    [t],
  )

  const items = useMemo(
    () =>
      buildCloudGalleryItems({
        files: filtered,
        subtitleLabels,
        renderContent: (file) => (
          <CloudFileCardContent
            file={file}
            onDeleted={handleDeleted}
          />
        ),
      }),
    [filtered, subtitleLabels, handleDeleted],
  )

  const isSearching = searchQuery.trim().length > 0
  const showSpinner = loading
  const showLibraryEmpty = !loading && galleryFiles.length === 0
  const showSearchEmpty = !loading && isSearching && galleryFiles.length > 0 && items.length === 0
  const showGrid = !loading && items.length > 0
  const canLoadMore = hasMore && !isSearching
  const canAutoPrefetch = canLoadMore && !autoPrefetchBlocked

  useEffect(() => {
    if (!canAutoPrefetch || loading || isLoadingMore) return

    const scrollNotFilled =
      scrollViewport != null &&
      scrollViewport.scrollHeight <= scrollViewport.clientHeight + INFINITE_SCROLL_PREFETCH_PX
    const galleryBatchSparse = items.length < CLOUD_GALLERY_PAGE_SIZE

    if (scrollNotFilled || galleryBatchSparse) {
      handleLoadMore()
    }
  }, [
    canAutoPrefetch,
    galleryScrollHeight,
    handleLoadMore,
    items.length,
    loading,
    isLoadingMore,
    scrollViewport,
  ])

  const gridContent = (
    <div className="flex w-full min-w-0 flex-col">
      <CardInstantPreview
        items={items}
        onItemTitleChange={handleItemTitleChange}
      />
      {canLoadMore ? (
        <InfiniteScrollSentinel
          onLoadMore={handleLoadMore}
          hasMore={canLoadMore}
          isLoading={isLoadingMore}
          root={galleryScrollHeight != null ? scrollViewport : null}
          rootMargin={INFINITE_SCROLL_ROOT_MARGIN}
          className="shrink-0 basis-full"
        />
      ) : null}
      {isLoadingMore ? (
        <div
          aria-live="polite"
          className="flex shrink-0 justify-center py-4"
        >
          <Spinner
            variant="gray"
            size="sm"
          />
        </div>
      ) : null}
    </div>
  )

  return (
    <div className={cn('w-full', className)}>
      {showSpinner ? (
        <div className="flex justify-center py-16">
          <Spinner
            variant="gray"
            size="lg"
          />
        </div>
      ) : null}

      {showLibraryEmpty ? <CloudGalleryEmptyView /> : null}

      {showSearchEmpty ? <CloudGallerySearchEmptyView /> : null}

      {showGrid ? (
        galleryScrollHeight != null ? (
          <BlurredScrollArea
            orientation="vertical"
            scrollbars="vertical"
            hideScrollBar
            className="w-full"
            style={{ height: galleryScrollHeight }}
            viewportClassName="overflow-x-hidden"
            viewportRef={setScrollViewport}
          >
            {gridContent}
          </BlurredScrollArea>
        ) : (
          gridContent
        )
      ) : null}
    </div>
  )
}
