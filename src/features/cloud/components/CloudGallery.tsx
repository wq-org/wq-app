import { useCallback, useEffect, useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CardInstantPreview, InfiniteScrollSentinel } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { FieldInput } from '@/components/ui/field-input'
import { GridPattern } from '@/components/ui/grid-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { requestOpenCommandUploadDialog } from '@/features/command-palette'
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
  /** Fixed viewport height (px) for the card grid; content scrolls vertically when taller. */
  galleryScrollHeight?: number
  /** Registers the gallery refetch fn (e.g. wire to command-palette upload success). */
  onRefetchReady?: (refetch: () => void) => void
}

export function CloudGallery({
  className,
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
  const [query, setQuery] = useState('')
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
  const filtered = useSearchFilter(galleryFiles, query, SEARCH_FIELDS)

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

  const isSearching = query.trim().length > 0
  const showSpinner = loading
  const showLibraryEmpty = !loading && galleryFiles.length === 0
  const showSearchEmpty = !loading && isSearching && galleryFiles.length > 0 && items.length === 0
  const showGrid = !loading && items.length > 0
  // Pause infinite scroll while the user is searching — `useSearchFilter` is local,
  // so fetching more pages won't surface additional matches and just burns requests.
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
    <section className={cn('relative isolate w-full', className)}>
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

        <div className="flex w-full flex-col gap-4  w-full">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="darkblue"
              size="lg"
              onClick={requestOpenCommandUploadDialog}
              className="w-fit gap-2"
            >
              <Upload className="size-4" />
              {t('empty.uploadCta')}
            </Button>
          </div>
          <div className="w-full max-w-md">
            <FieldInput
              label={t('search.label')}
              placeholder={t('search.placeholder')}
              value={query}
              onValueChange={setQuery}
            />
          </div>
        </div>

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
    </section>
  )
}
