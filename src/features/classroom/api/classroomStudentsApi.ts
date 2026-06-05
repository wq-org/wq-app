import { supabase } from '@/lib/supabase'

import type { ClassroomStudent, ClassroomStudentRow } from '../types/classroom.types'
import { mapClassroomStudentRow } from '../utils/classroomStudent.utils'

const STUDENT_COLUMNS =
  'id, user_id, profiles(display_name, username, email, avatar_url, description)'

export async function listClassroomStudents(classroomId: string): Promise<ClassroomStudent[]> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select(STUDENT_COLUMNS)
    .eq('classroom_id', classroomId)
    .eq('membership_role', 'student')
    .is('withdrawn_at', null)
    .order('enrolled_at', { ascending: true })

  if (error) {
    console.error('listClassroomStudents:', error)
    throw error
  }

  return ((data ?? []) as ClassroomStudentRow[]).map(mapClassroomStudentRow)
}
