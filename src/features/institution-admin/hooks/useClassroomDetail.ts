import { useCallback, useEffect, useState } from 'react'

import { fetchClassGroup } from '../api/classGroupsApi'
import { fetchClassroom, listClassroomMembers } from '../api/classroomsApi'
import { fetchCohort } from '../api/cohortsApi'
import { fetchFaculty } from '../api/facultiesApi'
import { fetchProgramme } from '../api/programmesApi'
import type { ClassroomMember, ClassroomRecord } from '../types/classroom.types'

type UseClassroomDetailParams = {
  classroomId: string | null
}

export type ClassroomBreadcrumbContext = {
  facultyId: string
  facultyName: string
  programmeId: string
  programmeName: string
  cohortId: string
  cohortName: string
  classGroupId: string
  classGroupName: string
}

export function useClassroomDetail({ classroomId }: UseClassroomDetailParams) {
  const [classroom, setClassroom] = useState<ClassroomRecord | null>(null)
  const [members, setMembers] = useState<readonly ClassroomMember[]>([])
  const [breadcrumb, setBreadcrumb] = useState<ClassroomBreadcrumbContext | null>(null)
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
      setBreadcrumb(null)
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

        const classGroup = await fetchClassGroup(classroomData.class_group_id)
        const cohort = await fetchCohort(classGroup.cohort_id)
        const programme = await fetchProgramme(cohort.programme_id)
        const faculty = await fetchFaculty(programme.faculty_id)

        if (cancelled) return

        setBreadcrumb({
          facultyId: faculty.id,
          facultyName: faculty.name,
          programmeId: programme.id,
          programmeName: programme.name,
          cohortId: cohort.id,
          cohortName: cohort.name,
          classGroupId: classGroup.id,
          classGroupName: classGroup.name,
        })
      } catch (loadError) {
        if (!cancelled) {
          setClassroom(null)
          setMembers([])
          setBreadcrumb(null)
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
    breadcrumb,
    isLoading,
    error,
    reload,
  }
}
