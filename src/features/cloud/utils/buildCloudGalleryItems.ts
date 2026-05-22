import type { ReactNode } from 'react'
import type { CardInstantPreviewCardProps } from '@/components/shared'
import type { FileItem } from '../types/files.types'

export function isGalleryFile(file: FileItem): boolean {
  return file.type === 'PDF' || file.type === 'Image'
}

type BuildCloudGalleryItemsArgs = {
  files: readonly FileItem[]
  subtitleLabels: { pdf: string; image: string }
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
    const subtitle = file.type === 'PDF' ? subtitleLabels.pdf : subtitleLabels.image
    const description = file.size

    if (file.type === 'PDF') {
      items.push({
        id,
        subtitle,
        title: file.filename,
        description,
        media: 'pdf',
        pdfSrc: file.url,
        content: renderContent(file),
      })
    } else {
      items.push({
        id,
        subtitle,
        title: file.filename,
        description,
        imageSrc: file.url,
        content: renderContent(file),
      })
    }
  }

  return items
}
