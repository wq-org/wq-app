import { BarChart, BookOpen, Building2, Cloud, Gamepad2, HardDrive, LayoutGrid } from 'lucide-react'
import { USER_ROLES, isValidRole, type UserRole } from '@/features/auth'
import type { DashboardTab } from '../types/dashboard.types'

const DASHBOARD_TABS_BY_ROLE: Record<UserRole, readonly DashboardTab[]> = {
  [USER_ROLES.TEACHER]: [
    {
      id: 'courses',
      labelKey: 'tabs.courses',
      icon: BookOpen,
    },
    {
      id: 'cloud',
      labelKey: 'tabs.cloud',
      icon: Cloud,
    },
    {
      id: 'games',
      labelKey: 'tabs.games',
      icon: Gamepad2,
    },
  ],
  [USER_ROLES.STUDENT]: [
    {
      id: 'courses',
      labelKey: 'tabs.courses',
      icon: BookOpen,
    },
    {
      id: 'games',
      labelKey: 'tabs.games',
      icon: Gamepad2,
    },
    {
      id: 'cloud',
      labelKey: 'tabs.cloud',
      icon: Cloud,
    },
  ],
  [USER_ROLES.INSTITUTION_ADMIN]: [
    {
      id: 'database',
      labelKey: 'tabs.database',
      icon: HardDrive,
    },
    {
      id: 'overview',
      labelKey: 'tabs.overview',
      icon: LayoutGrid,
    },
    {
      id: 'analytics',
      labelKey: 'tabs.analytics',
      icon: BarChart,
    },
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    {
      id: 'forms',
      labelKey: 'tabs.forms',
      icon: Building2,
    },
    {
      id: 'institutions',
      labelKey: 'tabs.institutions',
      icon: Building2,
    },
    {
      id: 'overview',
      labelKey: 'tabs.overview',
      icon: LayoutGrid,
    },
    {
      id: 'analytics',
      labelKey: 'tabs.analytics',
      icon: BarChart,
    },
    {
      id: 'database',
      labelKey: 'tabs.database',
      icon: HardDrive,
    },
  ],
}

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  superadmin: USER_ROLES.SUPER_ADMIN,
  institutionadmin: USER_ROLES.INSTITUTION_ADMIN,
  teacher: USER_ROLES.TEACHER,
  student: USER_ROLES.STUDENT,
}

export const VALID_DASHBOARD_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.INSTITUTION_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.STUDENT,
] as const satisfies readonly UserRole[]

export function normalizeDashboardRole(
  role: string | UserRole | null | undefined,
): UserRole | null {
  if (!role) return null

  const normalizedRole = role.trim().toLowerCase()
  if (isValidRole(normalizedRole)) {
    return normalizedRole
  }

  return LEGACY_ROLE_MAP[normalizedRole] ?? null
}

export function getDashboardTabs(
  role: string | UserRole | null | undefined,
): readonly DashboardTab[] {
  const normalizedRole = normalizeDashboardRole(role)
  if (!normalizedRole) {
    return DASHBOARD_TABS_BY_ROLE[USER_ROLES.STUDENT]
  }

  return DASHBOARD_TABS_BY_ROLE[normalizedRole]
}
