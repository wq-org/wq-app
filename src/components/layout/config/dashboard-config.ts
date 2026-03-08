import {
  BarChart,
  Building2,
  FolderOpen,
  Gamepad2,
  HardDrive,
  LayoutGrid,
  BookOpen,
  // StickyNote,
  type LucideIcon,
} from 'lucide-react'

import { USER_ROLES, isValidRole } from '@/features/auth'
import type { Roles } from './dashboard.types'
import i18n from '@/locales/i18n'

/** Normalize role from API (snake_case or legacy camelCase) to Roles, or null if invalid. */
function normalizeRole(role: string | null | undefined): Roles | null {
  if (role == null || role === '') return null
  const r = role.trim().toLowerCase()
  if (isValidRole(r)) return r as Roles
  const legacy: Record<string, Roles> = {
    superadmin: USER_ROLES.SUPER_ADMIN,
    institutionadmin: USER_ROLES.INSTITUTION_ADMIN,
    teacher: USER_ROLES.TEACHER,
    student: USER_ROLES.STUDENT,
  }
  return legacy[r] ?? null
}

export interface DashboardTab {
  id: string
  label: string
  icon: LucideIcon
}

const getTabLabel = (tabId: string): string => {
  return i18n.t(`layout.dashboardLayout:tabs.${tabId}`)
}

const createTeacherTabs = (): DashboardTab[] => [
  { id: 'courses', label: getTabLabel('courses'), icon: BookOpen },
  { id: 'files', label: getTabLabel('files'), icon: FolderOpen },
  { id: 'games', label: getTabLabel('games'), icon: Gamepad2 },
  // { id: 'students', label: getTabLabel('students'), icon: Users2 },
  // { id: 'todos', label: getTabLabel('todos'), icon: LayoutList },
]

const createStudentTabs = (): DashboardTab[] => [
  { id: 'courses', label: getTabLabel('courses'), icon: BookOpen },
  { id: 'games', label: getTabLabel('games'), icon: Gamepad2 },
  { id: 'files', label: getTabLabel('files'), icon: FolderOpen },
  // { id: 'todos', label: getTabLabel('todos'), icon: LayoutList },
]

const createInstitutionAdminTabs = (): DashboardTab[] => [
  { id: 'database', label: getTabLabel('database'), icon: HardDrive },
  { id: 'overview', label: getTabLabel('overview'), icon: LayoutGrid },
  { id: 'analytics', label: getTabLabel('analytics'), icon: BarChart },
]

const createSuperAdminTabs = (): DashboardTab[] => [
  { id: 'forms', label: getTabLabel('forms'), icon: Building2 },
  { id: 'institutions', label: getTabLabel('institutions'), icon: Building2 }, // blocked for now
  { id: 'overview', label: getTabLabel('overview'), icon: LayoutGrid },
  { id: 'analytics', label: getTabLabel('analytics'), icon: BarChart },
  { id: 'database', label: getTabLabel('database'), icon: HardDrive },
]

export const teacherDashboardTabs = createTeacherTabs()
export const studentDashboardTabs = createStudentTabs()
export const institutionAdminDashboardTabs = createInstitutionAdminTabs()
export const superAdminDashboardTabs = createSuperAdminTabs()

export const VALID_ROLES: Roles[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.INSTITUTION_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.STUDENT,
]

export function getDashboardTabs(role: Roles | string | null | undefined): DashboardTab[] {
  const normalized = normalizeRole(role)
  if (normalized === USER_ROLES.TEACHER) {
    return teacherDashboardTabs
  }

  if (normalized === USER_ROLES.STUDENT) {
    return studentDashboardTabs
  }

  if (normalized === USER_ROLES.INSTITUTION_ADMIN) {
    return institutionAdminDashboardTabs
  }

  if (normalized === USER_ROLES.SUPER_ADMIN) {
    return superAdminDashboardTabs
  }

  return studentDashboardTabs
}
