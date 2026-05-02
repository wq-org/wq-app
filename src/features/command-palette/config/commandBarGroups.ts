import {
  BellElectric,
  Cloud,
  Hand,
  Home,
  MessageCircle,
  MousePointer2,
  NotebookPen,
  Plus,
  Search as SearchIcon,
  Upload,
} from 'lucide-react'
import { USER_ROLES, getRoleRoutePrefix } from '@/features/auth'
import type {
  CommandBarContext,
  CommandBarGroup,
  CommandBarItem,
  CommandRoleContext,
} from '../types/command-bar.types'

function rolePrefix(role: CommandRoleContext): string {
  return getRoleRoutePrefix(role) ?? '/teacher'
}

const commandItemsByContext: Record<CommandBarContext, readonly CommandBarItem[]> = {
  [USER_ROLES.TEACHER]: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: `${rolePrefix(USER_ROLES.TEACHER)}/dashboard`,
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
      to: `${rolePrefix(USER_ROLES.TEACHER)}/chat`,
    },
    {
      id: 'cloud',
      labelKey: 'actions.cloud',
      icon: Cloud,
      to: `${rolePrefix(USER_ROLES.TEACHER)}/cloud`,
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
      to: `${rolePrefix(USER_ROLES.TEACHER)}/notes`,
    },
    {
      id: 'attendance',
      labelKey: 'actions.attendance',
      icon: BellElectric,
    },
  ],
  [USER_ROLES.INSTITUTION_ADMIN]: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: `${rolePrefix(USER_ROLES.INSTITUTION_ADMIN)}/dashboard`,
    },
    {
      id: 'search',
      labelKey: 'actions.search',
      icon: SearchIcon,
      actionId: 'search',
    },
    {
      id: 'cloud',
      labelKey: 'actions.cloud',
      icon: Cloud,
      to: `${rolePrefix(USER_ROLES.INSTITUTION_ADMIN)}/cloud-storage`,
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
      to: `${rolePrefix(USER_ROLES.INSTITUTION_ADMIN)}/notes`,
    },
  ],
  [USER_ROLES.STUDENT]: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: `${rolePrefix(USER_ROLES.STUDENT)}/dashboard`,
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
      to: `${rolePrefix(USER_ROLES.STUDENT)}/chat`,
    },
    {
      id: 'cloud',
      labelKey: 'actions.cloud',
      icon: Cloud,
      to: `${rolePrefix(USER_ROLES.STUDENT)}/files`,
    },
    {
      id: 'add',
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
      to: `${rolePrefix(USER_ROLES.STUDENT)}/notes`,
    },
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: `${rolePrefix(USER_ROLES.SUPER_ADMIN)}/dashboard`,
    },
    {
      id: 'search',
      labelKey: 'actions.search',
      icon: SearchIcon,
      actionId: 'search',
    },
    {
      id: 'cloud',
      labelKey: 'actions.cloud',
      icon: Cloud,
      to: `${rolePrefix(USER_ROLES.SUPER_ADMIN)}/files`,
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
      to: `${rolePrefix(USER_ROLES.SUPER_ADMIN)}/notes`,
    },
  ],
  'game-studio': [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      actionId: 'home',
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
      id: 'upload',
      labelKey: 'actions.upload',
      icon: Upload,
      actionId: 'upload',
    },
  ],
}

const commandGroupsByContext: Record<CommandRoleContext, readonly CommandBarGroup[]> = {
  [USER_ROLES.TEACHER]: [
    {
      id: USER_ROLES.TEACHER,
      items: [...commandItemsByContext[USER_ROLES.TEACHER]],
    },
  ],
  [USER_ROLES.INSTITUTION_ADMIN]: [
    {
      id: USER_ROLES.INSTITUTION_ADMIN,
      items: [...commandItemsByContext[USER_ROLES.INSTITUTION_ADMIN]],
    },
  ],
  [USER_ROLES.STUDENT]: [
    {
      id: USER_ROLES.STUDENT,
      items: [...commandItemsByContext[USER_ROLES.STUDENT]],
    },
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    {
      id: USER_ROLES.SUPER_ADMIN,
      items: [...commandItemsByContext[USER_ROLES.SUPER_ADMIN]],
    },
  ],
}

export function getRoutePrefixForRole(role: CommandRoleContext): string {
  return rolePrefix(role)
}

export function getCommandGroupsByRole(role: CommandRoleContext): readonly CommandBarGroup[] {
  return commandGroupsByContext[role]
}

export function getCommandBarGroups(
  _role: CommandRoleContext,
  context: CommandBarContext,
): CommandBarGroup[] {
  if (context === 'game-studio') {
    return [
      {
        id: 'game-studio',
        items: [...commandItemsByContext['game-studio']],
      },
    ]
  }

  return [...commandGroupsByContext[context]]
}

export function getGroupById(
  id: string,
  role: CommandRoleContext,
  context: CommandBarContext,
): CommandBarGroup | undefined {
  return getCommandBarGroups(role, context).find((group) => group.id === id)
}
