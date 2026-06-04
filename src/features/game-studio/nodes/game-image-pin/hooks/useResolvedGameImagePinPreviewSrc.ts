'use client'

import { useEffect, useState } from 'react'

import { getFileSignedUrl } from '@/features/cloud'

import type { GameImagePinNodeData } from '../image-pin.schema'

/**
 * Resolves a displayable image URL for preview/chat (signed URL from storage path).
 * Mirrors {@link ImagePinDialog} mount refresh without requiring a node data patch.
 */
export function useResolvedGameImagePinPreviewSrc(nodeData: GameImagePinNodeData): string {
  const storedPreview =
    typeof nodeData.imagePreview === 'string' ? nodeData.imagePreview.trim() : ''
  const filepath = typeof nodeData.filepath === 'string' ? nodeData.filepath.trim() : ''
  const [resolvedSrc, setResolvedSrc] = useState(storedPreview)

  useEffect(() => {
    setResolvedSrc(storedPreview)
  }, [storedPreview])

  useEffect(() => {
    if (!filepath) return

    let cancelled = false
    getFileSignedUrl(filepath, 3600)
      .then((freshUrl) => {
        if (cancelled) return
        setResolvedSrc(freshUrl?.trim() || storedPreview)
      })
      .catch((error) => {
        console.error('[useResolvedGameImagePinPreviewSrc] Failed to sign URL:', error)
        if (!cancelled) setResolvedSrc(storedPreview)
      })

    return () => {
      cancelled = true
    }
  }, [filepath, storedPreview])

  return resolvedSrc
}
