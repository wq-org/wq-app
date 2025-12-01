import { getBarGroups } from './commandBarGroups'
import type { Roles } from '@/lib/dashboard.types'
import type { CommandBarGroup } from '../types/command-bar.types'

type ActionMap = {
  search?: () => void | Promise<void>
  upload?: () => void | Promise<void>
  feedback?: () => void | Promise<void>
}

export function buildBarGroups(
  navigate: (to: string) => void,
  actions: ActionMap,
  role: Roles,
): CommandBarGroup[] {
  return getBarGroups(role).map((group) => ({
    id: group.id,
    items: group.items.map((item) => ({
      ...item,
      action: item.to
        ? () => navigate(item.to || '/')
        : () => actions[item.actionId as keyof ActionMap]?.(),
    })),
  }))
}
