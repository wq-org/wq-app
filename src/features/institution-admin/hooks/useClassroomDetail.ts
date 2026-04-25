import { useCallback, useEffect, useState } from 'react'

import { fetchClassroom, listClassroomMembers } from '../api/classroomsApi'
import type { ClassroomMember, ClassroomRecord } from '../types/classroom.types'

type UseClassroomDetailParams = {
  classroomId: string | null
}

export function useClassroomDetail({ classroomId }: UseClassroomDetailParams) {
  const [classroom, setClassroom] = useState<ClassroomRecord | null>(null)
  const [members, setMembers] = useState<readonly ClassroomMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  const reload = useCallback(() => {
    setReloadVersion((previous) => previous + 1)
  }, [])

  useEffect(() => {
    if (!classroomId) {
      setClassroom(null)
      setMembers([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [classroomData, membersData] = await Promise.all([
          fetchClassroom(classroomId),
          listClassroomMembers(classroomId),
        ])

        if (cancelled) return

        setClassroom(classroomData)
        setMembers(membersData)
      } catch (loadError) {
        if (!cancelled) {
          setClassroom(null)
          setMembers([])
          setError(loadError instanceof Error ? loadError.message : 'Failed to load classroom')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [classroomId, reloadVersion])

  return {
    classroom,
    members,
    isLoading,
    error,
    reload,
  }
}
