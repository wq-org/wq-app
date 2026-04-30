import { BookOpen, Building2, Gamepad2, ListTodo, StickyNote } from 'lucide-react'
import type { AddType } from '../types/command-bar.types'
import type { UserRole } from '@/features/auth'

export type AddOption = {
  readonly type: AddType
  readonly labelKey: string
  readonly descriptionKey: string
  readonly icon: typeof BookOpen
  readonly availableForRoles: readonly UserRole[]
}

export const ADD_OPTIONS = [
  {
    type: 'course' as const,
    labelKey: 'addDialog.options.course.label',
    descriptionKey: 'addDialog.options.course.description',
    icon: BookOpen,
    availableForRoles: ['super_admin', 'institution_admin', 'teacher'] as const,
  },
  {
    type: 'institution' as const,
    labelKey: 'addDialog.options.institution.label',
    descriptionKey: 'addDialog.options.institution.description',
    icon: Building2,
    availableForRoles: ['super_admin'] as const,
  },
  {
    type: 'game' as const,
    labelKey: 'addDialog.options.game.label',
    descriptionKey: 'addDialog.options.game.description',
    icon: Gamepad2,
    availableForRoles: ['super_admin', 'institution_admin', 'teacher'] as const,
  },
  {
    type: 'note' as const,
    labelKey: 'addDialog.options.note.label',
    descriptionKey: 'addDialog.options.note.description',
    icon: StickyNote,
    availableForRoles: ['super_admin', 'institution_admin', 'teacher', 'student'] as const,
  },
  {
    type: 'task' as const,
    labelKey: 'addDialog.options.task.label',
    descriptionKey: 'addDialog.options.task.description',
    icon: ListTodo,
    availableForRoles: ['super_admin', 'institution_admin', 'teacher', 'student'] as const,
  },
] satisfies readonly AddOption[]

export const TYPE_LABEL_KEYS: Record<AddType, string> = {
  course: 'addDialog.types.course',
  institution: 'addDialog.types.institution',
  game: 'addDialog.types.game',
  node: 'addDialog.types.node',
  note: 'addDialog.types.note',
  task: 'addDialog.types.task',
}
