import { useEffect, useState } from 'react'

import { isFileUsedInLesson } from '../api/checkFileUsage'
import { lookupCloudFileIdByStoragePath } from '../api/resolveCloudFileId'

export function useFileUsageCheck(
  cloudFileId: string | null | undefined,
  storagePath?: string | null,
) {
  const [isUsed, setIsUsed] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      let resolvedId = cloudFileId?.trim() || null

      if (!resolvedId && storagePath?.trim()) {
        resolvedId = await lookupCloudFileIdByStoragePath(storagePath)
      }

      if (!resolvedId) {
        if (!cancelled) {
          setIsUsed(false)
          setIsChecking(false)
        }
        return
      }

      setIsChecking(true)
      const used = await isFileUsedInLesson(resolvedId)
      if (!cancelled) {
        setIsUsed(used)
        setIsChecking(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [cloudFileId, storagePath])

  return { isUsed, isChecking }
}
