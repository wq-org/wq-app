import { supabase } from '@/lib/supabase'

import type { ClassroomMember, ClassroomMemberRow, ClassroomRecord } from '../types/classroom.types'
import { normalizeClassroomMemberProfileEmbed } from '../utils'

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

type CreateClassroomMemberInput = {
  institutionId: string
  classroomId: string
  userId: string
  role: 'student' | 'co_teacher'
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

export async function fetchClassroom(classroomId: string): Promise<ClassroomRecord> {
  const { data, error } = await supabase
    .from('classrooms')
    .select(COLUMNS)
    .eq('id', classroomId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as ClassroomRecord
}

const MEMBER_COLUMNS =
  'id, classroom_id, user_id, membership_role, enrolled_at, profiles(display_name, username, email, avatar_url)'

function toClassroomMember(row: ClassroomMemberRow): ClassroomMember {
  const profile = normalizeClassroomMemberProfileEmbed(row.profiles)
  const name =
    profile?.display_name?.trim() ||
    profile?.username?.trim() ||
    profile?.email?.trim() ||
    row.user_id
  const email = profile?.email?.trim() || ''
  const avatarUrl = profile?.avatar_url || null

  return {
    id: row.id,
    userId: row.user_id,
    name,
    email,
    avatarUrl,
    role: row.membership_role,
  }
}

export async function listClassroomMembers(
  classroomId: string,
): Promise<readonly ClassroomMember[]> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select(MEMBER_COLUMNS)
    .eq('classroom_id', classroomId)
    .is('withdrawn_at', null)
    .order('enrolled_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => toClassroomMember(row))
}

export async function createClassroomMember(input: CreateClassroomMemberInput): Promise<void> {
  const { error } = await supabase.from('classroom_members').insert({
    institution_id: input.institutionId,
    classroom_id: input.classroomId,
    user_id: input.userId,
    membership_role: input.role,
  })

  if (error) {
    throw new Error(error.message)
  }
}
