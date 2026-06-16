import { supabase } from '@/lib/supabase'

import type { ClassroomMember, ClassroomMemberRow, ClassroomRecord } from '../types/classroom.types'
import { normalizeClassroomMemberProfileEmbed } from '../utils'

const COLUMNS =
  'id, institution_id, primary_teacher_id, title, status, deactivated_at, created_at, updated_at'

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

type CreateClassroomInput = {
  institutionId: string
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
      primary_teacher_id: input.primaryTeacherId,
      title: input.title.trim(),
    })
    .select(COLUMNS)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const created = data as ClassroomRecord

  if (input.primaryTeacherId) {
    await ensurePrimaryTeacherMembership({
      classroomId: created.id,
      institutionId: input.institutionId,
      userId: input.primaryTeacherId,
    })
  }

  return created
}

/** Keeps `classrooms.primary_teacher_id` aligned with an active co_teacher membership row (required by DB docs / list_active_classroom_ids). */
export async function ensurePrimaryTeacherMembership(input: {
  classroomId: string
  institutionId: string
  userId: string
}): Promise<void> {
  const { data: rows, error } = await supabase
    .from('classroom_members')
    .select('id, withdrawn_at, membership_role, enrolled_at')
    .eq('classroom_id', input.classroomId)
    .eq('user_id', input.userId)

  if (error) {
    throw new Error(error.message)
  }

  const list = rows ?? []
  const active = list.find((row) => row.withdrawn_at == null)

  if (active) {
    if (active.membership_role !== 'co_teacher') {
      const { error: updateError } = await supabase
        .from('classroom_members')
        .update({
          membership_role: 'co_teacher',
          updated_at: new Date().toISOString(),
        })
        .eq('id', active.id)

      if (updateError) {
        throw new Error(updateError.message)
      }
    }
    return
  }

  const withdrawnRows = list.filter((row) => row.withdrawn_at != null)
  const withdrawn = withdrawnRows.sort(
    (a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime(),
  )[0]

  if (withdrawn) {
    const { error: reactivateError } = await supabase
      .from('classroom_members')
      .update({
        withdrawn_at: null,
        leave_reason: null,
        membership_role: 'co_teacher',
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawn.id)

    if (reactivateError) {
      throw new Error(reactivateError.message)
    }
    return
  }

  await createClassroomMember({
    classroomId: input.classroomId,
    institutionId: input.institutionId,
    userId: input.userId,
    role: 'co_teacher',
  })
}

/**
 * Inverse of `ensurePrimaryTeacherMembership`: when a classroom's primary
 * teacher is unassigned, soft-withdraw the synthetic `co_teacher` row that
 * was created for them. Without this the user keeps appearing in the
 * Co-Teachers card even though the institution admin meant to remove them.
 *
 * We soft-withdraw (set `withdrawn_at = now()`) instead of deleting:
 *  - `listClassroomMembers` already filters `withdrawn_at IS NULL`, so the
 *    UI hides them immediately.
 *  - The audit trigger logs `classroom_member.withdrawn` automatically.
 *  - If the same user is later re-assigned as primary teacher,
 *    `ensurePrimaryTeacherMembership` reactivates the same row (sets
 *    `withdrawn_at = NULL`), so no duplicate history is created.
 */
async function withdrawPrimaryTeacherMembership(input: {
  classroomId: string
  userId: string
}): Promise<void> {
  const { error } = await supabase
    .from('classroom_members')
    .update({
      withdrawn_at: new Date().toISOString(),
      leave_reason: 'primary_teacher_unassigned',
      updated_at: new Date().toISOString(),
    })
    .eq('classroom_id', input.classroomId)
    .eq('user_id', input.userId)
    .is('withdrawn_at', null)

  if (error) {
    throw new Error(error.message)
  }
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

type UpdateClassroomInput = {
  classroomId: string
  title?: string
  primaryTeacherId?: string | null
  status?: ClassroomRecord['status']
}

export async function updateClassroom(input: UpdateClassroomInput): Promise<ClassroomRecord> {
  // When unassigning the primary teacher we need the *previous* id (the
  // UPDATE-then-RETURN gives us the new row only). Read it first so the
  // cleanup below knows which membership row to withdraw.
  let previousPrimaryTeacherId: string | null = null
  if (input.primaryTeacherId === null) {
    const { data: existing, error: existingError } = await supabase
      .from('classrooms')
      .select('primary_teacher_id')
      .eq('id', input.classroomId)
      .single()
    if (existingError) throw new Error(existingError.message)
    previousPrimaryTeacherId =
      (existing as { primary_teacher_id: string | null } | null)?.primary_teacher_id ?? null
  }

  const patch: Record<string, unknown> = {}
  if (input.title !== undefined) patch.title = input.title.trim()
  if (input.primaryTeacherId !== undefined) patch.primary_teacher_id = input.primaryTeacherId
  if (input.status !== undefined) patch.status = input.status

  const { data, error } = await supabase
    .from('classrooms')
    .update(patch)
    .eq('id', input.classroomId)
    .select(COLUMNS)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const updated = data as ClassroomRecord

  if (input.primaryTeacherId !== undefined && input.primaryTeacherId !== null) {
    await ensurePrimaryTeacherMembership({
      classroomId: updated.id,
      institutionId: updated.institution_id,
      userId: input.primaryTeacherId,
    })
  }

  // Symmetric cleanup: unassigning the primary teacher must also clear the
  // synthetic co_teacher membership row, otherwise the former main teacher
  // keeps showing up in the Co-Teachers card.
  if (input.primaryTeacherId === null && previousPrimaryTeacherId !== null) {
    await withdrawPrimaryTeacherMembership({
      classroomId: updated.id,
      userId: previousPrimaryTeacherId,
    })
  }

  return updated
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

export async function withdrawClassroomMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('classroom_members')
    .update({ withdrawn_at: new Date().toISOString() })
    .eq('id', memberId)

  if (error) {
    throw new Error(error.message)
  }
}
