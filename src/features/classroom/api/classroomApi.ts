import { supabase } from '@/lib/supabase'

import type { ClassroomSummary } from '../types/classroom.types'

export async function getClassroomById(classroomId: string): Promise<ClassroomSummary | null> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('id, title')
    .eq('id', classroomId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  return {
    id: data.id as string,
    title: typeof data.title === 'string' ? data.title : '',
  }
}
