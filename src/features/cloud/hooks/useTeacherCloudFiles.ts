import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useUser } from '@/contexts/user'
import type { UserRole } from '@/features/auth'

import { CLOUD_GALLERY_PAGE_SIZE, listCloudFilesStoragePage, renameFile } from '../api/filesApi'
import type { CloudFileItem } from '../types/files.types'
import { mapCloudFilesToFileItems } from '../utils/mapCloudFilesToFileItems'

export function useTeacherCloudFiles() {
  const { profile } = useUser()
  const [cloudFiles, setCloudFiles] = useState<CloudFileItem[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(0)
  const [loading, setLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [autoPrefetchBlocked, setAutoPrefetchBlocked] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const fetchTokenRef = useRef(0)

  const institutionId = profile?.userInstitutionId ?? null
  const userId = profile?.user_id ?? null
  const role = profile?.role as UserRole | undefined
  const fetchEnabled = Boolean(
    institutionId && userId && (role === 'teacher' || role === 'student'),
  )

  const loadInitial = useCallback(async () => {
    if (!fetchEnabled || !institutionId || !userId || !role) {
      setCloudFiles([])
      setNextOffset(null)
      setError(null)
      setLoading(false)
      return
    }

    const token = ++fetchTokenRef.current
    setLoading(true)
    setError(null)
    setAutoPrefetchBlocked(false)
    try {
      const page = await listCloudFilesStoragePage({
        institutionId,
        role,
        userId,
        offset: 0,
        pageSize: CLOUD_GALLERY_PAGE_SIZE,
      })
      if (token !== fetchTokenRef.current) return
      setCloudFiles(page.items)
      setNextOffset(page.nextOffset)
    } catch (e) {
      if (token !== fetchTokenRef.current) return
      setCloudFiles([])
      setNextOffset(null)
      setError(e instanceof Error ? e : new Error('Failed to load cloud files'))
    } finally {
      if (token === fetchTokenRef.current) {
        setLoading(false)
      }
    }
  }, [fetchEnabled, institutionId, role, userId])

  const loadMore = useCallback(async () => {
    if (!fetchEnabled || !institutionId || !userId || !role) return
    if (nextOffset === null || isLoadingMore || loading) return

    const token = fetchTokenRef.current
    setIsLoadingMore(true)
    try {
      const page = await listCloudFilesStoragePage({
        institutionId,
        role,
        userId,
        offset: nextOffset,
        pageSize: CLOUD_GALLERY_PAGE_SIZE,
      })
      if (token !== fetchTokenRef.current) return
      let newItemCount = 0
      setCloudFiles((prev) => {
        const seen = new Set(prev.map((item) => item.path))
        const additions = page.items.filter((item) => !seen.has(item.path))
        newItemCount = additions.length
        return additions.length === 0 ? prev : [...prev, ...additions]
      })
      if (newItemCount === 0) {
        setAutoPrefetchBlocked(true)
      }
      setNextOffset(page.nextOffset)
    } catch (e) {
      if (token !== fetchTokenRef.current) return
      setError(e instanceof Error ? e : new Error('Failed to load more cloud files'))
    } finally {
      setIsLoadingMore(false)
    }
  }, [fetchEnabled, institutionId, role, userId, nextOffset, isLoadingMore, loading])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  const fileItems = useMemo(() => mapCloudFilesToFileItems(cloudFiles), [cloudFiles])

  const renameFileItem = useCallback(
    async (storagePath: string, nextFilename: string) => {
      const result = await renameFile(storagePath, nextFilename)
      if (result.success) {
        await loadInitial()
      }
      return result
    },
    [loadInitial],
  )

  const refetch = useCallback(async () => {
    await loadInitial()
  }, [loadInitial])

  const hasMore = nextOffset !== null

  return {
    cloudFiles,
    fileItems,
    loading,
    error,
    refetch,
    renameFileItem,
    hasMore,
    isLoadingMore,
    autoPrefetchBlocked,
    loadMore,
  }
}
