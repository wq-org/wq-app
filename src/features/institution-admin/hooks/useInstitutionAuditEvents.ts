import { useCallback, useEffect, useState } from 'react'

import { useUser } from '@/contexts/user'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'
import {
  listInstitutionAuditEvents,
  type InstitutionAuditEventRow,
} from '../api/institutionAuditLogsApi'

type UseInstitutionAuditEventsResult = {
  events: InstitutionAuditEventRow[]
  actorEmailByUserId: ReadonlyMap<string, string>
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useInstitutionAuditEvents(): UseInstitutionAuditEventsResult {
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()

  const [events, setEvents] = useState<InstitutionAuditEventRow[]>([])
  const [actorEmailByUserId, setActorEmailByUserId] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!institutionId) {
      setEvents([])
      setActorEmailByUserId(new Map())
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const [auditEvents, users] = await Promise.all([
        listInstitutionAuditEvents(),
        fetchInstitutionUserDirectory(institutionId),
      ])
      const map = new Map<string, string>()
      for (const user of users) {
        if (user.email?.trim()) {
          map.set(user.user_id, user.email.trim())
        }
      }
      setEvents(auditEvents)
      setActorEmailByUserId(map)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setEvents([])
      setActorEmailByUserId(new Map())
    } finally {
      setIsLoading(false)
    }
  }, [institutionId])

  useEffect(() => {
    void load()
  }, [load])

  return {
    events,
    actorEmailByUserId: actorEmailByUserId as ReadonlyMap<string, string>,
    isLoading,
    error,
    refresh: load,
  }
}
