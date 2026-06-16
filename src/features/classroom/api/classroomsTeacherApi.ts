import { supabase } from '@/lib/supabase'

import type { TeacherClassroomListRow, TeacherClassroomSummary } from '../types/classroom.types'

type ClassroomRow = {
  id: string
  title: string
}

function aggregateStudentCounts(
  classroomIds: readonly string[],
  memberRows: readonly { classroom_id: string }[] | null,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const id of classroomIds) {
    counts.set(id, 0)
  }
  for (const row of memberRows ?? []) {
    const id = row.classroom_id
    if (!counts.has(id)) continue
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

/**
 * Classrooms the signed-in teacher may see (primary or active co-teacher membership).
 * RLS on `classrooms` and `classroom_members` enforces institution and role scope.
 */
export async function listTeacherClassrooms(): Promise<TeacherClassroomListRow[]> {
  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('id, title')
    .order('title', { ascending: true })

  if (classroomsError) {
    console.error('listTeacherClassrooms (classrooms):', classroomsError)
    throw classroomsError
  }

  const rows = (classrooms ?? []) as ClassroomRow[]
  if (rows.length === 0) {
    return []
  }

  const ids = rows.map((r) => r.id)

  const { data: members, error: membersError } = await supabase
    .from('classroom_members')
    .select('classroom_id')
    .in('classroom_id', ids)
    .eq('membership_role', 'student')
    .is('withdrawn_at', null)

  if (membersError) {
    console.error('listTeacherClassrooms (members):', membersError)
    throw membersError
  }

  const counts = aggregateStudentCounts(ids, members as { classroom_id: string }[] | null)

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    studentCount: counts.get(r.id) ?? 0,
  }))
}

export async function createTeacherClassroom(input: {
  title: string
  description?: string
}): Promise<TeacherClassroomSummary> {
  const { data, error } = await supabase.rpc('create_teacher_classroom', {
    p_title: input.title.trim(),
    p_description: input.description?.trim() ?? null,
  })

  if (error) {
    console.error('createTeacherClassroom:', error)
    throw error
  }

  const row = Array.isArray(data) ? data[0] : data
  return row as TeacherClassroomSummary
}
