import { useCallback, useEffect, useMemo, useState } from 'react'

import { useUser } from '@/contexts/user'

import { listCloudFiles, renameFile } from '../api/filesApi'
import type { CloudFileItem } from '../types/files.types'
import { mapCloudFilesToFileItems } from '../utils/mapCloudFilesToFileItems'

export function useTeacherCloudFiles() {
  const { profile } = useUser()
  const [cloudFiles, setCloudFiles] = useState<CloudFileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const institutionId = profile?.userInstitutionId ?? null
  const userId = profile?.user_id ?? null
  const role = profile?.role
  const fetchEnabled = Boolean(institutionId && userId && role === 'teacher')

  const load = useCallback(async () => {
    if (!fetchEnabled || !institutionId || !userId || role !== 'teacher') {
      setCloudFiles([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await listCloudFiles(institutionId, role, userId)
      setCloudFiles(data)
    } catch (e) {
      setCloudFiles([])
      setError(e instanceof Error ? e : new Error('Failed to load cloud files'))
    } finally {
      setLoading(false)
    }
  }, [fetchEnabled, institutionId, userId, role])

  useEffect(() => {
    void load()
  }, [load])

  const fileItems = useMemo(() => mapCloudFilesToFileItems(cloudFiles), [cloudFiles])

  const renameFileItem = useCallback(
    async (storagePath: string, nextFilename: string) => {
      const result = await renameFile(storagePath, nextFilename)
      if (result.success) {
        await load()
      }
      return result
    },
    [load],
  )

  const refetch = useCallback(async () => {
    await load()
    // Storage listing can lag right after upload; one short retry keeps the gallery current.
    await new Promise((resolve) => setTimeout(resolve, 400))
    await load()
  }, [load])

  return { cloudFiles, fileItems, loading, error, refetch, renameFileItem }
}
