import { supabase } from '@/lib/supabase'

import type { ClassroomRecord } from '../types/classroom.types'

const COLUMNS =
  'id, institution_id, class_group_id, class_group_offering_id, primary_teacher_id, title, status, deactivated_at, created_at, updated_at'

export async function listClassroomsByInstitution(
  institutionId: string,
): Promise<readonly ClassroomRecord[]> {
  const { data, error } = await supabase
    .from('classrooms')
    .select(COLUMNS)
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
    .select(COLUMNS)
    .eq('class_group_id', classGroupId)
    .order('title', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as readonly ClassroomRecord[]
}

type CreateClassroomInput = {
  institutionId: string
  classGroupId: string
  classGroupOfferingId: string | null
  primaryTeacherId: string | null
  title: string
}

export async function createClassroom(input: CreateClassroomInput): Promise<ClassroomRecord> {
  const { data, error } = await supabase
    .from('classrooms')
    .insert({
      institution_id: input.institutionId,
      class_group_id: input.classGroupId,
      class_group_offering_id: input.classGroupOfferingId,
      primary_teacher_id: input.primaryTeacherId,
      title: input.title.trim(),
    })
    .select(COLUMNS)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as ClassroomRecord
}
