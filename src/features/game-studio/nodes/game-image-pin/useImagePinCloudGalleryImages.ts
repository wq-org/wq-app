import { useEffect, useState } from 'react'

import { fetchFilesByRole } from '@/components/shared/upload-files/api'
import { getFileSignedUrl } from '@/features/cloud'
import { useUser } from '@/contexts/user/UserContext'

import { buildCloudUserObjectPrefix, mapUserRoleToCloudPathRole } from './gameImagePinCloudRole'

export type ImagePinGalleryImage = {
  url: string
  title: string
  storagePath?: string
}

const IMAGE_NAME_PATTERN = /\.(jpe?g|png|gif|webp)$/i

/**
 * Lists image files in the signed-in user's cloud folder so the Image Pin editor
 * can show them in `ImageCarousel` even when no other canvas node has an image yet.
 */
export type UseImagePinCloudGalleryImagesResult = {
  items: ImagePinGalleryImage[]
  isLoading: boolean
}

export function useImagePinCloudGalleryImages(
  refreshToken = 0,
): UseImagePinCloudGalleryImagesResult {
  const { getUserId, getUserInstitutionId, getRole } = useUser()
  const [items, setItems] = useState<ImagePinGalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      try {
        const institutionId = getUserInstitutionId()
        const userId = getUserId()
        const role = mapUserRoleToCloudPathRole(getRole())

        if (!institutionId?.trim() || !userId?.trim() || !role) {
          setItems([])
          return
        }

        const inst = institutionId.trim()
        const uid = userId.trim()
        const res = await fetchFilesByRole(inst, role, uid, { limit: 100 })
        if (cancelled) return

        if (!res.success || !res.files?.length) {
          setItems([])
          return
        }

        const prefix = buildCloudUserObjectPrefix(inst, role, uid)
        const next: ImagePinGalleryImage[] = []

        for (const f of res.files) {
          if (!f.name) continue
          if (!IMAGE_NAME_PATTERN.test(f.name)) continue
          const path = `${prefix}${f.name}`
          // Use signed URL for private buckets (expires in 1 hour)
          const url = await getFileSignedUrl(path, 3600)
          if (!url) {
            console.warn('[ImagePinGallery] Failed to get signed URL for:', path)
            continue
          }
          next.push({ url, title: f.name, storagePath: path })
        }

        setItems(next)
      } finally {
        setIsLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [getRole, getUserId, getUserInstitutionId, refreshToken])

  return { items, isLoading }
}
