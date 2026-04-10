import { useCallback, useEffect, useMemo, useState } from 'react'

import { listAuditEvents, type AuditEventRow } from '../api/auditLogsApi'
import { listAdminUsers } from '../api/userApi'

type UseAuditEventsResult = {
  events: AuditEventRow[]
  actorEmailByUserId: ReadonlyMap<string, string>
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useAuditEvents(): UseAuditEventsResult {
  const [events, setEvents] = useState<AuditEventRow[]>([])
  const [actorEmailByUserId, setActorEmailByUserId] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [evts, users] = await Promise.all([listAuditEvents(), listAdminUsers()])
      const map = new Map<string, string>()
      for (const u of users) {
        if (u.email?.trim()) {
          map.set(u.user_id, u.email.trim())
        }
      }
      setEvents(evts)
      setActorEmailByUserId(map)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setEvents([])
      setActorEmailByUserId(new Map())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const readonlyMap = useMemo(() => actorEmailByUserId, [actorEmailByUserId])

  return {
    events,
    actorEmailByUserId: readonlyMap,
    isLoading,
    error,
    refresh: load,
  }
}
