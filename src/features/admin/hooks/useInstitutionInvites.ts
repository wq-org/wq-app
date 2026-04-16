import { useCallback, useEffect, useState } from 'react'

import {
  fetchEmailsForUserIds,
  listInstitutionInvites,
  resendInviteEmail,
} from '../api/institutionInvitesApi'
import type { InstitutionInvite } from '../types/institutionInvites.types'

type UseInstitutionInvitesResult = {
  invites: InstitutionInvite[]
  inviterEmailByUserId: ReadonlyMap<string, string>
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  resend: (institutionId: string) => Promise<void>
}

export function useInstitutionInvites(): UseInstitutionInvitesResult {
  const [invites, setInvites] = useState<InstitutionInvite[]>([])
  const [inviterEmailByUserId, setInviterEmailByUserId] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await listInstitutionInvites()
      const inviterIds = list
        .map((row) => row.invitedByUserId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
      const emailMap = await fetchEmailsForUserIds(inviterIds)
      setInvites(list)
      setInviterEmailByUserId(emailMap)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setInvites([])
      setInviterEmailByUserId(new Map())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const resend = useCallback(async (institutionId: string): Promise<void> => {
    await resendInviteEmail(institutionId)
  }, [])

  return {
    invites,
    inviterEmailByUserId: inviterEmailByUserId as ReadonlyMap<string, string>,
    isLoading,
    error,
    refresh: load,
    resend,
  }
}
