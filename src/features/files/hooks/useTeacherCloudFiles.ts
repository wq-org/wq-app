import { useCallback, useEffect, useMemo, useState } from 'react'

import { useUser } from '@/contexts/user'

import { listCloudFiles } from '../api/filesApi'
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

  return { cloudFiles, fileItems, loading, error, refetch: load }
}
