import { useCallback, useEffect, useState } from 'react'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'
import type { InstitutionDirectoryRow } from '../types/institution-users.types'

type Options = {
  enabled?: boolean
}

export function useInstitutionUsers(
  institutionId: string | null,
  { enabled = true }: Options = {},
) {
  const [users, setUsers] = useState<InstitutionDirectoryRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!institutionId || !enabled) {
      setUsers([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const rows = await fetchInstitutionUserDirectory(institutionId)
      setUsers(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [institutionId, enabled])

  useEffect(() => {
    void load()
  }, [load])

  return { users, isLoading, error, refresh: load }
}
