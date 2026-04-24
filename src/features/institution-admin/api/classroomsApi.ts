import { supabase } from '@/lib/supabase'

import type { ClassroomRecord } from '../types/classroom.types'

export async function listClassroomsByInstitution(
  institutionId: string,
): Promise<readonly ClassroomRecord[]> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('institution_id', institutionId)
    .order('title', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as readonly ClassroomRecord[]
}

export async function listClassroomsByClassGroup(
  classGroupId: string,
): Promise<readonly ClassroomRecord[]> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('class_group_id', classGroupId)
    .order('title', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as readonly ClassroomRecord[]
}
