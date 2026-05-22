import type { ReactNode } from 'react'
import { CARD_INSTANT_PREVIEW_MEDIA, type CardInstantPreviewCardProps } from '@/components/shared'
import type { FileItem } from '../types/files.types'

export function isGalleryFile(file: FileItem): boolean {
  return file.type === 'PDF' || file.type === 'Image' || file.type === 'Video'
}

type BuildCloudGalleryItemsArgs = {
  files: readonly FileItem[]
  subtitleLabels: { pdf: string; image: string; video: string }
  renderContent: (file: FileItem) => ReactNode
}

export function buildCloudGalleryItems({
  files,
  subtitleLabels,
  renderContent,
}: BuildCloudGalleryItemsArgs): CardInstantPreviewCardProps[] {
  const items: CardInstantPreviewCardProps[] = []

  for (const file of files) {
    if (!isGalleryFile(file)) continue
    if (!file.url) continue

    const id = file.storagePath ?? String(file.id)
    const content = renderContent(file)

    if (file.type === 'PDF') {
      items.push({
        id,
        subtitle: subtitleLabels.pdf,
        title: file.filename,
        description: '',
        media: CARD_INSTANT_PREVIEW_MEDIA.pdf,
        pdfSrc: file.url,
        content,
      })
      continue
    }

    if (file.type === 'Video') {
      items.push({
        id,
        subtitle: subtitleLabels.video,
        title: file.filename,
        description: '',
        media: CARD_INSTANT_PREVIEW_MEDIA.video,
        videoSrc: file.url,
        content,
      })
      continue
    }

    items.push({
      id,
      subtitle: subtitleLabels.image,
      title: file.filename,
      description: '',
      imageSrc: file.url,
      content,
    })
  }

  return items
}
