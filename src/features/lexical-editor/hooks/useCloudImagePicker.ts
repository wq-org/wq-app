import { useMemo, useState } from 'react'

import { useTeacherCloudFiles } from '@/features/cloud'
import type { ImageCarouselImage } from '@/components/shared/media/ImageCarousel'

export type UseCloudImagePickerReturn = {
  query: string
  setQuery: (query: string) => void
  images: ImageCarouselImage[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useCloudImagePicker(): UseCloudImagePickerReturn {
  const [query, setQuery] = useState('')
  const { cloudFiles, loading, error, refetch } = useTeacherCloudFiles()

  const images = useMemo<ImageCarouselImage[]>(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const imageFiles = cloudFiles.filter((file) => file.kind === 'image' && file.url !== null)
    const matched = normalizedQuery
      ? imageFiles.filter((file) => file.name.toLowerCase().includes(normalizedQuery))
      : imageFiles

    return matched.map((file) => ({
      url: file.url ?? '',
      title: file.name,
      storagePath: file.path,
      cloudFileId: file.cloudFileId,
    }))
  }, [cloudFiles, query])

  return { query, setQuery, images, isLoading: loading, error, refetch }
}
