'use client'

import { useEffect, useState } from 'react'

import { getFileSignedUrl, lookupStoragePathByCloudFileId } from '@/features/cloud'

import { resolveGameImagePinStoragePath } from '../../../utils/gameImagePinStoragePath'
import type { GameImagePinNodeData } from '../image-pin.schema'

const SIGNED_URL_TTL_SECONDS = 3600

function pickStoredPreviewFallback(storedPreview: string, storagePath: string): string {
  if (!storedPreview) return ''
  // Published snapshots embed a teacher-scoped signed URL that may expire.
  // We still use it as the initial display value so the image shows immediately;
  // the effect below replaces it with a fresh signed URL when one is available.
  // Returning '' here caused a blank image flash while the refresh was in-flight.
  void storagePath // storagePath used only for the refresh branch, not to suppress preview
  return storedPreview
}

/**
 * Resolves a displayable image URL for preview/chat (signed URL from storage path).
 * Mirrors {@link ImagePinDialog} mount refresh without requiring a node data patch.
 */
export function useResolvedGameImagePinPreviewSrc(nodeData: GameImagePinNodeData): string {
  const storedPreview =
    typeof nodeData.imagePreview === 'string' ? nodeData.imagePreview.trim() : ''
  const cloudFileId = typeof nodeData.cloudFileId === 'string' ? nodeData.cloudFileId.trim() : ''
  const storagePath = resolveGameImagePinStoragePath(nodeData) ?? ''
  const storedFallback = pickStoredPreviewFallback(storedPreview, storagePath)
  const [resolvedSrc, setResolvedSrc] = useState(storedFallback)

  useEffect(() => {
    setResolvedSrc(storedFallback)
  }, [storedFallback])

  useEffect(() => {
    let cancelled = false

    async function resolveFreshSignedUrl(): Promise<void> {
      let path = storagePath
      if (!path && cloudFileId) {
        path = (await lookupStoragePathByCloudFileId(cloudFileId))?.trim() ?? ''
      }
      if (!path) return

      try {
        const freshUrl = await getFileSignedUrl(path, SIGNED_URL_TTL_SECONDS)
        if (cancelled) return
        setResolvedSrc(freshUrl?.trim() || storedFallback)
      } catch (error) {
        console.error('[useResolvedGameImagePinPreviewSrc] Failed to sign URL:', error)
        if (!cancelled) setResolvedSrc(storedFallback)
      }
    }

    void resolveFreshSignedUrl()

    return () => {
      cancelled = true
    }
  }, [cloudFileId, storagePath, storedFallback])

  return resolvedSrc
}
