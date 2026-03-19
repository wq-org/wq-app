import {
  Hand,
  Home,
  MessagesSquare,
  MousePointer2,
  Plus,
  Search as SearchIcon,
  Settings as SettingsIcon,
  SplinePointer,
  Upload,
} from 'lucide-react'
import { USER_ROLES } from '@/features/auth'
import type {
  CommandBarContext,
  CommandBarGroup,
  CommandBarItem,
  CommandRoleContext,
} from '../types/command-bar.types'

const COMMAND_ROUTE_PREFIX_BY_ROLE: Record<CommandRoleContext, string> = {
  [USER_ROLES.TEACHER]: '/teacher',
  [USER_ROLES.INSTITUTION_ADMIN]: '/institution_admin',
  [USER_ROLES.STUDENT]: '/student',
  [USER_ROLES.SUPER_ADMIN]: '/super_admin',
}

const commandItemsByContext: Record<CommandBarContext, readonly CommandBarItem[]> = {
  [USER_ROLES.TEACHER]: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.TEACHER]}/dashboard`,
    },
    {
      id: 'search',
      labelKey: 'actions.search',
      icon: SearchIcon,
      actionId: 'search',
    },
    {
      id: 'studio',
      labelKey: 'actions.studio',
      icon: SplinePointer,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.TEACHER]}/game-studio`,
    },
    {
      id: 'chat',
      labelKey: 'actions.chat',
      icon: MessagesSquare,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.TEACHER]}/chat`,
    },
    {
      id: 'upload',
      labelKey: 'actions.upload',
      icon: Upload,
      actionId: 'upload',
    },
    {
      id: 'add-new',
      labelKey: 'actions.addNew',
      icon: Plus,
      actionId: 'add',
    },
  ],
  [USER_ROLES.INSTITUTION_ADMIN]: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.INSTITUTION_ADMIN]}/dashboard`,
    },
    {
      id: 'search',
      labelKey: 'actions.search',
      icon: SearchIcon,
      actionId: 'search',
    },
    {
      id: 'upload',
      labelKey: 'actions.upload',
      icon: Upload,
      actionId: 'upload',
    },
    {
      id: 'add-new',
      labelKey: 'actions.addNew',
      icon: Plus,
      actionId: 'add',
    },
  ],
  [USER_ROLES.STUDENT]: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.STUDENT]}/dashboard`,
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
      icon: MessagesSquare,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.STUDENT]}/chat`,
    },
    {
      id: 'upload',
      labelKey: 'actions.upload',
      icon: Upload,
      actionId: 'upload',
    },
    {
      id: 'add',
      labelKey: 'actions.addNew',
      icon: Plus,
      actionId: 'add',
    },
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    {
      id: 'home',
      labelKey: 'actions.dashboard',
      icon: Home,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.SUPER_ADMIN]}/dashboard`,
    },
    {
      id: 'search',
      labelKey: 'actions.search',
      icon: SearchIcon,
      actionId: 'search',
    },
    {
      id: 'upload',
      labelKey: 'actions.upload',
      icon: Upload,
      actionId: 'upload',
    },
    {
      id: 'add-new',
      labelKey: 'actions.addNew',
      icon: Plus,
      actionId: 'add',
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

const commandSystemItemsByRole: Record<CommandRoleContext, readonly CommandBarItem[]> = {
  [USER_ROLES.TEACHER]: [
    {
      id: 'settings',
      labelKey: 'actions.settings',
      icon: SettingsIcon,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.TEACHER]}/settings`,
    },
  ],
  [USER_ROLES.INSTITUTION_ADMIN]: [
    {
      id: 'settings',
      labelKey: 'actions.settings',
      icon: SettingsIcon,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.INSTITUTION_ADMIN]}/settings`,
    },
  ],
  [USER_ROLES.STUDENT]: [
    {
      id: 'settings',
      labelKey: 'actions.settings',
      icon: SettingsIcon,
      to: `${COMMAND_ROUTE_PREFIX_BY_ROLE[USER_ROLES.STUDENT]}/settings`,
    },
  ],
  [USER_ROLES.SUPER_ADMIN]: [],
}

const commandGroupsByContext: Record<CommandRoleContext, readonly CommandBarGroup[]> = {
  [USER_ROLES.TEACHER]: [
    {
      id: USER_ROLES.TEACHER,
      items: [...commandItemsByContext[USER_ROLES.TEACHER]],
    },
    {
      id: 'user',
      items: [...commandSystemItemsByRole[USER_ROLES.TEACHER]],
    },
  ],
  [USER_ROLES.INSTITUTION_ADMIN]: [
    {
      id: USER_ROLES.INSTITUTION_ADMIN,
      items: [...commandItemsByContext[USER_ROLES.INSTITUTION_ADMIN]],
    },
    {
      id: 'user',
      items: [...commandSystemItemsByRole[USER_ROLES.INSTITUTION_ADMIN]],
    },
  ],
  [USER_ROLES.STUDENT]: [
    {
      id: USER_ROLES.STUDENT,
      items: [...commandItemsByContext[USER_ROLES.STUDENT]],
    },
    {
      id: 'user',
      items: [...commandSystemItemsByRole[USER_ROLES.STUDENT]],
    },
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    {
      id: USER_ROLES.SUPER_ADMIN,
      items: [...commandItemsByContext[USER_ROLES.SUPER_ADMIN]],
    },
    {
      id: 'user',
      items: [...commandSystemItemsByRole[USER_ROLES.SUPER_ADMIN]],
    },
  ],
}

export function getRoutePrefixForRole(role: CommandRoleContext): string {
  return COMMAND_ROUTE_PREFIX_BY_ROLE[role]
}

export function getCommandGroupsByRole(role: CommandRoleContext): readonly CommandBarGroup[] {
  return commandGroupsByContext[role]
}

export function getCommandBarGroups(
  role: CommandRoleContext,
  context: CommandBarContext,
): CommandBarGroup[] {
  if (context === 'game-studio') {
    return [
      {
        id: 'game-studio',
        items: [...commandItemsByContext['game-studio']],
      },
      {
        id: 'user',
        items: [...commandSystemItemsByRole[role]],
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
