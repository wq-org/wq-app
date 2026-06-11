import type { UserRole } from '@/features/auth'
import { USER_ROLES } from '@/features/auth'

export function buildNoteListRoute(role: 'teacher' | 'student'): string {
  return `/${role}/notes`
}

export function buildNoteEditorRoute(role: 'teacher' | 'student', noteId: string): string {
  return `/${role}/notes/${noteId}`
}

export function resolveNoteEditorRoute(role: UserRole | null, noteId: string): string | null {
  if (role === USER_ROLES.TEACHER) return buildNoteEditorRoute('teacher', noteId)
  if (role === USER_ROLES.STUDENT) return buildNoteEditorRoute('student', noteId)
  return null
}
