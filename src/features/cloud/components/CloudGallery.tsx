import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CardInstantPreview } from '@/components/shared'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { FieldInput } from '@/components/ui/field-input'
import { GridPattern } from '@/components/ui/grid-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { cn } from '@/lib/utils'
import { useTeacherCloudFiles } from '../hooks/useTeacherCloudFiles'
import type { FileItem } from '../types/files.types'
import { buildCloudGalleryItems, isGalleryFile } from '../utils/buildCloudGalleryItems'
import { CloudFileCardContent } from './CloudFileCardContent'

const SEARCH_FIELDS = ['filename', 'type'] as const satisfies readonly (keyof FileItem)[]

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
  const { t: tTeacher } = useTranslation('features.teacher')
  const { fileItems, loading, error, refetch, renameFileItem } = useTeacherCloudFiles()
  const [query, setQuery] = useState('')

  useEffect(() => {
    onRefetchReady?.(refetch)
  }, [onRefetchReady, refetch])

  useEffect(() => {
    if (error) {
      toast.error(tTeacher('pages.cloud.loadError'))
    }
  }, [error, tTeacher])

  const galleryFiles = useMemo(() => fileItems.filter(isGalleryFile), [fileItems])
  const filtered = useSearchFilter(galleryFiles, query, SEARCH_FIELDS)

  const handleDeleted = useCallback(() => {
    void refetch()
  }, [refetch])

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

  const showSpinner = loading
  const showEmpty = !loading && items.length === 0
  const showGrid = !loading && items.length > 0

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

        <div className="max-w-md">
          <FieldInput
            label={t('search.label')}
            placeholder={t('search.placeholder')}
            value={query}
            onValueChange={setQuery}
          />
        </div>

        {showSpinner ? (
          <div className="flex justify-center py-16">
            <Spinner
              variant="gray"
              size="lg"
            />
          </div>
        ) : null}

        {showEmpty ? (
          <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border bg-background/60 p-8">
            <Text
              as="h3"
              variant="h3"
            >
              {t('empty.title')}
            </Text>
            <Text
              variant="body"
              muted
            >
              {t('empty.description')}
            </Text>
          </div>
        ) : null}

        {showGrid ? (
          galleryScrollHeight != null ? (
            <BlurredScrollArea
              orientation="vertical"
              scrollbars="vertical"
              hideScrollBar
              className="w-full"
              style={{ height: galleryScrollHeight }}
              viewportClassName="overflow-x-hidden"
            >
              <CardInstantPreview
                items={items}
                onItemTitleChange={handleItemTitleChange}
              />
            </BlurredScrollArea>
          ) : (
            <CardInstantPreview
              items={items}
              onItemTitleChange={handleItemTitleChange}
            />
          )
        ) : null}
      </div>
    </section>
  )
}
