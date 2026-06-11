import {
  BellRing,
  BookOpen,
  Cloud,
  Gamepad2,
  Hand,
  Home,
  MessageCircle,
  MousePointer2,
  Plus,
  Search as SearchIcon,
  Upload,
  Building2,
  ListTodo,
  NotebookPen,
  StickyNote,
} from 'lucide-react'
import { AgentComputerIcon } from '@/components/shared'
import type { AddType, CommandBarItem, CommandBarView } from '../types/command-bar.types'
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
    availableForRoles: ['super_admin', 'institution_admin', 'teacher'] as const,
  },
  {
    type: 'attendance' as const,
    labelKey: 'actions.attendance',
    descriptionKey: 'actions.attendanceStart',
    icon: BellRing,
    availableForRoles: ['teacher'] as const,
  },
] satisfies readonly AddOption[]

export const TYPE_LABEL_KEYS: Record<AddType, string> = {
  course: 'addDialog.types.course',
  institution: 'addDialog.types.institution',
  game: 'addDialog.types.game',
  node: 'addDialog.types.node',
  note: 'addDialog.types.note',
  task: 'addDialog.types.task',
  attendance: 'actions.attendance',
}

export const LESSONS_VIEW_COMMAND_ITEMS: readonly CommandBarItem[] = [
  {
    id: 'agent',
    labelKey: 'actions.agent',
    icon: AgentComputerIcon,
    actionId: 'agent',
  },
]

export const VIEW_COMMAND_ITEMS: Record<CommandBarView, readonly CommandBarItem[]> = {
  'game-studio': [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: '/teacher/dashboard',
    },
    {
      id: 'pan',
      labelKey: 'navigation.pan',
      icon: Hand,
      actionId: 'pan',
    },
    {
      id: 'select',
      labelKey: 'navigation.select',
      icon: MousePointer2,
      actionId: 'select',
    },
    {
      id: 'agent',
      labelKey: 'actions.agent',
      icon: AgentComputerIcon,
      actionId: 'agent',
    },
    {
      id: 'upload',
      labelKey: 'actions.upload',
      icon: Upload,
      actionId: 'upload',
    },
  ],
  lessons: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: '/teacher/dashboard',
    },
    {
      id: 'search',
      labelKey: 'actions.search',
      icon: SearchIcon,
      actionId: 'search',
    },
    {
      id: 'chat',
      labelKey: 'actions.chat',
      icon: MessageCircle,
      to: '/teacher/chat',
    },
    {
      id: 'cloud',
      labelKey: 'actions.cloud',
      icon: Cloud,
      to: '/teacher/cloud',
    },
    {
      id: 'add-new',
      labelKey: 'actions.addNew',
      icon: Plus,
      actionId: 'add',
    },
    {
      id: 'upload',
      labelKey: 'actions.upload',
      icon: Upload,
      actionId: 'upload',
    },
    {
      id: 'notebook',
      labelKey: 'actions.notebook',
      icon: NotebookPen,
      to: '/teacher/notes',
    },
    ...LESSONS_VIEW_COMMAND_ITEMS,
  ],
}
